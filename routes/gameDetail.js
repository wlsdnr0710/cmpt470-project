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
    price_original: info.price_overview.initial_formatted,
    price_discounted: info.price_overview.final_formatted,
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

/*router.get("/:id", function (req, res, next) {
  GameList.findById(req.params.id).exec((err, foundGameList) => {
    var gameDetails = [];
    var gameDetail = {};
    for (let i = 0; i < foundGameList.gameIds.length; i++) {
      let j = 0;
      search(foundGameList.gameIds[i] * 1, function (err, data) {
        if (err) {
          console.log(err);
          j++;
        }
        gameDetail = {
          name: data.name,
          image: data.header_image,
          short_description: data.short_description,
          developers: data.developers,
          price_original: data.price_overview.initial_formatted,
          price_discounted: data.price_overview.final_formatted,
        };
        gameDetails.push(gameDetail);
        // console.log(i)
        // console.log(gameDetails)
        // TODO: fix scope problem.
        if (gameDetails.length + j == foundGameList.gameIds.length) {
          res.render("gameDetail", { games: gameDetails });
        }
      });
    }
  });
});*/

module.exports = router;
