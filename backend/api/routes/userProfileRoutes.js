const express = require("express");
const router = express.Router();
const authenticateJWT = require("../../middleware/auth");

const userProfileController = require("../controllers/userProfileController");

router.get("/userprofile", authenticateJWT, userProfileController.getProfile);
router.get("/alumni", authenticateJWT, userProfileController.getAllAlumni);

router.post(
  "/createprofile",
  authenticateJWT,
  userProfileController.createProfile
);

router.post("/createuserprofile", userProfileController.createUserProfile);

router.put(
  "/updateprofile",
  authenticateJWT,
  userProfileController.updateProfile
);
router.post(
  "/changepassword",
  authenticateJWT,
  userProfileController.changePassword
);


router.delete("/:sectionType/:profileId/:sectionId", authenticateJWT, userProfileController.deleteSection);

module.exports = router;
