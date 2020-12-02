const express = require("express");
const router = express.Router();
const async = require("async");
const Steam = require("../services/steamApi");

const GameList = require("../models/gameList");
const Game = require("../models/game");

router.get("/:glID", function(req, res, next) {
  GameList.model.findById(req.params.glID).exec((err, gameList) => {
    if (err) return next(err);
    if (req.user.steamId != gameList.creatorSteamId)
    {
      res.redirect("/userPage/");
    }

    Steam.getOwnedGames(req.user.steamId, true, (err, allOwnedGames) => {
      if (err) return next(err);

      // Of all the user's owned games, get those that are in this game list.
      var gamesInList = new Array(gameList.gameIds.length);
      gameList.gameIds.forEach(function(gId, ind) {
        let foundGame = allOwnedGames.find(game => (game.appid || game.appId) == gId);
        gamesInList[ind] = foundGame;
      });

      // Of all the user's owned games, get those that are not in this game list.
      let gamesNotInList = allOwnedGames.filter((game) =>
        !(gameList.gameIds.includes(game.appid || game.appId))
      );
      res.render("addGames", { 
        gameList: gameList, 
        listGameData: gamesInList, 
        ownedGameData: gamesNotInList,
        user: req.user
       });
    });
  });
});

module.exports = router;