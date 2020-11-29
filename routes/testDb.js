const express = require("express");
const router = express.Router();

const testDbController = require("../controllers/testDbController");
const apiTest = require("../services/steamApi");

router.get("/", testDbController.index);

router.post("/create", testDbController.createPost);

router.get("/details/:id", testDbController.details);

router.get("/cachetest", apiTest.getOwnedGames);

module.exports = router;
