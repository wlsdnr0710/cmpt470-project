const passport = require("passport");

exports.login = passport.authenticate("steam", {
    successRedirect: "/userPage",
    failureRedirect: "/login",
});