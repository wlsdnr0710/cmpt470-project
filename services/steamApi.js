const Games = require("../models/game");
const Users = require("../models/user");
const axios = require("axios").default;
const async = require("async");

// This module is responsible for handling queries to Steam API endpoints.

const steamApiKey = "E8E95B7D362F3A6D263CBDFB6F694293";

// Holds URLs for different Steam API endpoints.
const endpoints = {
  getOwnedGames:
    "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
    steamApiKey,
};

// Returns true if a JSON response is empty, false otherwise.
function emptyResponse(res) {
  return Object.keys(res).length === 0;
}

// Caches the given games in the database, if they are not already cached.
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

function tryLoadCachedGames(steamId, callback) {
  async.waterfall(
    [
      (cb) => {
        // Load user if they exist.
        Users.findOne({ id: steamId }).exec((err, user) => {
          if (err) return cb(err);
          cb(null, user);
        });
      },
      (user, cb) => {
        // Load game data for the user's owned games.
        Games.find()
          .where("appid")
          .in(user.ownedGameIds)
          .exec((err, ownedGames) => {
            if (err) return cb(err);
            cb(null, ownedGames);
          });
      },
    ],
    function (err, ownedGames) {
      // Pass owned games data to callback.
      if (err) return console.log(err);
      callback(ownedGames);
    }
  );
}

// Calls 'callback' with an array of games owned by the Steam user with id 'steamId'.
// Uses the Steam API GetOwnedGames endpoint:
// https://partner.steamgames.com/doc/webapi/IPlayerService#GetOwnedGames
// If the endpoint returns an empty response, calls 'callback' with games queried from
// cached game data, if possible.
exports.getOwnedGames = async function (steamId, callback) {
  // Note that the steamId must be a string (not a number) for the axios request to work.
  const request = {
    url: endpoints.getOwnedGames,
    params: {
      steamid: steamId,
      include_appinfo: true,
      include_played_free_games: true,
      format: "json",
    },
  };

  axios(request)
    .then((res) => {
      if (emptyResponse(res)) {
        return tryLoadCachedGames(steamId, callback);
      }
      const games = res.data.response.games;
      // Cache owned games for later use and pass to callback.
      cacheGames(games);
      callback(games);
    })
    .catch((err) => {
      console.error(err);
    });
};
