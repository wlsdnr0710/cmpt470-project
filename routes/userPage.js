const express = require("express");
const router = express.Router();

const userPageController = require("../controllers/userPageController");
const loginController = require("../controllers/loginController");
const userController = require("../controllers/userController");
// Redirect to logged in user page
router.get("/", loginController.checkIfLoggedIn, userPageController.redirectToLoggedInPage);

// User page for user with _id
router.get("/:id", loginController.checkIfLoggedIn, userPageController.renderUserPagebyId);

// Display Followers for user with _id
router.get("/:id/followers", loginController.checkIfLoggedIn, userPageController.renderFollowersPage);

// Display Following (users being followed by) for user with _id
router.get("/:id/following", loginController.checkIfLoggedIn, userPageController.renderFollowingPage);

router.post("/follow", loginController.checkIfLoggedIn, userController.followuser);

router.post("/unfollow", loginController.checkIfLoggedIn, userController.unfollowuser);
module.exports = router;