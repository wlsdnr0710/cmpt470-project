const User = require("../models/user");

// Get the title of every GameList.
exports.index = function (req, res, next) {
  User.find().exec((err, allUsers) => {
    if (err) return next(err);
    res.render("userlists", { users: allUsers });
  });
};