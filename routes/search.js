const express = require('express')
const router = express.Router()

const userController = require("../controllers/userController");

router.get("/", userController.index);
/* GET users listing. */

router.get("/:query", userController.search);
module.exports = router
