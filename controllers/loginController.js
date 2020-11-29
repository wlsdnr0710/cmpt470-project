const passport = require("passport");

exports.login = passport.authenticate("steam", {
  successRedirect: "/testdb",
  failureRedirect: "/login",
});

exports.checkIfLoggedIn = function (req, res, next) {
  if (!req.user) {
    return res.redirect("/login");
  }
  next();
};
