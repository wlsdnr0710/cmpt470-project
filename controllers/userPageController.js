const request = require("request");
const async = require("async");

const User = require("../models/user");
const GameList = require("../models/gameList");

exports.redirectToLoggedInPage = function (req, res, next) {
  if (!req.user) {
    res.redirect("/login");
  }

  res.redirect('/userPage/' + req.user._id);
};

exports.renderUserPagebyId = async function (req, res, next) {
  if (!req.user) {
    res.redirect("/login");
  }

  // assume page of logged in user
  var pageUser = req.user;
  var isLoggedInUserPage = true;
  if (req.user._id != req.params.id)
  {
    // assumption incorrect, page is not of logged in user
    pageUser = await User.findById(req.params.id);
    isLoggedInUserPage = false;
    console.log("found user", pageUser);
  }

  var gamesinfo = {};
  // http://store.steampowered.com/api/appdetails/appids=
  var authkey = "E8E95B7D362F3A6D263CBDFB6F694293";
  var profileGamesQuery =
    "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
    authkey +
    "&steamid=" +
    pageUser.id +
    "&include_appinfo=1&format=json";
  console.log("authkey: " + authkey);
  console.log("user.id: " + pageUser.id);
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
      // for each game in user library
      for (var i = 0; i < data.response.game_count; i++)
      {
        // get various information about the game
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
        // store information in dict to be accessed later
        gamesinfo[gameid] = gameinfo;
      }
      console.log("checked all games");
      // Get ids all game lists user has created
      var userGameLists = new Array(pageUser.gameListIds.length);
      // for each game list, get the game ids within the list
      async.forEach(pageUser.gameListIds, function(gameListIdString, done)
      {
        console.log("gamelistid: ", gameListIdString);
        GameList.findById(gameListIdString).exec((err2, foundGameList) => {
          console.log("finding game ids for list");
          if (!err2) {
            console.log("found");
            // retrieve and store the found game ids
            // retain order of game lists as it is from the database
            //  so that they are displayed in the same order every time
            userGameLists[pageUser.gameListIds.indexOf(gameListIdString)] = foundGameList;
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
        // for each game lists (which only have game ids so far)
        // get information about each game from the previously defined dictionary
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
          gamesLists[gamesLists.length -1].gameDetailsUrl = "/gameDetail/" + pageUser.gameListIds[i];
        }

        console.log(gamesLists);
        res.render("userPage", {
          title: pageUser.username + " | Steam Rolled",
          user: pageUser,
          isLoggedInUserPage,
          gameLists: gamesLists,
        });
      });
    });
};