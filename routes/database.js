const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");

const dbController = require("../controllers/databaseController");



// router.get("/", dbController.index);

router.post("/create", loginController.checkIfLoggedIn, dbController.create);

router.post("/update/:id", loginController.checkIfLoggedIn, dbController.update);

router.get("/addGame/:id", loginController.checkIfLoggedIn, dbController.addGameToList);

// Note: deletes on GET, which makes it easier to use with anchor tags and href.
router.get("/delete/:id", loginController.checkIfLoggedIn, dbController.delete);

router.get("/details/:id", loginController.checkIfLoggedIn, dbController.details);

router.get("/list/:glID/removeGame/:gID", loginController.checkIfLoggedIn, dbController.removeGameFromList);

module.exports = router;
