const express = require("express");
const router = express.Router();
const replyController = require("../controllers/repliesController");
const authenticateJWT = require("../../middleware/auth");

// Create a new reply
router.post("/create", authenticateJWT, replyController.createReply);

// Get replies for a thread
router.get(
  "/thread/:threadId",
  authenticateJWT,
  replyController.getRepliesByThreadId
);

// Update a reply by ID
router.put("/update/:id", authenticateJWT, replyController.updateReply);

// Delete a reply by ID
router.delete("/delete/:id", authenticateJWT, replyController.deleteReply);

module.exports = router;
