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
        if(err) return next(err)
        for (let i=0; i<foundGameList.gameIds.length; i++) {
            search(foundGameList.gameIds[i]*1, function(err, data)  {
                if(err) console.log(err)
                gameDetail = {
                    'name':data.name,
                    'image':data.header_image,
                    'short_description':data.short_description,
                    'developers': data.developers,
                    'price_original':data.price_overview.initial_formatted,
                    'price_discounted':data.price_overview.final_formatted
                }
                gameDetails.push(gameDetail);
            });
            console.log(gameDetails)
        }
        // for(i=0;i<gameDetails.length;i++) {
        //     console.log(gameDetails[i]);
        // }
        // console.log(gameDetails)
        // // var asdf = [
        // //     { name: 'Bloons TD 6',
        // //     image:
        // //     'https://steamcdn-a.akamaihd.net/steam/apps/960090/header.jpg?t=1593469824',
        // //     short_description:
        // //     'The Bloons are back and better than ever! Get ready for a massive 3D tower defense game designed to give you hours and hours of the best strategy gaming available.',
        // //     developers: [ 'Ninja Kiwi' ],
        // //     price_original: '',
        // //     price_discounted: 'CDN$ 11.49' },
        // //     { name: 'ARK: Survival Evolved',
        // //     image:
        // //     'https://steamcdn-a.akamaihd.net/steam/apps/346110/header.jpg?t=1604787943',
        // //     short_description:
        // //     'Stranded on the shores of a mysterious island, you must learn to survive. Use your cunning to kill or tame the primeval creatures roaming the land, and encounter other players to survive, dominate... and escape!',
        // //     developers:
        // //     [ 'Studio Wildcard',
        // //         'Instinct Games',
        // //         'Efecto Studios',
        // //         'Virtual Basement LLC' ],
        // //     price_original: 'CDN$ 59.99',
        // //     price_discounted: 'CDN$ 11.99' }
        // // ]
        res.render('gamedetail', { games: gameDetails})
    })
}) 




module.exports = router
