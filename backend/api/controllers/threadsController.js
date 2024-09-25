const Thread = require("../models/threadsModel");
const jwt = require("jsonwebtoken");
const Reply = require("../models/replyModel");

// Create a new thread
exports.createThread = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { title, content } = req.body;

    const newThread = new Thread({
      userId, // Add userId to the thread
      title,
      content,
    });

    await newThread.save();

    // Populate the user details for the response
    const populatedThread = await Thread.findById(newThread._id).populate(
      "userId",
      "firstName lastName"
    );

    res.status(201).json({
      message: "Thread created successfully!",
      thread: populatedThread, // Return the populated thread
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create thread" });
  }
};
exports.getUserThreads = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find threads created by the logged-in user and also count replies for each thread
    const userThreads = await Thread.find({ userId })
      .populate("userId", "firstName lastName")
      .lean(); // Use lean to get plain objects

    // Count replies for each thread
    const threadsWithReplyCount = await Promise.all(
      userThreads.map(async (thread) => {
        const replyCount = await Reply.countDocuments({ threadId: thread._id });
        return { ...thread, replyCount };
      })
    );

    res.status(200).json(threadsWithReplyCount);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user threads", error });
  }
};

// Get all threads
exports.getAllThreads = async (req, res) => {
  try {
    const token = req.cookies.token;
    let userId = null;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    }

    // Fetch all threads and populate the user's details
    const threads = await Thread.find()
      .populate("userId", "firstName lastName")
      .lean();

    // Count replies for each thread
    const threadsWithReplyCount = await Promise.all(
      threads.map(async (thread) => {
        const replyCount = await Reply.countDocuments({ threadId: thread._id });
        return {
          ...thread,
          replyCount,
          isOwner: userId && thread.userId._id.toString() === userId.toString(),
        };
      })
    );

    res.status(200).json(threadsWithReplyCount);
  } catch (error) {
    res.status(500).json({ message: "Error fetching threads", error });
  }
};

// Get a thread by ID
exports.getThreadById = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }
    res.status(200).json(thread);
  } catch (error) {
    res.status(500).json({ message: "Error fetching thread", error });
  }
};

// Update a thread (only the owner can update)
exports.updateThread = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { title, content } = req.body;
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    if (thread.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update the thread's title and content
    thread.title = title;
    thread.content = content;

    const updatedThread = await thread.save();

    // Populate the user details for the response
    const populatedThread = await Thread.findById(updatedThread._id).populate(
      "userId",
      "firstName lastName"
    );

    res.status(200).json({
      message: "Thread updated successfully",
      thread: populatedThread, // Return the populated thread
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating thread", error });
  }
};

// Delete a thread (only the owner can delete)

// Delete a thread (only the owner can delete)
exports.deleteThread = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find the thread by ID
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    // Check if the user is the owner of the thread
    if (thread.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Remove the thread using .remove() or .deleteOne()
    await Thread.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Thread deleted successfully" });
  } catch (error) {
    console.error("Error deleting thread:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Error deleting thread", error: error.message });
  }
};
