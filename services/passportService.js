const passport = require("passport");
const SteamStrategy = require("passport-steam").Strategy;
var User = require("../models/user");
const steamApi = require("./steamApi");
const envs = require("./env").envs;
const currEnv = require("./env").currEnv;

//passport for persistent login sessions
passport.serializeUser(function (steamId, done) {
  done(null, steamId);
});

passport.deserializeUser(function (id, done) {
  User.findOne({ steamId: id }, function (err, user) {
    done(err, user);
  });
  //done(null, obj);
});

const isProduction = currEnv === envs.PRODUCTION;

passport.use(
  new SteamStrategy(
    {
      returnURL: isProduction
        ? "http://steam-rolled.wl.r.appspot.com/login/steam"
        : "http://localhost:3000/login/steam",
      realm: isProduction
        ? "http://steam-rolled.wl.r.appspot.com/"
        : "http://localhost:3000/",
      apiKey: "E8E95B7D362F3A6D263CBDFB6F694293",
    },
    function (identifier, profile, done) {
      process.nextTick(function () {
        profile.identifier = identifier;
        User.findOne({ steamId: profile.id }, function (err, user) {
          if (err) return console.log(err);
          //user exists
          if (user) return done(null, profile.id);
          steamApi.getOwnedGames(profile.id, false, (err, games) => {
            console.log("games: ", games);
            let ownedGameIds = games.map((game) => game.appid);
            User.create(
              {
                steamId: profile.id,
                username: profile.displayName,
                ownedGameIds: ownedGameIds,
              },
              function (err, user) {
                if (err) return handleError(err);
              }
            );
          });
          return done(null, profile.id);
        });
      });
    }
  )
);

module.exports = passport;
