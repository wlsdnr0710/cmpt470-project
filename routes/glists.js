const express = require('express')
const app = require('../app')
const router = express.Router()
var SteamApi = require('steam-api');


// dummy curret gamelists page 
router.get('/', function (req, res, next) {
  res.render('glistsCreateButton', { user: req.user })
})

// create gamelist, choose from owned games
router.get("/createform", function (req, res, next){
  console.log(req.user.id);
  var player = new SteamApi.Player('E8E95B7D362F3A6D263CBDFB6F694293');
  
  var reduced_games = [];
  var reduced_game ={};

  player.GetOwnedGames(
    "76561199104267595", 
    optionalIncludeAppInfo = true, 
    optionalIncludePlayedFreeGames = false, 
    optionalAppIdsFilter = []
  ).done(function(result){
    console.log(result);
    for (i=0;i<result.length;i++) {
      reduced_game = {
        "appId": result[i].appId,
        "name": result[i].name,
        "img": result[i].logo
        }
      reduced_games.push(reduced_game);
      for (i = 0; i < reduced_games.length; i++) {
        console.log(reduced_games[i].appId+"\n");
        console.log(reduced_games[i].name+"\n");
        // console.log(reduced_games[i].logo+"\n");
      }
    }
    res.render('glistsCreateForm', { user: req.user, reduced_games: reduced_games })
  });

})

// send fomr, not sure how to add to db
router.post("/createform", function (req, res, next){
  res.render('glistsCreateForm', { user: req.user })
})

module.exports = router
