const express = require("express");
const router = express.Router();

const userPageController = require("../controllers/userPageController");
const loginController = require("../controllers/loginController");

// Redirect to logged in user page
router.get("/", loginController.checkIfLoggedIn, userPageController.redirectToLoggedInPage);

// User page for user with _id
router.get("/:id", loginController.checkIfLoggedIn, userPageController.renderUserPagebyId);

// Display Followers for user with _id
router.get("/:id/followers", loginController.checkIfLoggedIn, userPageController.renderFollowersPage);

// Display Following (users being followed by) for user with _id
router.get("/:id/following", loginController.checkIfLoggedIn, userPageController.renderFollowingPage);

module.exports = router;