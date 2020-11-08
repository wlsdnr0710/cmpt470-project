const express = require('express');
const router = express.Router();
const superfetch = require("node-superfetch")

const GameList = require("../models/gameList");


function search(id, cb) {
    if (!parseInt(id)) return cb("The App ID must be a number", null)
    superfetch.get("https://store.steampowered.com/api/appdetails?appids=" + id).then((game) => {
        let gameInfo = JSON.parse(game.text.replace(/<br>/g, "\\n").replace(/<[^>]*>/g, ""))
        if (gameInfo[id].success === false) return cb("Game not found", null)
        cb(null, gameInfo[id].data)
    })
}


router.get('/:id', function (req, res, next) {
    GameList.findById(req.params.id).exec((err, foundGameList) => {
        var gameDetails = [];
        var gameDetail = {};
        for (let i=0; i<foundGameList.gameIds.length; i++) {
            let j=0; 
            search(foundGameList.gameIds[i]*1, function(err, data)  {
                if(err) {
                    console.log(err)
                    j++;
                }
                gameDetail = {
                    'name':data.name,
                    'image':data.header_image,
                    'short_description':data.short_description,
                    'developers': data.developers,
                    'price_original':data.price_overview.initial_formatted,
                    'price_discounted':data.price_overview.final_formatted
                }
                gameDetails.push(gameDetail)
                // console.log(i)
                // console.log(gameDetails)
                // TODO: fix scope problem.    
                if(gameDetails.length+j == foundGameList.gameIds.length) {
                    res.render('gameDetail', {games : gameDetails})
                }
            })
           
                   
        }
    })
}) 




module.exports = router
