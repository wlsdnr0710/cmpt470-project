var express = require('express');
var router = express.Router();
var passport = require('passport');

const userController = require("../controllers/loginController");

router.get('/', function (req, res, next) {
  if (req.user)
  {
    res.redirect('/userPage');
  }

  res.render('login', { active: 'login' });
})

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
})

router.get('/steam', userController.login);

// router.get('/steam/return', function(req, res, next) {
//     console.log(req.url);
//     console.log(req.originalUrl);
//     req.url = req.originalUrl;
    
//     next();
// },
// passport.authenticate('steam', {failureRedirect: '/' , successRedirect: '/users'}),
// function(req, res) {
//     res.redirect('/');
// });

module.exports = router;