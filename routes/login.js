var express = require('express');
var router = express.Router();
var openid = require('openid');

var steam = new openid.RelyingParty(
    'https://steamcommunity.com/openid/',
    null,
    false,
    false,
    []
);
router.get('/', function(request, response, next) {
  var identifier = request.query.openid_identifier;
  steam.authenticate(identifier, false, function(error, authUrl) {
    if(error) {
      response.writeHead(200);
    }
    else if (!authUrl) {
      response.writeHead(200);
    }
    else {
      response.writeHead(302, { Location: authUrl });
      response.end();
    }
  });
})

module.exports = router;