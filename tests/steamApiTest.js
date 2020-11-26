const Steam = require("../services/steamApi");

(function getOwnedGamesTest() {
  const steamId = "76561199104267595";
  Steam.getOwnedGames(steamId, (err, ownedGames) => {
    if (err) return console.log(err);
    console.log(ownedGames);
  });
})();
