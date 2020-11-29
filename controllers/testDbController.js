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
exports.create = function (req, res, next) {
  let gameList = new GameList.model({
    title: req.fields.title,
    description: req.fields.description,
    creatorSteamId: req.user.id,
  });

  gameList.save((err) => {
    if (err) {
      return res.send("error");
    }
    res.send("success");
  });
};

// Deletes a GameList from the db.
exports.delete = function (req, res, next) {
  GameList.model.findOneAndRemove({ _id: req.params.id }, (err, removed) => {
    if (err) return console.log(err);
    res.redirect("/testdb");
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
