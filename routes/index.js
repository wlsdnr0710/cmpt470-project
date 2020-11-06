const express = require('express')
const app = require('../app')
const router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log(req.user);
  res.render('index', { user: req.user })
})



router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
})

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

module.exports = router
