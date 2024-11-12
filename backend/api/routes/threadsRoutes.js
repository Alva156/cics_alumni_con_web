const express = require("express");
const router = express.Router();
const threadController = require("../controllers/threadsController");
const authenticateJWT = require("../../middleware/auth");

// Create a new thread
router.post("/create", authenticateJWT, threadController.createThread);

// Get all threads
router.get("/get", authenticateJWT, threadController.getAllThreads);

// Get My threads
router.get("/my-threads", authenticateJWT, threadController.getUserThreads);

// Get a single thread by ID
router.get("/view/:id", authenticateJWT, threadController.getThreadById);

// Update a thread by ID
router.put("/update/:id", authenticateJWT, threadController.updateThread);

// Delete a thread by ID
router.delete("/delete/:id", authenticateJWT, threadController.deleteThread);

module.exports = router;
