const express = require("express");
const router = express.Router();
const GameList = require("../models/gameList");
const User = require("../models/user");
const Game = require("../models/game");

/* GET home page. */
router.get("/", function (req, res, next) {
  GameList.model.find().exec((err, foundGameList) => {
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
      // console.log(" GAME", foundgame);
      img =
        "http://media.steampowered.com/steamcommunity/public/images/apps/" +
        most_wanted_game +
        "/" +
        foundgame.imgLogoUrl +
        ".jpg";
      console.log(img);

      User.find().exec((err, users) => {
        var dict = {};
        for (var i = 0; i < users.length; i++) {
          var x =users[i].numCompletedLists().then(function(result) {
            // here you can use the result of promiseB
            console.log(users[i]);
            dict[users[i].username] = result;
            console.log("user"+i+"'s lists completed: "+result);
          })
          .catch(console.log(err)) ;
        }

        var users_arr = Object.keys(dict).map(function(key) {
          return [key, dict[key]];
        });
        
        // Sort the array based on the second element
        users_arr.sort(function(first, second) {
          return second[1] - first[1];
        });
        
        // Create a new array with only the first 5 items
        top_five = users_arr.slice(0, 5);
        console.log("RESULT: ",users_arr.slice(0, 5));


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
