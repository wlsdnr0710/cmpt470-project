const passport = require("passport");

exports.login = passport.authenticate("steam", {
  successRedirect: "/testDb",
  failureRedirect: "/login",
});
