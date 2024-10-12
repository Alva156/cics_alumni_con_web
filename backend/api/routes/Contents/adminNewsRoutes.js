const express = require("express");
const router = express.Router();
const authenticateJWT = require("../../../middleware/auth");
const adminNewsController = require("../../controllers/Contents/adminNewsController");

// Create a news
router.post(
  "/create-news",
  authenticateJWT,
  adminNewsController.createNews
);

// Get all news for a user
router.get("/view", authenticateJWT, adminNewsController.getNews);

// Get a specific news by ID
router.get(
  "/view/:id",
  authenticateJWT,
  adminNewsController.getNewsById
);

// Update a news
router.put(
  "/update-news/:id",
  authenticateJWT,
  adminNewsController.updateNews
);

// Delete a news
router.delete(
  "/delete-news/:id",
  authenticateJWT,
  adminNewsController.deleteNews
);

module.exports = router;
