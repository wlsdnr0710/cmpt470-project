const express = require("express");
const router = express.Router();

const testDbController = require("../controllers/testDbController");

router.get("/", testDbController.index);

router.get("/create", testDbController.createGet);
router.post("/create", testDbController.createPost);

router.get("/details/:id", testDbController.detail);

module.exports = router;
