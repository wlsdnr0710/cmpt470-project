const GameList = require("../models/gameList");

// Get the title of every GameList.
exports.index = function (req, res, next) {
  GameList.find().exec((err, allGameLists) => {
    if (err) return next(err);
    for (i = 0; i < allGameLists.length; i++) {
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

// TODO: We might want a method that returns a user's owned games. This can be used
//       within the game list details view to create a popup that allows users to select
//       games they want to add to the current game list.

// Adds the given gameId to the given GameList. If the caller relies on the
// gameId being added to the game list, then it should await this method.
exports.update = async function (gameId, gameListId) {
  GameList.findById(gameListId).exec((err, gameList) => {
    if (err) return console.log(err);
    gameList.gameIds.push(gameId);
    gameList.save((err) => {
      if (err) console.log(err);
    });
  });
};

// Removes the given gameId to the given GameList. If the caller relies on the
// gameId being added to the game list, then it should await this method.
exports.remove = async function (gameId, gameListId) {
  GameList.findById(gameListId).exec((err, gameList) => {
    if (err) return console.log(err);
    let index = gameList.gameIds.indexOf(gameId);
    if (index < 0)
      return console.log(
        `gameId: ${gameId} not found in gameList: ${gameListId}`
      );
    gameList.gameIds.splice(index, 1);
  });
};
