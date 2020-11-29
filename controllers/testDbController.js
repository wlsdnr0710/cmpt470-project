const GameList = require("../models/gameList");
const Steam = require("../services/steamApi");

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
// TODO: Update form and method to store steamId instead
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
  GameList.model.findById(req.params.id).exec((err, gameList) => {
    if (err) return next(err);
    // TODO: req.user is undefined here. Something to do with express cookie, sessions, or passport?
    Steam.getOwnedGames(req.user.steamId, true, (err, allOwnedGames) => {
      if (err) return next(err);

      // Of all the user's owned games, return those that are in this game list.
      let gamesInList = allOwnedGames.filter((game) =>
        gameList.gameIds.includes(game.appid)
      );
      res.render("testDbDetail", { gameList: gameList, gameData: gamesInList });
    });
  });
};

// Adds the given gameId to the given GameList. If the caller relies on the
// gameId being added to the game list, then it should await this method.
exports.addGame = async function (gameId, gameListId) {
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
exports.removeGame = async function (gameId, gameListId) {
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
