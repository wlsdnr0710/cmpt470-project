const GameList = require("../models/gameList");

// Grab every game from api query


// Save a GameList to the db.
exports.createPost = function (req, res, next) {
  let gameList = new GameList({
    title: req.body.title,
    description: req.body.description,
    creatorUsername: req.body.creatorUsername,
});

  gameList.save((err) => {
    if (err) return next(err);
    res.redirect(gameList.testUrl);
  });
};

