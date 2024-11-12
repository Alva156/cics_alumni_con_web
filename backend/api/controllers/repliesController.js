const Reply = require("../models/replyModel");
const Thread = require("../models/threadsModel");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

exports.createReply = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userProfileId = decoded.profileId;

    const { threadId, reply } = req.body;

    // Create the new reply
    const newReply = new Reply({
      threadId,
      userProfileId,
      reply,
    });

    await newReply.save();

    // Populate the user profile details for the response
    const populatedReply = await Reply.findById(newReply._id).populate(
      "userProfileId",
      "firstName lastName profileImage profession"
    );

    // Check if the thread has notifications enabled
    const thread = await Thread.findById(threadId).populate(
      "userProfileId",
      "accountEmail"
    );

    if (
      thread.notifEnabled &&
      thread.userProfileId &&
      thread.userProfileId.accountEmail
    ) {
      // Configure Nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Compose email content for the new reply notification
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f8; border-radius: 8px;">
            <div style="background-color: #ff4b4b; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="color: #fff;">New Reply to Your Thread</h2>
            </div>
            <div style="background-color: #fff; padding: 40px; border-radius: 0 0 8px 8px;">
             
              <p style="font-size: 16px;">
                You have a new reply to your thread titled "<strong>${thread.title}</strong>" on CICS Alumni Connect:
              </p>
              <blockquote style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #ff4b4b;">
                <p style="font-size: 14px; color: #555;">"${reply}"</p>
              </blockquote>
              
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 12px; color: #999;">
              © 2024 CICS Alumni Connect. All rights reserved.
            </p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: '"CICS Alumni Connect" <' + process.env.EMAIL_USER + ">",
        to: thread.userProfileId.accountEmail,
        subject: "New Reply to Your Thread",
        html: htmlContent,
      };

      // Send the email notification
      await transporter.sendMail(mailOptions);
    }

    res.status(201).json({
      message: "Reply added successfully!",
      reply: populatedReply,
    });
  } catch (error) {
    console.error("Error creating reply:", error);
    res.status(500).json({ error: "Failed to add reply" });
  }
};

// Get replies for a thread
exports.getRepliesByThreadId = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userProfileId = decoded.profileId; // Use profileId from the JWT

    const replies = await Reply.find({
      threadId: req.params.threadId,
    }).populate("userProfileId", "firstName lastName profileImage profession");

    // Check if the current user's profileId matches the profileId of the reply's creator
    const repliesWithOwnership = replies.map((reply) => ({
      ...reply.toObject(),
      isOwner: reply.userProfileId._id.toString() === userProfileId.toString(),
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
    const userProfileId = decoded.profileId;

    const { reply } = req.body;
    const existingReply = await Reply.findById(req.params.id);

    if (!existingReply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    if (existingReply.userProfileId.toString() !== userProfileId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    existingReply.reply = reply;
    const updatedReply = await existingReply.save();

    // Populate the user details
    const populatedReply = await Reply.findById(updatedReply._id).populate(
      "userProfileId",
      "firstName lastName profileImage profession"
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
    const userProfileId = decoded.profileId;

    const reply = await Reply.findById(req.params.id);

    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    if (reply.userProfileId.toString() !== userProfileId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Reply.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting reply", error });
  }
};
