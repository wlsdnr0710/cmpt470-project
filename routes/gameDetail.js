const express = require("express");
const router = express.Router();
const axios = require("axios").default;
const superfetch = require("node-superfetch");
const async = require("async");
const GameList = require("../models/gameList");

// TODO: Please move functions into a controller called gameController.

router.get("/:id", function (req, res, next) {
    GameList.model.findById(req.params.id, function (err, user) {
        var gameIds = user.gameIds;
        var creatorSteamId = user.creatorSteamId;
        var steamkey = "E8E95B7D362F3A6D263CBDFB6F694293";
        var gameUserInfo = {};
        var gameUserInfos = [];
        var creatorInfoQuery = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + steamkey;
        var creatorInfoReq = {
            url: creatorInfoQuery,
            params: {
                steamid: creatorSteamId,
                include_appinfo: true, 
                include_played_free_games: false,
                format:"json",
            },
        };
        axios(creatorInfoReq)
            .then((result) => {
                for (i = 0; i < result.data.response.games.length; i++) {
                    var appid = result.data.response.games[i].appid;
                    if (!gameIds.includes(appid)) {
                        continue;
                    }
                    var playtime_forever = result.data.response.games[i].playtime_forever;
                    gameUserInfo = {
                        // HERE : add achievement status, if possible 
                        appid: appid,
                        playtime: Math.round(playtime_forever/6.0) / 10,
                    };
                    gameUserInfos.push(gameUserInfo);
                }
                // creator user info ready : get gamelist game detailed info
                var finalInfos = [];
                var finalInfo = {};
                var gameInfoURL = "https://store.steampowered.com/api/appdetails?appids="
                async.forEachOf(
                    gameIds,
                    (id, placeholder, cb) => {
                        superfetch
                            .get("https://store.steampowered.com/api/appdetails?appids=" + id)
                            .then((result)=> {
                                let gameInfo = JSON.parse(result.text.replace(/<br>/g, "\\n").replace(/<[^>]*>/g, ""));
                                finalInfo = {
                                    name: gameInfo[id].data.name,
                                    image: gameInfo[id].data.header_image,
                                    short_description: gameInfo[id].data.short_description,
                                    developers: gameInfo[id].data.developers,
                                    isFree: gameInfo[id].data.is_free,
                                    price: !gameInfo[id].data.is_free ? gameInfo[id].data.price_overview.final_formatted : undefined,
                                    discount: !gameInfo[id].data.is_free ? gameInfo[id].data.price_overview.discount_percent : undefined,
                                    creatorPlaytime: gameUserInfos.find(el => el.appid == id).playtime,
                                };
                                finalInfos.push(finalInfo);
                                cb();
                            }, (err) => {
                                console.log("failed to fetch");
                                console.log(err);
                                cb(err);
                            });
                    },
                    (err) => {
                        if (err) {
                            console.log('error');
                            return next(err);
                        }
                        res.render("gameDetail", { info: finalInfos , title: user.title, description: user.description, creator: user.creatorUsername });
                    }
                );
            })
            .catch((err) => console.log(err));
    });
  });
  


module.exports = router;
