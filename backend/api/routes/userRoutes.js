const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.registerUser);
router.post("/verify", userController.verifyOTP);
router.post("/sendotp", userController.sendOTP);

module.exports = router;
