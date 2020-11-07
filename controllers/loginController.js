const passport = require("passport");

exports.login = passport.authenticate("steam", {
    successRedirect: "/login",
    failureRedirect: "/login",
});