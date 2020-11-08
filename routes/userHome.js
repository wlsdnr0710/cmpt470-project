const express = require('express')
const request = require('request')
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


  var gamesinfo = []
  // http://store.steampowered.com/api/appdetails/appids=
  var authkey = 'E8E95B7D362F3A6D263CBDFB6F694293';
  var profileGamesQuery = 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key='+authkey+'&steamid=' + req.user.id + '&include_appinfo=1&format=json';
  console.log('authkey: ' + authkey);
  console.log('user.id: ' + req.user.id);
  request.get({
    url: profileGamesQuery,
    json: true,
    headers: {'User-Agent': 'request'}
  }, function(err, resp, data){
    for (var i = 0; i < data.response.game_count; i++)
    {
      //keys = [];
      //for(var k in data.response.games[i]) keys.push(k);
      //console.log('keys: ', keys);
      var gameid = data.response.games[i].appid;
      var gameinfo = {name: data.response.games[i].name, icon_url: 'http://media.steampowered.com/steamcommunity/public/images/apps/'+data.response.games[i].appid+'/'+data.response.games[i].img_icon_url+'.jpg'};
      //console.log('gameinfo: ', i, gameinfo);
      gamesinfo[gameid] = gameinfo;
    }
    keys = [];
    for(var k in gamesinfo) keys.push(k);
    console.log('gamesinfo keys: ', keys);
    keys.forEach(function(k){
        console.log('key: ', k, 'val: ', gamesinfo[k]);
    });

    var gamesLists = [];
    for(var i = 0; i < gameListsIndex.length; i++) 
    {
      var list = gameListsIndex[i];
      console.log('list: ', list);
      gamesLists.push(list);
      //TEMP CODE
      icon_urls = [];
      for(var j = parseInt(list.listid); j < parseInt(list.listid)+3; j++) 
      {
        icon_urls.push(gamesinfo[keys[j]].icon_url);
      }
      gamesLists[gamesLists.length -1].icons = icon_urls;
    }

    console.log(gamesLists);
    res.render('userHome', { title: 'Express',  user: req.user, gameLists: gamesLists } );
  });
  
  //res.render('gameList', { title: 'Express',  user: {name: "ME",  gameList: gameListArr[req.params.id] } } )

  //res.render('userHome', { title: 'Express',  user: req.user, gameLists: gameListsIndex } );
})

module.exports = router;
