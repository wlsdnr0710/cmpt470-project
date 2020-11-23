const GameList = require("../models/gameList");
const Games = require("../models/game");
const Users = require("../models/user");
const axios = require("axios").default;

const endpoints = {
  getOwnedGames:
    "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=",
};

// Get the title of every GameList.
exports.index = function (req, res, next) {
  GameList.find().exec((err, allGameLists) => {
    if (err) return next(err);
    for (i = 0; i < allGameLists.length; i++) {
      console.log(allGameLists[i]);
    }
    res.render("testDbIndex", { gameLists: allGameLists });
  });
};

// Get the GameList creation page.
exports.createGet = function (req, res) {
  res.render("testDbCreateList");
};

// Save a GameList to the db.
exports.createPost = function (req, res, next) {
  let gameList = new GameList({
    title: req.body.title,
    description: req.body.description,
    creatorUsername: req.body.creatorUsername,
  });

  gameList.save((err) => {
    if (err) return next(err);
    res.redirect(gameList.testUrl);
  });
};

// Get details of a particular GameList.
exports.details = function (req, res, next) {
  GameList.findById(req.params.id).exec((err, foundGameList) => {
    if (err) return next(err);
    res.render("testDbDetail", { gameList: foundGameList });
  });
};

// Returns true if a JSON response is empty, false otherwise.
function emptyResponse(res) {
  return Object.keys(res).length === 0;
}

// Caches the given games in the database. If the game does not exist, a
// new game is created and saved. If the game exists, does nothing.
function cacheGames(games) {
  for (let game of games) {
    Games.findOne({ appId: game.appid }, function (err) {
      if (!err) return; // Game is already cached.
      let cacheGame = new Game(
        game.appid,
        game.name,
        game.playtime_forever,
        game.img_icon_url,
        game.img_logo_url
      );
      cacheGame.save((err) => {
        console.log(err);
      });
    });
  }
}

// Calls Steam API GetOwnedGames with the given Steam user id and then
// calls callback with the games contained in the response.
exports.getOwnedGames = async function (steamId, callback) {
  const apiKey = "E8E95B7D362F3A6D263CBDFB6F694293";
  const request = {
    url: endpoints.getOwnedGames,
    params: {
      key: apiKey,
      steamid: steamId,
      include_appinfo: true,
      include_played_free_games: true,
      format: "json",
    },
  };

  try {
    const res = await axios(request);
    // The response will be empty {} if the endpoint is not working (not an error).
    if (emptyResponse(res)) {
      // Use cached games, if possible.
      Users.findOne({ id: steamId }).exec((err, user) => {
        if (err) return console.log(err);
        // Create an array of games where appid is user.ownedGameIds, then pass to callback.
      });
    }

    const games = res.response.games;
    cacheGames(games);
    callback(games);
  } catch (err) {
    console.log(err);
  }
};
