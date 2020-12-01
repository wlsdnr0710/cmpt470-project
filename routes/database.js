const express = require("express");
const router = express.Router();

const dbController = require("../controllers/databaseController");

router.get("/", dbController.index);

router.post("/create", dbController.create);

router.post("/update/:id", dbController.update);

router.post("/addGame/:id", dbController.addGameToList);

// Note: deletes on GET, which makes it easier to use with anchor tags and href.
router.get("/delete/:id", dbController.delete);

router.get("/details/:id", dbController.details);

router.get("/list/:glID/removeGame/:gID", dbController.removeGameFromList);

module.exports = router;
