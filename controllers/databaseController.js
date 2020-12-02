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

exports.details = function (req, res, next) {
  GameList.model.findById(req.params.id, function (err, gamelist) {
    if (err) return next(err);
    var gamelistCreatorInfos = new Array(gamelist.gameIds.length);
    var username = "Anonymous";
    Steam.getPlayerSummariesWithSteamId(gamelist.creatorSteamId, function(summary) {
      username = summary.personaname
    });

    Steam.getOwnedGames(gamelist.creatorSteamId, true, (err, allOwnedGames) => {
      if(err) return next(err);
      gamelist.gameIds.forEach(function (gameId, index) {
        let foundUserInfo = allOwnedGames.find(game => (game.appid || game.appId) == gameId);
        gamelistCreatorInfos[index] = foundUserInfo;
      });
      // creator info - playtime ready
      var finalInfos = new Array(gamelist.gameIds.length);
      async.forEachOf(
        gamelist.gameIds,
        (id, index, cb) => {    
            superfetch
                .get("https://store.steampowered.com/api/appdetails?appids=" + id)
                .then((result)=> {
                    let gameInfo = JSON.parse(result.text.replace(/<br>/g, "\\n").replace(/<[^>]*>/g, ""));
                    if (gameInfo[id].success){
                      var genres = [];
                      for (i in gameInfo[id].data.genres) {
                        genres.push(gameInfo[id].data.genres[i].description);
                      }
                      // console.log(genres)
                      finalInfo = {
                          name: gameInfo[id].data.name,
                          image: gameInfo[id].data.header_image,
                          short_description: gameInfo[id].data.short_description,
                          developers: gameInfo[id].data.developers,
                          isFree: gameInfo[id].data.is_free,
                          price: !gameInfo[id].data.is_free ? gameInfo[id].data.price_overview.final_formatted : undefined,
                          discount: !gameInfo[id].data.is_free ? gameInfo[id].data.price_overview.discount_percent : undefined,
                          genre: genres,
                          creatorPlaytime:Math.round((gamelistCreatorInfos.find(el => el.appid == id).playtime_forever)/6.0)/10,
                      };
                      finalInfos[index] = finalInfo;
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
            res.render("gameDetail", { info: finalInfos , title: gamelist.title, description: gamelist.description, creator: username, active: "profile", user: req.user });
        }
    );

    });
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
exports.addGame = async function (gameId, ind, gameListId, res, next) {
  gameList = await GameList.model.findById(gameListId);
  gameList.gameIds.splice(ind, 0, gameId);
  var r = await gameList.save();
  res.redirect("/addGames/"+gameListId);
};

exports.addGameToList = async function (req, res, next) {
  let ind = parseInt(req.query.position)-1;
  return await exports.addGame(req.query.ownedGame, ind, req.params.id, res, next);
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

