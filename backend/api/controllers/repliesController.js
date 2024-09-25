const Reply = require("../models/replyModel");
const jwt = require("jsonwebtoken");

// Create a reply
exports.createReply = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { threadId, reply } = req.body;

    const newReply = new Reply({
      threadId,
      userId,
      reply,
    });

    await newReply.save();

    // Populate the user details for the response
    const populatedReply = await Reply.findById(newReply._id).populate(
      "userId",
      "firstName lastName"
    );

    res.status(201).json({
      message: "Reply added successfully!",
      reply: populatedReply,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add reply" });
  }
};

// Get replies for a thread
exports.getRepliesByThreadId = async (req, res) => {
  try {
    const replies = await Reply.find({
      threadId: req.params.threadId,
    }).populate("userId", "firstName lastName");

    const userId = req.user.id; // Assuming authenticateJWT adds user info to req.user

    const repliesWithOwnership = replies.map((reply) => ({
      ...reply.toObject(),
      isOwner: reply.userId._id.toString() === userId.toString(),
    }));

    res.status(200).json(repliesWithOwnership);
  } catch (error) {
    res.status(500).json({ message: "Error fetching replies", error });
  }
};

// Update a reply (only the owner can update)
exports.updateReply = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { reply } = req.body;
    const existingReply = await Reply.findById(req.params.id);

    if (!existingReply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    if (existingReply.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    existingReply.reply = reply;
    const updatedReply = await existingReply.save();

    // Populate the user details
    const populatedReply = await Reply.findById(updatedReply._id).populate(
      "userId",
      "firstName lastName"
    );

    res.status(200).json({
      message: "Reply updated successfully",
      reply: populatedReply,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating reply", error });
  }
};

// Delete a reply (only the owner can delete)
exports.deleteReply = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const reply = await Reply.findById(req.params.id);

    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    if (reply.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Reply.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting reply", error });
  }
};
