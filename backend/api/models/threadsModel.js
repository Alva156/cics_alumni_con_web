const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema(
  {
    userProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "UserProfile",
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String, required: true },
    notifEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Thread = mongoose.model("Thread", threadSchema);
module.exports = Thread;
