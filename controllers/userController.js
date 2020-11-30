const User = require("../models/user");

// Get the title of every GameList.
exports.index = function (req, res, next) {
  User.find().exec((err, allUsers) => {
    if (err) return next(err);
    res.render("userlists", { users: allUsers });
  });
};

exports.followuser = async function (req, res, next) {
  console.log("pageUser: ", req.body.pageUserId);
  console.log("loggedInUser: ", req.body.loggedInUserId);
  var user = await User.find({ _id: req.body.loggedInUserId, following: `${req.body.pageUserId}`});
  console.log("user: ", user);
  if(!user[0]){
    console.log("in here");
    const result1 = await User.updateOne({_id: req.body.pageUserId},  { $push: {followers: [`${req.body.loggedInUserId}`] } });
    console.log(result1);
    const result2 = await User.updateOne({_id: req.body.loggedInUserId},  { $push: {following: [`${req.body.pageUserId}`] } });
    console.log(result2);
  }

  res.redirect(`/userPage/${req.body.pageUserId}`);
};

exports.unfollowuser = async function (req, res, next) {
  const result1 = await User.updateOne({_id: req.body.pageUserId},  { $pullAll: {followers: [`${req.body.loggedInUserId}`] } } );
  const result2 = await User.updateOne({_id: req.body.loggedInUserId},  { $pullAll: {following: [`${req.body.pageUserId}`] } } );
  console.log("result1: ",result1);
  console.log("result2: ", result2);
  res.redirect(`/userPage/${req.body.pageUserId}`);
};
