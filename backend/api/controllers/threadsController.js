const Thread = require("../models/threadsModel");
const jwt = require("jsonwebtoken");
const Reply = require("../models/replyModel");
const User = require("../models/userModel");

exports.createThread = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const userProfileId = decoded.profileId;

    const { title, content } = req.body;

    // Fetch the user role based on the userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Determine thread status based on user role
    const status = user.role === "admin" ? "approved" : "pending";

    // Create the new thread
    const newThread = new Thread({
      userProfileId, // Use userProfileId from the token
      title,
      content,
      status,
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
    console.error("Error during thread creation:", error);
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
            thread.userProfileId && // Check that userProfileId is not null
            thread.userProfileId._id.toString() === userProfileId.toString(),
        };
      })
    );
    res.status(200).json(threadsWithReplyCount);
  } catch (error) {
    console.error("Error fetching threads:", error); // Log the error in detail
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

    const userId = decoded.id; // Extract id from the token
    const userProfileId = decoded.profileId; // Extract profileId from the token

    const { title, content } = req.body;
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    if (thread.userProfileId.toString() !== userProfileId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Fetch the user role based on the userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Determine thread status based on user role
    thread.status = user.role === "admin" ? "approved" : "pending";

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
    console.error(error);
    res.status(500).json({ message: "Error updating thread", error });
  }
};
//fetch pending
exports.getPendingThreads = async (req, res) => {
  try {
    const threads = await Thread.find({ status: "pending" })
      .populate("userProfileId", "firstName lastName profileImage profession")
      .lean();

    const threadsWithReplyCount = await Promise.all(
      threads.map(async (thread) => {
        const replyCount = await Reply.countDocuments({ threadId: thread._id });
        return { ...thread, replyCount };
      })
    );

    res.status(200).json(threadsWithReplyCount);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending threads", error });
  }
};

// Delete a thread (only the owner can delete)
exports.deleteThread = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    // Decode the token to extract userProfileId and userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userProfileId = decoded.profileId;
    const userId = decoded.id;

    // Fetch the user from the User collection based on userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the thread by ID
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    // Check if the user is the owner of the thread or an admin
    if (
      thread.userProfileId.toString() !== userProfileId &&
      user.role !== "admin"
    ) {
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

exports.silenceThread = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userProfileId = decoded.profileId;

    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    if (thread.userProfileId.toString() !== userProfileId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Set notifEnabled based on the value passed in the request body
    const { notifEnabled } = req.body;
    thread.notifEnabled = notifEnabled;
    await thread.save();

    res.status(200).json({
      message: `Thread notifications ${
        notifEnabled ? "enabled" : "disabled"
      } successfully`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating thread notifications", error });
  }
};

exports.updateThreadStatus = async (req, res) => {
  try {
    const { status } = req.body; // "approved" or "rejected"
    const threadId = req.params.id;

    // 1. Extract token from cookies
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // 2. Verify token and extract user ID and role
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // 3. Fetch user details to check if the user is an admin
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4. Only allow if user is an admin
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admins can update status" });
    }

    // 5. Validate the status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // 6. Find the thread by ID
    const thread = await Thread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    // 7. Update the thread status
    thread.status = status;
    await thread.save();

    // 8. Return the response with the updated thread
    res.status(200).json({
      message: `Thread successfully ${status}`,
      thread,
    });
  } catch (error) {
    console.error("Error updating thread status:", error);
    res.status(500).json({ message: "Failed to update thread status", error });
  }
};
