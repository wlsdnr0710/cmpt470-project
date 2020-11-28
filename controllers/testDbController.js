const GameList = require("../models/gameList");

// Return index view. By default, the game lists are ordered by status.
exports.index = function (req, res, next) {
  GameList.model.find().exec((err, allGameLists) => {
    if (err) return next(err);
    res.render("testDbIndex", {
      gameLists: GameList.sort(allGameLists, GameList.SortFields.Status),
    });
  });
};

// Get the GameList creation page.
exports.createGet = function (req, res) {
  res.render("testDbCreateList");
};

// Save a GameList to the db.
exports.createPost = function (req, res, next) {
  let gameList = new GameList.model({
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
  GameList.model.findById(req.params.id).exec((err, foundGameList) => {
    if (err) return next(err);
    res.render("testDbDetail", { gameList: foundGameList });
  });
};

// Adds the given gameId to the given GameList. If the caller relies on the
// gameId being added to the game list, then it should await this method.
exports.update = async function (gameId, gameListId) {
  GameList.model.findById(gameListId).exec((err, gameList) => {
    if (err) return console.error(err);
    gameList.gameIds.push(gameId);
    gameList.save((err) => {
      if (err) console.error(err);
    });
  });
};

// Removes the given gameId to the given GameList. If the caller relies on the
// gameId being added to the game list, then it should await this method.
exports.remove = async function (gameId, gameListId) {
  GameList.model.findById(gameListId).exec((err, gameList) => {
    if (err) return console.error(err);
    let index = gameList.gameIds.indexOf(gameId);
    if (index < 0)
      return console.error(
        `gameId: ${gameId} not found in gameList: ${gameListId}`
      );
    gameList.gameIds.splice(index, 1);
  });
};
