const express = require("express");
const request = require("request");
const async = require("async");
const router = express.Router();

const GameList = require("../models/gameList");
gameListsIndex = [
  { title: "game list 1", listid: "0" },
  { title: "game list 2", listid: "1" },
  { title: "game list 3", listid: "2" },
  { title: "game list 1", listid: "0" },
  { title: "game list 2", listid: "1" },
  { title: "game list 3", listid: "2" },
  { title: "game list 1", listid: "0" },
  { title: "game list 2", listid: "1" },
  { title: "game list 3", listid: "2" },
  { title: "game list 1", listid: "0" },
  { title: "game list 2", listid: "1" },
  { title: "game list 3", listid: "2" },
];

router.get("/", function (req, res, next) {
  if (!req.user) {
    res.redirect("/login");
  }

  var gamesinfo = [];
  // http://store.steampowered.com/api/appdetails/appids=
  var authkey = "E8E95B7D362F3A6D263CBDFB6F694293";
  var profileGamesQuery =
    "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
    authkey +
    "&steamid=" +
    req.user.id +
    "&include_appinfo=1&format=json";
  console.log("authkey: " + authkey);
  console.log("user.id: " + req.user.id);
  request.get(
    {
      url: profileGamesQuery,
      json: true,
      headers: { "User-Agent": "request" },
    },
    function (err, resp, data) {
      console.log("err: ", err);
      console.log("resp: ", resp);
      console.log("data: ", data);
      console.log("response of request, num of games: ", data.response.game_count);
      for (var i = 0; i < data.response.game_count; i++)
      {
        var gameid = data.response.games[i].appid;
        var gameinfo = {
          name: data.response.games[i].name,
          icon_url:
            "http://media.steampowered.com/steamcommunity/public/images/apps/" +
            data.response.games[i].appid +
            "/" +
            data.response.games[i].img_icon_url +
            ".jpg",
        };
        console.log("gameinfo: ", i, gameinfo);
        gamesinfo[gameid] = gameinfo;
      }
      console.log("checked all games");
      var userGameLists = new Array(req.user.gameListIds.length);
      async.forEach(req.user.gameListIds, function(gameListIdString, done)
      {
        console.log("gamelistid: ", gameListIdString);
        GameList.findById(gameListIdString).exec((err2, foundGameList) => {
          console.log("finding game ids for list");
          if (!err2) {
            console.log("found");
            userGameLists[req.user.gameListIds.indexOf(gameListIdString)] = foundGameList;
          }
          done();
        });
      },
      function(async_err)
      {
        if (async_err) {
          next(async_err);
        }
        
        userGameLists = userGameLists.filter(function(ids){
          return ids != undefined;
        });

        var gamesLists = [];
        for (var i = 0; i < userGameLists.length; i++) 
        {
          var gameIDsList = userGameLists[i].gameIds;
          console.log("list: ", gameIDsList);
          gamesLists.push({title: userGameLists[i].title});
          
          icon_urls = [];
          for(var j = 0; j < gameIDsList.length; j++) 
          {
            icon_urls.push(gamesinfo[gameIDsList[j]].icon_url);
            console.log("icon url: ", gamesinfo[gameIDsList[j]].icon_url);
          }
          gamesLists[gamesLists.length -1].icons = icon_urls;
          gamesLists[gamesLists.length -1].gameDetailsUrl = "/gameDetail/" + req.user.gameListIds[i];
        }

        console.log(gamesLists);
        res.render("userHome", {
          title: "Express",
          user: req.user,
          gameLists: gamesLists,
        });
      });
    });
});

module.exports = router;