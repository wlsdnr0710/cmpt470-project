const GameList = require("../models/gameList");
const Steam = require("../services/steamApi");
const axios = require("axios").default;
const superfetch = require("node-superfetch");
const async = require("async");

// Return index view. By default, the game lists are ordered by status.
exports.index = function (req, res, next) {
  GameList.model.find().exec((err, allGameLists) => {
    if (err) return next(err);
    res.render("testDbIndex", {
      gameLists: GameList.sort(allGameLists, GameList.SortFields.Status),
    });
  });
};

// Save a GameList to the db.
exports.create = function (req) {
  let gameList = new GameList.model({
    title: req.fields.title,
    description: req.fields.description,
    creatorSteamId: req.user.steamId,
  });

  gameList.save((err) => {
    if (err) console.error(err);
  });
};

// Updates an existing GameList in the db.
exports.update = async function (req) {
  console.log("UPDATE LIST");
  console.log("status,", req.fields.status);
  console.log("title,", req.fields.title);
  console.log("description,", req.fields.description);

  var gameList = await GameList.model.findById(req.params.id);
  gameList.status = req.fields.status;
  gameList.title = req.fields.title;
  gameList.description = req.fields.description;
  return await gameList.save();
};

// Deletes a GameList from the db.
exports.delete = function (req, res, next) {
  GameList.model.findOneAndRemove({ _id: req.params.id }, (err) => {
    if (err) return console.error(err);
    res.redirect("/userPage/" + req.user.id);
  });
};

// Get details of a particular GameList whose id is passed as a query parameter.
exports.details = function (req, res, next) {
  GameList.model.findById(req.params.id, function (err, user) {
      var gameIds = user.gameIds;
      var creatorSteamId = user.creatorSteamId;
      var steamkey = "E8E95B7D362F3A6D263CBDFB6F694293";
      var gameUserInfo = {};
      var gameUserInfos = [];
      var creatorInfoQuery = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + steamkey;
      var creatorInfoReq = {
          url: creatorInfoQuery,
          params: {
              steamid: creatorSteamId,
              include_appinfo: true, 
              include_played_free_games: false,
              format:"json",
          },
      };
      axios(creatorInfoReq)
          .then((result) => {
              for (i = 0; i < result.data.response.games.length; i++) {
                  var appid = result.data.response.games[i].appid;
                  if (!gameIds.includes(appid)) {
                      continue;
                  }
                  var playtime_forever = result.data.response.games[i].playtime_forever;
                  gameUserInfo = {
                      // HERE : add achievement status, if possible 
                      appid: appid,
                      playtime: Math.round(playtime_forever/6.0) / 10,
                  };
                  gameUserInfos.push(gameUserInfo);
              }
              // creator user info ready : get gamelist game detailed info
              var finalInfos = [];
              var finalInfo = {};
              var gameInfoURL = "https://store.steampowered.com/api/appdetails?appids="
              async.forEachOf(
                  gameIds,
                  (id, placeholder, cb) => {
                      superfetch
                          .get("https://store.steampowered.com/api/appdetails?appids=" + id)
                          .then((result)=> {
                              let gameInfo = JSON.parse(result.text.replace(/<br>/g, "\\n").replace(/<[^>]*>/g, ""));
                              if (gameInfo[id].success){
                                var genres = [];
                                for (i in gameInfo[id].data.genres) {
                                  genres.push(gameInfo[id].data.genres[i].description);
                                }
                                console.log(genres)
                                finalInfo = {
                                    name: gameInfo[id].data.name,
                                    image: gameInfo[id].data.header_image,
                                    short_description: gameInfo[id].data.short_description,
                                    developers: gameInfo[id].data.developers,
                                    isFree: gameInfo[id].data.is_free,
                                    price: !gameInfo[id].data.is_free ? gameInfo[id].data.price_overview.final_formatted : undefined,
                                    discount: !gameInfo[id].data.is_free ? gameInfo[id].data.price_overview.discount_percent : undefined,
                                    genre: genres,
                                    creatorPlaytime: gameUserInfos.find(el => el.appid == id).playtime,
                                };
                                finalInfos.push(finalInfo);
                              }
                              cb();
                          }, (err) => {
                              console.log("failed to fetch");
                              console.log(err);
                              cb(err);
                          });
                  },
                  (err) => {
                      if (err) {
                          console.log('error');
                          return next(err);
                      }
                      res.render("gameDetail", { info: finalInfos , title: user.title, description: user.description, creator: user.creatorUsername });
                  }
              );
          })
          .catch((err) => console.log(err));
  });
}


// function (req, res, next) {
//   GameList.model.findById(req.params.id).exec((err, gameList) => {
//     if (err) return next(err);
//     Steam.getOwnedGames(req.user.steamId, true, (err, allOwnedGames) => {
//       if (err) return next(err);

//       // Of all the user's owned games, return those that are in this game list.
//       let gamesInList = allOwnedGames.filter((game) =>
//         gameList.gameIds.includes(game.appid)
//       );
//       res.render("testDbDetail", { gameList: gameList, gameData: gamesInList });
//     });
//   });
// };

// Adds the game with id 'gameId' to the game list with id 'gameListId'.
exports.addGame = async function (gameId, gameListId, res, next) {
  gameList = await GameList.model.findById(gameListId);
  gameList.gameIds.push(gameId);
  var r = await gameList.save();
  res.redirect("/addGames/"+gameListId);
};

exports.addGameToList = async function (req, res, next) {
  return await exports.addGame(req.query.ownedGame, req.params.id, res, next);
}

// Removes the game with id 'gameId' from the game list with id 'gameListId'.
exports.removeGame = async function (gameId, gameListId, res) {
  GameList.model.findById(gameListId).exec((err, gameList) => {
    if (err) return console.error(err);
    let index = gameList.gameIds.indexOf(gameId);
    if (index < 0)
      return console.error(
        `gameId: ${gameId} not found in gameList: ${gameListId}`
      );
    gameList.gameIds.splice(index, 1);
    gameList.save((err) => {
      if (err) console.error(err);
      res.redirect("/addGames/" + gameListId);
    });
  });
};

exports.removeGameFromList = async function (req, res, next) {
  await exports.removeGame(req.params.gID, req.params.glID, res);
}

