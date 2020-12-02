const async = require("async");
const User = require("../models/user");
const GameList = require("../models/gameList");
const steamApi = require("../services/steamApi");

exports.redirectToLoggedInPage = function (req, res, next) {
  res.redirect("/userPage/" + req.user._id);
};

/*
  browsingUser: the user currently browsing the profile
  profileUser: the owner of the profile
  browsingUser may be a different user, or the profileUser.
 */
exports.renderUserPagebyId = async function (req, res, next) {
  let browsingUser = req.user;
  let browsingUserOwnsPage = req.user._id == req.params.id;

  let profileUser = browsingUserOwnsPage
    ? browsingUser
    : await User.findById(req.params.id);

  let profileAvatar;
  await steamApi.getPlayerSummaries(
    profileUser,
    (summary) => (profileAvatar = summary.avatarfull)
  );

  GameList.model
    .find({ creatorSteamId: profileUser.steamId })
    .exec((err, userGameLists) => {
      if (err) return next(err);
      let completedLists = userGameLists.filter((gl) => 
        gl.status == GameList.Status.Completed
      );
      console.log(userGameLists);
      console.log(completedLists);
      res.render("userPage", {
        user: browsingUser,
        profileAvatar: profileAvatar,
        profileUser: profileUser,
        browsingUserOwnsPage: browsingUserOwnsPage,
        browsingUser: browsingUser,
        gameLists: GameList.sort(userGameLists, GameList.SortFields.Status),
        listsCreated: userGameLists.length,
        listsCompleted: completedLists.length,
        active: "profile"
      });
    });
};

exports.renderFollowersPage = async function (req, res, next) {
  // assume page of logged in user
  var pageUser = req.user;
  var isLoggedInUserPage = true;
  if (req.user._id != req.params.id) {
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
  for (
    var follower_ind = 0;
    follower_ind < pageUser.followers.length;
    follower_ind++
  ) {
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
    user: req.user,
    pageUser: pageUser,
    isLoggedInUserPage,
    followers: followers_info,
  });
};

exports.renderFollowingPage = async function (req, res, next) {
  // assume page of logged in user
  var pageUser = req.user;
  var isLoggedInUserPage = true;
  if (req.user._id != req.params.id) {
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
  async.forEach(
    pageUser.following,
    async function (following_id, done) {
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
      if (async_err) {
        console.log("Could not retrieve following info", async_err);
      }

      console.log("got info for all following,", following_info);
      res.render("following", {
        title: pageUser.username + " | Steam Rolled",
        user: req.user,
        pageUser: pageUser,
        isLoggedInUserPage,
        allFollowed: following_info,
      });
    }
  );
};
