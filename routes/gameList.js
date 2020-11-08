const express = require('express')
const router = express.Router()

gameListArr = [[{name: "game Name 1"}, {name: "game Name 3"}], [{name: "game Name 3"}, {name: "game Name 2"}], [{name: "game Name 3"}]]

router.get('/:id', function (req, res, next) {
  // store steam appIDs instead of gameListArr
  // use steam appID to generate game list info
  // game list info could contain name and picture for each game
  res.render('gameList', { title: 'Express',  user: {name: "ME",  gameList: gameListArr[req.params.id] } } )
});

module.exports = router;
