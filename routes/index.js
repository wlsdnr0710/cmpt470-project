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
    var most_wanted_game = 0;
    var img = "";
    var name = "";
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
      if(foundgame){
        img =
          "http://media.steampowered.com/steamcommunity/public/images/apps/" +
          most_wanted_game +
          "/" +
          foundgame.imgLogoUrl +
          ".jpg";
        console.log(img);
      }
      User.find().then(function(err, users){
        console.log("users:",users);
        var dict = {};
        var test = [];
        // var counts = users.length;
        // for (var i = 0; i < users.length; i++) {
        //   console.log(user);
        //   users[i].numCompletedLists()
        //   .then(function(data) {
        //     console.log("user"+i+"'s lists completed: "+data);
        //     test.push(data);
        //     dict[users[i].username] = data;
        //     counts--;
        //     if(counts==0){
        //       console.log("EXIT");
        //       var users_arr = Object.keys(dict).map(function(key) {
        //         return [key, dict[key]];
        //       });
              
        //       console.log("arr: ",users_arr);
      
        //       // Sort the array based on the second element
        //       users_arr.sort(function(first, second) {
        //         return second[1] - first[1];
        //       });
              
        //       // Create a new array with only the first 5 items
        //       console.log("test: ",test)
        //       console.log("RESULT: ",users_arr);
        //       top_five = users_arr.slice(0, 5);
        //       console.log("RESULT: ",top_five);
        //       // console.log("topfive: ",top_five);
        //       if(foundgame){
        //         name = foundgame.name;
        //       }
        //       else{
        //         name = "none";
        //       }
      

            // }
                    //       console.log("completed", top_five);
        //       res.render("index", {
        //         popular: most_wanted_game,
        //         gamename: name,
        //         gameimage: img,
        //         topfive: top_five,
        //       })
        //   })
        //   .catch((err) => {
        //     console.error(err);
        //   });
        // } 
      });
    });
  });
});

module.exports = router;
