const Thread = require("../models/threadsModel");
const jwt = require("jsonwebtoken");
const Reply = require("../models/replyModel");

// Create a new thread
exports.createThread = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userProfileId = decoded.profileId; // Assuming profileId is included in the JWT

    const { title, content } = req.body;

    const newThread = new Thread({
      userProfileId, // Use userProfileId
      title,
      content,
    });

    await newThread.save();

    // Populate the user profile details for the response
    const populatedThread = await Thread.findById(newThread._id).populate(
      "userProfileId",
      "firstName lastName profileImage profession"
    );

    res.status(201).json({
      message: "Thread created successfully!",
      thread: populatedThread,
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
    const userProfileId = decoded.profileId;

    const userThreads = await Thread.find({ userProfileId })
      .populate("userProfileId", "firstName lastName profileImage profession")
      .lean();

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

exports.getAllThreads = async (req, res) => {
  try {
    const token = req.cookies.token;
    let userProfileId = null;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userProfileId = decoded.profileId; // Ensure the correct property is used
    }

    const threads = await Thread.find()
      .populate("userProfileId", "firstName lastName profileImage profession")
      .lean();

    const threadsWithReplyCount = await Promise.all(
      threads.map(async (thread) => {
        const replyCount = await Reply.countDocuments({ threadId: thread._id });
        return {
          ...thread,
          replyCount,
          isOwner:
            userProfileId &&
            thread.userProfileId._id.toString() === userProfileId.toString(),
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
    const userProfileId = decoded.profileId;

    const { title, content } = req.body;
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    if (thread.userProfileId.toString() !== userProfileId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update the thread's title and content
    thread.title = title;
    thread.content = content;

    const updatedThread = await thread.save();

    // Populate the user profile details for the response
    const populatedThread = await Thread.findById(updatedThread._id)
      .populate("userProfileId", "firstName lastName profileImage profession")
      .lean();

    // Fetch the reply count for this thread
    const replyCount = await Reply.countDocuments({ threadId: thread._id });

    res.status(200).json({
      message: "Thread updated successfully",
      thread: { ...populatedThread, replyCount },
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating thread", error });
  }
};

// Delete a thread (only the owner can delete)
exports.deleteThread = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userProfileId = decoded.profileId;

    // Find the thread by ID
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    // Check if the user is the owner of the thread
    if (thread.userProfileId.toString() !== userProfileId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Remove the thread
    await Thread.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Thread deleted successfully" });
  } catch (error) {
    console.error("Error deleting thread:", error);
    res
      .status(500)
      .json({ message: "Error deleting thread", error: error.message });
  }
};
