const User = require("../models/user");
const steamApi = require("../services/steamApi");
// Get the title of every GameList.
exports.index = async function (req, res, next) {
  var allUsers = await User.find();
  var user_info = new Array(allUsers.length);
  for (var user_index = 0; user_index < allUsers.length; user_index++) {
    var user = allUsers[user_index];
    await steamApi.getPlayerSummaries(user, function (summary) {
      console.log(summary);
      // get name and avatar
      user_info[user_index] = {
        personaname: summary.personaname,
        avatar: summary.avatar,
        pageUrl: "/userPage/" + user._id,
      };
    });
  }
  res.render("userlists", {
    title: "Search | Steam Rolled",
    user: req.user,
    loggedInUser: req.user,
    users: allUsers,
    user_info: user_info,
    active: "search"
  });
};


exports.follow = async function (req, res, next) {
  console.log("in follow controller");
  console.log("req.params.id: ", req.params.id)
  console.log("req.user: ", req.user)
  var user = await User.find({_id: req.user._id, following: `${req.params.id}`});
  console.log('user:', user);
  if(!user[0]) {
    const result1 = await User.updateOne({_id: req.params.id}, { $push: {followers: [`${req.user._id}`]}});
    const result2 = await User.updateOne({_id: req.user._id}, { $push: {following: [`${req.params.id}`]}});
    console.log("result1: ",result1);
    console.log("result2: ", result2);
  }
  res.redirect(`/userPage/${req.params.id}`);
};

exports.unfollow = async function (req, res, next) {
  console.log("in unfollow controller");
  console.log("req.params.id: ", req.params.id)
  console.log("req.user: ", req.user)
  const result1 = await User.updateOne({_id: req.params.id},  { $pullAll: {followers: [`${req.user._id}`] } } );
  const result2 = await User.updateOne({_id: req.user._id},  { $pullAll: {following: [`${req.params.id}`] } } );
  console.log("result1: ",result1);
  console.log("result2: ", result2);
  res.redirect(`/userPage/${req.params.id}`);
};