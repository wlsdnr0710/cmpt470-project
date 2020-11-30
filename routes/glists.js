const express = require("express");
const router = express.Router();
const axios = require("axios").default;
const GameList = require("../models/gameList");

// dummy curret gamelists page
router.get("/", function (req, res, next) {
  res.render("glistsCreateButton", { user: req.user });
});

// create gamelist, choose from owned games
router.get("/createform", function (req, res, next) {
  var steamkey = "E8E95B7D362F3A6D263CBDFB6F694293";
  var id = req.user.steamId;
  var reduced_games = [];
  var reduced_game = {};
  // we could maybe our own simple api/function to do this call later, for now just use plain query
  // game count cut off, or some kind of sort
  var query =
    "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
    steamkey;
  var req = {
    // `url` is the server URL that will be used for the request
    url: query,
    params: {
      steamid: id,
      include_appinfo: true,
      include_played_free_games: false,
      format: "json",
    },
  };

  axios(req)
    .then((result) => {
      for (i = 0; i < result.data.response.games.length; i++) {
        var appid = result.data.response.games[i].appid;
        var logo = result.data.response.games[i].img_logo_url;
        var playtime_forever = result.data.response.games[i].playtime_forever;
        reduced_game = {
          appid: appid,
          name: result.data.response.games[i].name,
          img:
            "http://media.steampowered.com/steamcommunity/public/images/apps/" +
            appid +
            "/" +
            logo +
            ".jpg",
          playtime: Math.round(playtime_forever/6.0) / 10,
        };
        reduced_games.push(reduced_game);
        reduced_games.sort((a, b) => {
          return b.playtime - a.playtime;
        })
        // for (i = 0; i < reduced_games.length; i++) {
        //   console.log(reduced_games[i].appid+"\n");
        //   console.log(reduced_games[i].name+"\n");
        //   console.log(reduced_games[i].logo+"\n");
        // }
      }
      res.render("glistsCreateForm", {
        user: req.user,
        steamId: id,
        reduced_games: reduced_games,
      });
    })
    .catch((err) => console.log(err));
});

// send fomr, not sure how to add to db
router.post("/createform", function (req, res, next) {
  // add the stuff here
  // show a flash msg maybe
  console.log("here");
  console.log("sending data");
  console.log(req.body);
  console.log(req.body.gameIds);

  // show a flash msg maybe 
  // TODO: add more elements 
  console.log("adding to db");
  var gameList = new GameList({
    title: req.body.title,
    creatorSteamId: req.body.steamId, // I think using both will be better
    description: req.body.description,
    //createdDate: ,
    gameIds: req.body.gameIds, //{ type: [Number] } // Steam game appids
    //status: , 
  });

  gameList.save((err) => {
    if (err) return next(err);

    let currUser = req.user;
    currUser.gameListIds.push(gameList._id);
    currUser.save();

    res.redirect(gameList.detailsUrl);
  });
});

module.exports = router;
