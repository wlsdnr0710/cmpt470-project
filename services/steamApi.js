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
  async.each(games, (game) => {
    Games.findOne({ appId: game.appid }).exec((err, game) => {
      if (err) return console.error(err);
      if (game) return; // Already cached.

      let cacheGame = new Game(
        game.appid,
        game.name,
        game.playtime_forever,
        game.img_icon_url,
        game.img_logo_url
      );

      cacheGame.save((err) => console.log(err));
    });
  });
}

// Loads the owned games from the user with id 'steamId' from
// the database, if they exist.
function tryLoadCachedGames(steamId, callback) {
  async.waterfall(
    [
      // Check that user with 'steamId' exists.
      (cb) => {
        Users.findOne({ id: steamId }).exec((err, user) => {
          if (err) return cb(err, null);
          cb(null, user);
        });
      },
      // Load the user's owned games.
      (user, cb) => {
        Games.find()
          .where("appId")
          .in(user.ownedGameIds) // NOTE: Relies on this being populated upon user creation!
          .exec((err, ownedGames) => {
            if (err) return cb(err);
            cb(null, ownedGames);
          });
      },
    ],
    function (err, ownedGames) {
      // Pass owned games data to callback.
      if (err) {
        console.log(err);
        return callback(err, null);
      }
      callback(null, ownedGames);
    }
  );
}

// Calls 'callback' with an array of games owned by the Steam user with id 'steamId'.
// Uses the Steam API GetOwnedGames endpoint:
// https://partner.steamgames.com/doc/webapi/IPlayerService#GetOwnedGames
// If the endpoint returns an empty response and the caller passes true for 'allowCache',
// then calls 'callback' with games queried from cached game data, if they exist.
exports.getOwnedGames = async function (steamId, allowCache, callback) {
  const request = {
    url: endpoints.getOwnedGames,
    params: {
      steamid: steamId, // Must be a string (not number) for request to work.
      include_appinfo: true,
      include_played_free_games: true,
      format: "json",
    },
  };

  axios(request)
    .then((res) => {
      if (emptyResponse(res) && allowCache)
        return tryLoadCachedGames(steamId, callback);

      const games = res.data.response.games;
      cacheGames(games); // Cache owned games for later use and pass to callback.
      callback(null, games);
    })
    .catch((err) => {
      console.error(err);
      callback(err, null);
    });
};
