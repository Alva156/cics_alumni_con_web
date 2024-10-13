const express = require("express");
const router = express.Router();
const authenticateJWT = require("../../middleware/auth"); // Assuming you have a JWT authentication middleware
const adminProfileController = require("../controllers/adminProfileController");

// Route to get the logged-in admin's profile
router.get("/adminprofile", authenticateJWT, adminProfileController.getAdminProfile);

// Route to update the logged-in admin's profile
router.put("/updateadminprofile", authenticateJWT, adminProfileController.updateAdminProfile);


module.exports = router;
