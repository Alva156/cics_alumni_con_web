const express = require("express");
const router = express.Router();
const authenticateJWT = require("../../../middleware/auth");
const adminEventsController = require("../../controllers/Contents/adminEventsController");

// Create a events
router.post(
  "/create-events",
  authenticateJWT,
  adminEventsController.createEvents
);

// Get all events for a user
router.get("/view", authenticateJWT, adminEventsController.getEvents);

// Get a specific events by ID
router.get(
  "/view/:id",
  authenticateJWT,
  adminEventsController.getEventsById
);

// Update a events
router.put(
  "/update-events/:id",
  authenticateJWT,
  adminEventsController.updateEvents
);

// Delete a events
router.delete(
  "/delete-events/:id",
  authenticateJWT,
  adminEventsController.deleteEvents
);

module.exports = router;
