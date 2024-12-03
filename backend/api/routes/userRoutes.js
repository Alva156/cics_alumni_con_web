const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateJWT = require("../../middleware/auth");

router.post("/register", userController.registerUser);
router.post("/verify", userController.verifyOTP);
router.post("/sendotp", userController.sendOTP);
router.post("/login", userController.loginUser);
router.post("/cancel", userController.cancel);
router.post("/forget", userController.forgotPassword);
router.post("/verifypassword", userController.verifyOTPPassword);
router.post("/resetpassword", userController.resetPassword);
router.post("/logout", authenticateJWT, userController.logoutUser);
router.get("/check-auth", authenticateJWT, userController.checkAuth);
router.post("/uploadcsv", authenticateJWT, userController.uploadCsv);
router.get("/fetchcsv", authenticateJWT, userController.getCsvFiles);
router.delete("/deletecsv/:id", authenticateJWT, userController.deleteCsv);
router.get("/protected", authenticateJWT, (req, res) => {
  res.status(200).json({ msg: "Token is valid" });
});

module.exports = router;
