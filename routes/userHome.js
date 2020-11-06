const express = require('express')
const router = express.Router()

gameListsIndex = [{title: "game list 1", url: '/gamelist/0'}, {title: "game list 2", url: '/gamelist/1'}, {title: "game list 3", url: '/gamelist/2'},
{title: "game list 1", url: '/gamelist/0'}, {title: "game list 2", url: '/gamelist/1'}, {title: "game list 3", url: '/gamelist/2'},
{title: "game list 1", url: '/gamelist/0'}, {title: "game list 2", url: '/gamelist/1'}, {title: "game list 3", url: '/gamelist/2'},
{title: "game list 1", url: '/gamelist/0'}, {title: "game list 2", url: '/gamelist/1'}, {title: "game list 3", url: '/gamelist/2'}]

router.get('/', function (req, res, next) {
  res.render('userHome', { title: 'Express',  user: {name: "ME",  gameLists: gameListsIndex } } )
})

module.exports = router;
