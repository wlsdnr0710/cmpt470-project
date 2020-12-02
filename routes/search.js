const express = require('express')
const router = express.Router()

const userController = require("../controllers/userController");
const loginController = require("../controllers/loginController");
router.get("/", loginController.checkIfLoggedIn, userController.index);
/* GET users listing. */

module.exports = router
