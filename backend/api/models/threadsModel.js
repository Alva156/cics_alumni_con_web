const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  userProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "UserProfile",
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Thread = mongoose.model("Thread", threadSchema);
module.exports = Thread;
