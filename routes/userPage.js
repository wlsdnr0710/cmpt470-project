const express = require("express");
const router = express.Router();

const userPageController = require("../controllers/userPageController");

// Redirect to logged in user page
router.get("/", userPageController.redirectToLoggedInPage);

// User page for user with _id
router.get("/:id", userPageController.renderUserPagebyId);

module.exports = router;