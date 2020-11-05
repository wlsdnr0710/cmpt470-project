const express = require('express')
const router = express.Router()

/* GET gamelist creation page. */
router.get('/glists', function (req, res, next) {
  res.render('glists', { title: 'Express' })
})

module.exports = router
