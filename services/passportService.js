const express = require('express');
const passport = require("passport");
const SteamStrategy = require("passport-steam").Strategy;
const fs = require("fs");
var User = require("../models/user");
const steamApi = require("./steamApi");
//grab steam key

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
  
passport.use(
    new SteamStrategy(
        {
            //i believe this will need to be changed to the domain URL where our site is deployed
            returnURL: "http://localhost:3000/login/steam",
            realm: "http://localhost:3000/",
            apiKey: "E8E95B7D362F3A6D263CBDFB6F694293",
        },
        function (identifier, profile, done) {
            process.nextTick(function () {
                profile.identifier = identifier;
                User.findOne({ steamId: profile.id }, function (err, user) {
                if (err) return console.log(err);
                //user exists
                if (user) return done(null, profile.id);

                steamApi.getOwnedGames(identifier, false, (err, games) => {
                    let ownedGameIds = games.map(game => game.appid);
                    User.create(
                        { 
                            steamId: profile.id, username: profile.displayName, ownedGameIds: ownedGameIds},
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

module.exports = passport