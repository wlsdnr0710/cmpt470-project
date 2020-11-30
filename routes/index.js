const express = require('express')
const app = require('../app')
const router = express.Router()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {active: 'home', user: req.user});
})

module.exports = router