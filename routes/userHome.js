const express = require('express')
const router = express.Router()

gameListsIndex = [{title: "game list 1", listid: '0'}, {title: "game list 2", listid: '1'}, {title: "game list 3", listid: '2'},
{title: "game list 1", listid: '0'}, {title: "game list 2", listid: '1'}, {title: "game list 3", listid: '2'},
{title: "game list 1", listid: '0'}, {title: "game list 2", listid: '1'}, {title: "game list 3", listid: '2'},
{title: "game list 1", listid: '0'}, {title: "game list 2", listid: '1'}, {title: "game list 3", listid: '2'}]

router.get('/', function (req, res, next) {
  if(!(req.user))
  {
    res.redirect('/login');
  }
  res.render('userHome', { title: 'Express',  user: req.user, gameLists: gameListsIndex } );
})

module.exports = router;
