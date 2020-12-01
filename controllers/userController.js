const User = require("../models/user");

// Get the title of every GameList.
exports.index = function (req, res, next) {
  User.find().exec((err, allUsers) => {
    if (err) return next(err);
    res.render("userlists", { users: allUsers });
  });
};

exports.test = function (req, res, next) {
  res.redirect("/");
}

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
}

exports.unfollow = async function (req, res, next) {
  console.log("in unfollow controller");
  console.log("req.params.id: ", req.params.id)
  console.log("req.user: ", req.user)
  const result1 = await User.updateOne({_id: req.params.id},  { $pullAll: {followers: [`${req.user._id}`] } } );
  const result2 = await User.updateOne({_id: req.user._id},  { $pullAll: {following: [`${req.params.id}`] } } );
  console.log("result1: ",result1);
  console.log("result2: ", result2);
  res.redirect(`/userPage/${req.params.id}`);
}