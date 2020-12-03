const User = require("../models/user");
const Game = require("../models/game");
const GameList = require("../models/gameList");

exports.index = function (req, res, next) {
    GameList.model.find().exec((err, foundGameList) => {
        // console.log(foundGameList);
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
        for (var key in dict) {
            if (dict[key] > appearance) {
                appearance = dict[key];
                most_wanted_game = key;
            }
        }
        // console.log(most_wanted_game);
        Game.find({ appid: most_wanted_game }).exec((err, foundgame) => {
            if (err) {console.log(err)};
            // console.log(" GAME", foundgame);
            if(foundgame){
                img =
                "http://media.steampowered.com/steamcommunity/public/images/apps/" +
                most_wanted_game +
                "/" +
                foundgame[0].img_logo_url +
                ".jpg";
                // console.log(img);
            }
            User.find().exec((err, users) => {
                // console.log(" INNER FOUND GAME", foundgame);
                // console.log("users:",users);
                var dict = {};
                var arr = [];
                var counts = users.length;
                for(var i=0;i<users.length;i++){
                    dict[users[i].username] = 0;
                }

                for (var i = 0; i < users.length; i++) {
                    users[i].numCompletedLists().then(data=>{
                        arr.push(data);
                        counts --;
                        if(counts==0){
                            for (var key in dict) {
                                dict[key] = arr[counts];
                                counts++;
                            }
                            // console.log("final dict after:",dict);

                            var users_arr = Object.keys(dict).map(function(key) {
                                return [key, dict[key]];
                            });
                            // console.log(users_arr);
                            // Sort the array based on the second element
                            users_arr.sort(function(first, second) {
                                return second[1] - first[1];
                            });
                            // console.log(users_arr);

                            // // Create a new array with only the first 5 items
                            // console.log("RESULT: ",users_arr);
                            var top_five = [];
                            top_five = users_arr.slice(0, 5);

                            // console.log("RESULT: ",top_five);
                            // console.log("topfive: ",top_five);
                            var name = "";
                            if(foundgame){
                                name = foundgame[0].name;
                            }
                            else{
                                name = "none";
                            }
                            // console.log(img);
                            res.render("index", {
                            popular: most_wanted_game,
                            gamename: name,
                            gameimage: img,
                            topfive: top_five,
                            }); 
                        }  
                    })
                    .catch(console.log(err))
                }
            });
        });
    });
};
