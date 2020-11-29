const express = require("express");
const router = express.Router();

const testDbController = require("../controllers/testDbController");
const apiTest = require("../services/steamApi");

router.get("/", testDbController.index);

router.post("/create", testDbController.create);

// Note: deletes on GET, which makes it easier to use with anchor tags and href.
router.get("/delete/:id", testDbController.delete);

router.get("/details/:id", testDbController.details);

router.get("/cachetest", apiTest.getOwnedGames);

module.exports = router;
