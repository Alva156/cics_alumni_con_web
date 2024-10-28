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

router.delete(
  "/:sectionType/:profileId/:sectionId",
  authenticateJWT,
  userProfileController.deleteSection
);

router.delete(
  "/:profileId/:attachmentId",
  authenticateJWT,
  userProfileController.deleteAttachment
);

router.get(
  "/dashboard-stats",
  authenticateJWT,
  userProfileController.getDashboardStats
);
router.get(
  "/attachments",
  authenticateJWT,
  userProfileController.getAttachments
);
router.get(
  "/attachments/download/:filename",
  authenticateJWT,
  userProfileController.downloadAttachment
);

router.get(
  "/attachments/preview/:filename",
  authenticateJWT,
  userProfileController.previewAttachment
);
router.post("/send-otp", authenticateJWT, userProfileController.sendOTP);
router.post(
  "/verify-otp",
  authenticateJWT,
  userProfileController.verifyOTPAndUpdateEmail
);

module.exports = router;
