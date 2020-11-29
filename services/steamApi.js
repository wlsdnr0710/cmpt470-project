const Users = require("../models/user");
const axios = require("axios").default;

// This module is responsible for handling queries to Steam API endpoints.

// Holds URLs for different Steam API endpoints.
const endpoints = {
  getPlayerSummaries:
    "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/",
};

exports.getPlayerSummaries = async function (user, callback) {
  const apiKey = "E8E95B7D362F3A6D263CBDFB6F694293";
  const request = {
    url: endpoints.getPlayerSummaries,
    params: {
      key: apiKey,
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

