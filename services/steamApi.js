const Game = require("../models/game");
const User = require("../models/user");
const axios = require("axios").default;
const async = require("async");

// This module is responsible for handling queries to Steam API endpoints.

const steamApiKey = "E8E95B7D362F3A6D263CBDFB6F694293";

// Holds URLs for different Steam API endpoints.
const endpoints = {
  getOwnedGames:
    "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
    steamApiKey,
  getPlayerSummaries:
    "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/"
};

// Returns true if a JSON response is empty, false otherwise.
function emptyResponse(res) {
  return Object.keys(res).length === 0;
}

// Caches the given games in the database, if they are not already cached.
function cacheGames(games) {
  for (game of games) {
    Game.findOne({ appId: game.appid }, (err, found) => {
      if (err) return console.error(err);
      if (found) return; // Already cached.

      let cacheGame = new Game({
        appId: game.appid,
        name: game.name,
        playtimeForever: game.playtime_forever,
        imgIconUrl: game.img_icon_url,
        imgLogoUrl: game.img_logo_url,
      });

      cacheGame.save((err) => {
        if (err) console.error(err);
      });
    });
  }
}

// Loads the owned games from the user with id 'steamId' from
// the database, if they exist.
function tryLoadCachedGames(steamId, callback) {
  async.waterfall(
    [
      // Check that user with 'steamId' exists.
      (cb) => {
        User.findOne({ id: steamId }).exec((err, user) => {
          if (err) return cb(err, null);
          cb(null, user);
        });
      },
      // Load the user's owned games.
      (user, cb) => {
        Game.find()
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
        // TODO: Handle 429 error as well
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

exports.getPlayerSummaries = async function (user, callback) {
  const request = {
    url: endpoints.getPlayerSummaries,
    params: {
      key: steamApiKey,
      steamids: user.id,
      format: "json",
    },
  };

  try {
    const res = await axios(request);
    console.log(res);
    const summary = res.data.response.players[0];
    callback(summary);
  } catch (err) {
    console.log(err);
  }
};