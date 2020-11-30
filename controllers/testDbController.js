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

// Save a GameList to the db.
exports.create = function (req) {
  let gameList = new GameList.model({
    title: req.fields.title,
    description: req.fields.description,
    creatorSteamId: req.user.steamId,
  });

  gameList.save((err) => {
    if (err) console.error(err);
  });
};

// Updates an existing GameList in the db.
exports.update = function (req, res, next) {
  let toFind = req.params.id;
  let updatingTo = {
    title: req.fields.title,
    description: req.fields.description,
  };

  GameList.model.findOneAndUpdate(toFind, updatingTo, (err, updated) => {
    if (err) return console.error(err);
  });
};

// Deletes a GameList from the db.
exports.delete = function (req, res, next) {
  GameList.model.findOneAndRemove({ _id: req.params.id }, (err, removed) => {
    if (err) return console.error(err);
    res.redirect("/userPage/" + req.user.id);
  });
};

// Get details of a particular GameList whose id is passed as a query parameter.
exports.details = function (req, res, next) {
  GameList.model.findById(req.params.id).exec((err, gameList) => {
    if (err) return next(err);
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

// Adds the game with id 'gameId' to the game list with id 'gameListId'.
exports.addGame = async function (gameId, gameListId) {
  GameList.model.findById(gameListId).exec((err, gameList) => {
    if (err) return console.error(err);
    gameList.gameIds.push(gameId);
    gameList.save((err) => {
      if (err) console.error(err);
    });
  });
};

// Removes the game with id 'gameId' from the game list with id 'gameListId'.
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
