const express = require("express");
const router = express.Router();
const authenticateJWT = require("../../../middleware/auth");
const adminCertificationsController = require("../../controllers/Contents/adminCertificationsController");

// Create a certifications
router.post(
  "/create-certifications",
  authenticateJWT,
  adminCertificationsController.createCertifications
);

// Get all certifications for a user
router.get("/view", authenticateJWT, adminCertificationsController.getCertifications);

// Get a specific certifications by ID
router.get(
  "/view/:id",
  authenticateJWT,
  adminCertificationsController.getCertificationsById
);

// Update a certifications
router.put(
  "/update-certifications/:id",
  authenticateJWT,
  adminCertificationsController.updateCertifications
);

// Delete a certifications
router.delete(
  "/delete-certifications/:id",
  authenticateJWT,
  adminCertificationsController.deleteCertifications
);

module.exports = router;
