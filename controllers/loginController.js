const passport = require("passport");

exports.login = passport.authenticate("steam", {
    successRedirect: "/userHome",
    failureRedirect: "/login",
});