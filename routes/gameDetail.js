const express = require("express");
const router = express.Router();
const superfetch = require("node-superfetch");
const async = require("async");

const GameList = require("../models/gameList");

// TODO: Please move functions into a controller called gameController.

function search(id, cb) {
  if (!parseInt(id)) return cb("The App ID must be a number", null);
  superfetch
    .get("https://store.steampowered.com/api/appdetails?appids=" + id)
    .then((game) => {
      let gameInfo = JSON.parse(
        game.text.replace(/<br>/g, "\\n").replace(/<[^>]*>/g, "")
      );
      if (gameInfo[id].success === false) return cb("Game not found", null);
      cb(null, gameInfo[id].data);
    });
}

function createGameDetail(info) {
  return {
    name: info.name,
    image: info.header_image,
    short_description: info.short_description,
    developers: info.developers,
  };
}

router.get("/:id", function (req, res, next) {
  GameList.findById(req.params.id).exec((err, gameList) => {
    if (err) {
      console.log(err);
      return next(err);
    }

    let gameInfo = [];
    async.each(
      gameList.gameIds,
      (id, cb) => {
        search(id, (err, info) => {
          if (err) {
            console.log(err);
            return next(err);
          }
          gameInfo.push(info);
          cb();
        });
      },
      (err) => {
        if (err) {
          console.log(err);
          return next(err);
        }
        let gameDetails = gameInfo.map((info) => createGameDetail(info));
        res.render("gameDetail", { games: gameDetails });
      }
    );
  });
});

module.exports = router;
