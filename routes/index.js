const express = require('express')
const app = require('../app')
const router = express.Router()

/* GET home page. */
/*
router.get('/', function (req, res, next) {
  res.render('index');
})
*/

gameListsIndex = [{title: "game list 1", url: '/gamelist/0'}, {title: "game list 2", url: '/gamelist/1'}, {title: "game list 3", url: '/gamelist/2'},
{title: "game list 1", url: '/gamelist/0'}, {title: "game list 2", url: '/gamelist/1'}, {title: "game list 3", url: '/gamelist/2'},
{title: "game list 1", url: '/gamelist/0'}, {title: "game list 2", url: '/gamelist/1'}, {title: "game list 3", url: '/gamelist/2'},
{title: "game list 1", url: '/gamelist/0'}, {title: "game list 2", url: '/gamelist/1'}, {title: "game list 3", url: '/gamelist/2'}]

gameListArr = [[{name: "game Name 1"}, {name: "game Name 3"}], [{name: "game Name 3"}, {name: "game Name 2"}], [{name: "game Name 3"}]]

router.get('/', function (req, res, next) {
  res.render('userHome', { title: 'Express',  user: {name: "ME",  gameLists: gameListsIndex } } )
})

router.get('/gamelist/:id', function (req, res, next) {
  // store steam appIDs instead of gameListArr
  // use steam appID to generate game list info
  // game list info could contain name and picture for each game
  res.render('gameList', { title: 'Express',  user: {name: "ME",  gameList: gameListArr[req.params.id] } } )
})

module.exports = router;