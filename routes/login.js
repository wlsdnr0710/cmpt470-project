var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/', function(req, res){
    res.send("what the");
})
router.get('/steam', passport.authenticate('steam', {failureRedirect: '/' }), function(req, res) {
    res.redirect('/');
});

router.get('/steam/return', function(req, res, next) {
    console.log(req.url);
    console.log(req.originalUrl);
    req.url = req.originalUrl;
    
    next();
},
passport.authenticate('steam', {failureRedirect: '/'}),
function(req, res) {
    res.redirect('/');
});

module.exports = router;