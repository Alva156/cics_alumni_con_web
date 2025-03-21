const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Thread",
    },
    userProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "UserProfile",
    },
    reply: { type: String, required: true },
  },
  { timestamps: true }
);

const Reply = mongoose.model("Reply", replySchema);
module.exports = Reply;
