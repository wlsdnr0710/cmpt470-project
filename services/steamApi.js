const Game = require("../models/game");
const User = require("../models/user");
const axios = require("axios").default;
const async = require("async");

// This module is responsible for handling queries to Steam API endpoints.

// TODO: Use another api key if this one isn't working
const steamApiKey = "FEF3604CF3452FE9F597879DA82642DA";

// Holds URLs for different Steam API endpoints.
const endpoints = {
  getOwnedGames:
    "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
    steamApiKey,
  getPlayerSummaries:
    "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/",
};

// Returns true if there was a problem in an HTTP response, false otherwise.
// In particular, if there was an error or if the response is empty.
function problemInResponse(res) {
  return res.status >= 400 || Object.keys(res.data.response).length === 0;
}

// Caches the given games in the database, if they are not already cached.
function cacheGames(games) {
  for (game of games) {
    let filter = { appid: game.appid };
    let update = {
      appid: game.appid,
      name: game.name,
      playtime_forever: game.playtime_forever,
      img_icon_url: game.img_icon_url,
      img_logo_url: game.img_logo_url,
    };

    // Creates a cached game if it does not exist, otherwise updates it. The update
    // is not particularly relevant.
    Game.findOneAndUpdate(filter, update, { upsert: true }, (err) => {
      if (err) console.log(err);
    });
  }
}

// Loads the owned games from the user with id 'steamId' from
// the database, if they exist.
function tryLoadCachedGames(uSteamId, callback) {
  async.waterfall(
    [
      // Check that user with 'steamId' exists.
      (cb) => {
        User.findOne({ steamId: uSteamId }).exec((err, user) => {
          if (err) return cb(err, null);
          cb(null, user);
        });
      },
      // Load the user's owned games.
      (user, cb) => {
        Game.find()
          .where("appid")
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
      const games = res.data.response.games;
      // console.log("response result", res.data.response);
      // console.log("games result", games);
      // console.log(emptyResponse(res.data.response));
      if (problemInResponse(res) && allowCache) {
        // TODO: Handle 429 error as well
        console.log("Loading from cache");
        return tryLoadCachedGames(steamId, callback);
      }

      //const games = res.data.response.games;
      //console.log("response result", res.data.response);
      //console.log("games result", games);
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
      steamids: user.steamId,
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

exports.getPlayerSummariesWithSteamId = async function (user, callback) {
  const request = {
    url: endpoints.getPlayerSummaries,
    params: {
      key: steamApiKey,
      steamids: user,
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
