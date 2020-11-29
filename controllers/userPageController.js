const request = require("request");
const async = require("async");

const User = require("../models/user");
const GameList = require("../models/gameList");

const steamApi = require("../services/steamApi");
const user = require("../models/user");

exports.redirectToLoggedInPage = function (req, res, next) {
  res.redirect('/userPage/' + req.user._id);
};

exports.renderUserPagebyId = async function (req, res, next) {
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
  var pageUserAvatar;
  await steamApi.getPlayerSummaries(pageUser, function (summary) {
    pageUserAvatar = summary.avatarfull;
    
  });
  
  var gamesinfo = {};
  // http://store.steampowered.com/api/appdetails/appids=
  var authkey = "E8E95B7D362F3A6D263CBDFB6F694293";
  var profileGamesQuery =
    "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
    authkey +
    "&steamid=" +
    pageUser.steamId +
    "&include_appinfo=1&format=json";
  console.log("authkey: " + authkey);
  console.log("user.steamId: " + pageUser.steamId);
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
        console.log("avatar url: ", pageUserAvatar);
        res.render("userPage", {
          title: pageUser.username + " | Steam Rolled",
          user: req.user,
          pageUser: pageUser,
          loggedInUser: req.user,
          isLoggedInUserPage,
          gameLists: gamesLists,
          active: "profile",
          user_avatar: pageUserAvatar
        });
      });
    });
};

exports.renderFollowersPage = async function (req, res, next) {

  // assume page of logged in user
  var pageUser = req.user;
  var isLoggedInUserPage = true;
  if (req.user._id != req.params.id)
  {
    // assumption incorrect, page is not of logged in user
    pageUser = await User.findById(req.params.id);
    isLoggedInUserPage = false;
  }
  console.log("found user", pageUser);

  follower_users = new Array(pageUser.followers.length);
  for (var f_ind = 0; f_ind < pageUser.followers.length; f_ind++) {
    var id = pageUser.followers[f_ind];
    var user = await User.findById(id);
    console.log("user queried", user);
    follower_users[f_ind] = user;
  }

  console.log("follower users,", follower_users);
  followers_info = new Array(pageUser.followers.length);
  for (var follower_ind = 0; follower_ind < pageUser.followers.length; follower_ind++)
  {
    var user = follower_users[follower_ind];
    await steamApi.getPlayerSummaries(user, function (summary) {
      console.log(summary);
      // get name and avatar
      followers_info[follower_ind] = {
        personaname: summary.personaname,
        avatar: summary.avatar,
        pageUrl: "/userPage/" + pageUser.followers[follower_ind],
      };
    });
  }

  console.log("got info for all followers,", followers_info);
  res.render("followers", {
    title: pageUser.username + " | Steam Rolled",
    user: pageUser,
    isLoggedInUserPage,
    followers: followers_info,
  });
};

exports.renderFollowingPage = async function (req, res, next) {
  // assume page of logged in user
  var pageUser = req.user;
  var isLoggedInUserPage = true;
  if (req.user._id != req.params.id)
  {
    // assumption incorrect, page is not of logged in user
    pageUser = await User.findById(req.params.id);
    isLoggedInUserPage = false;
  }
  console.log("found user", pageUser);

  following_users = new Array(pageUser.following.length);
  for (var f_ind = 0; f_ind < pageUser.following.length; f_ind++) {
    var id = pageUser.following[f_ind];
    var user = await User.findById(id);
    console.log("user queried", user);
    following_users[f_ind] = user;
  }

  console.log("following users,", following_users);
  following_info = new Array(pageUser.following.length);
  async.forEach(pageUser.following, async function (following_id, done) {
    following_ind = pageUser.following.indexOf(following_id);
    var user = following_users[following_ind];
    await steamApi.getPlayerSummaries(user, function (summary) {
      console.log(summary);
      // get name and avatar
      following_info[following_ind] = {
        personaname: summary.personaname,
        avatar: summary.avatar,
        pageUrl: "/userPage/" + following_id,
      };
    });
    done();
  },
  function (async_err) {
    if (async_err)
    {
      console.log("Could not retrieve following info", async_err);
    }

    console.log("got info for all following,", following_info);
    res.render("following", {
      title: pageUser.username + " | Steam Rolled",
      user: pageUser,
      isLoggedInUserPage,
      allFollowed: following_info,
    });
  });
};
