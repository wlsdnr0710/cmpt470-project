const express = require("express");
const router = express.Router();
const GameList = require("../models/gameList");
const User = require("../models/user");
const Game = require("../models/game");

/* GET home page. */
router.get("/", function (req, res, next) {
  // User.find({gameIds: { $ne: null }}).exec((err, foundGameList) => {
  // check users completed lists for leaderboard
  // }
  GameList.model.find({ gameIds: { $ne: null } }).exec((err, foundGameList) => {
    if (err) return next(err);
    // need mark as completed to check
    var dict = {};
    //Do something
    for (var i = 0; i < foundGameList.length; i++) {
      for (var j = 0; j < foundGameList[i].gameIds.length; j++) {
        var key = foundGameList[i].gameIds[j];
        if (key in dict) {
          dict[key] += 1;
        } else {
          dict[key] = 1;
        }
      }
    }

    // go through all lists and accumulate unique ids
    var appearance = 0;
    for (var key in dict) {
      if (dict[key] > appearance) {
        appearance = dict[key];
        most_wanted_game = key;
      }
    }
    // console.log(dict);
    console.log(most_wanted_game);
    // img_logo_url
    // res.render("testDbDetail", { gameList: foundGameList });
    // Game.find({appId: most_wanted_game}).exec((err, foundgame) => {
    Game.findOne({ appId: most_wanted_game }).exec((err, foundgame) => {
      if (err) return next(err);
      console.log(" GAME", foundgame);
      img =
        "http://media.steampowered.com/steamcommunity/public/images/apps/" +
        most_wanted_game +
        "/" +
        foundgame.imgLogoUrl +
        ".jpg";
      console.log(img);

      User.find().exec((err, users) => {
        top_five = [];

        for (var i = 0; i < users.length; i++) {
          // dict[users[i]] = users[i].games_completed;
        }
        // var obj = {a: 1, b: 2};
        var obj = {};
        console.log("OBJ!", obj);
        for (var i = 0; i < users.length; i++) {
          if (Object.keys(obj).length === 0) {
            break;
          }
          var result = Object.keys(obj).reduce(function (a, b) {
            return obj[a] > obj[b] ? a : b;
          });
          console.log("result!", result);
          top_five.push({ name: result, count: obj[result] });
          delete obj[result];
        }
        console.log("completed", top_five);
        res.render("index", {
          popular: most_wanted_game,
          gamename: foundgame.name,
          gameimage: img,
          topfive: top_five,
        });
      });
    });
  });
});

module.exports = router;
