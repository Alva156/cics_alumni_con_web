const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateJWT = require("../../middleware/auth");

router.post("/register", userController.registerUser);
router.post("/verify", userController.verifyOTP);
router.post("/sendotp", userController.sendOTP);
router.post("/login", userController.loginUser);
router.post("/logout", authenticateJWT, userController.logoutUser);
router.get("/protected", authenticateJWT, (req, res) => {
  res.status(200).json({ msg: "Token is valid" });
});
module.exports = router;
