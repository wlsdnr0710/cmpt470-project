const GameList = require("../models/gameList");

// Get the title of every GameList.
exports.index = function (req, res, next) {
  GameList.find().exec((err, allGameLists) => {
    if (err) return next(err);
    for (i=0; i<allGameLists.length; i++) {
      console.log(allGameLists[i]);
    }
    res.render("testDbIndex", { gameLists: allGameLists });
  });
};

// Get the GameList creation page.
exports.createGet = function (req, res) {
  res.render("testDbCreateList");
};

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

// Get details of a particular GameList.
exports.details = function (req, res, next) {
  GameList.findById(req.params.id).exec((err, foundGameList) => {
    if (err) return next(err);
    res.render("testDbDetail", { gameList: foundGameList });
  });
};
