const express = require("express");
const router = express.Router();
const authenticateJWT = require("../../../middleware/auth");
const adminJobsController = require("../../controllers/Contents/adminJobsController");

// Create a jobs
router.post(
  "/create-jobs",
  authenticateJWT,
  adminJobsController.createJobs
);

// Get all jobs for a user
router.get("/view", authenticateJWT, adminJobsController.getJobs);

// Get a specific jobs by ID
router.get(
  "/view/:id",
  authenticateJWT,
  adminJobsController.getJobsById
);

// Update a jobs
router.put(
  "/update-jobs/:id",
  authenticateJWT,
  adminJobsController.updateJobs
);

// Delete a jobs
router.delete(
  "/delete-jobs/:id",
  authenticateJWT,
  adminJobsController.deleteJobs
);

module.exports = router;
