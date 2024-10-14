const mongoose = require("mongoose");
const { Schema } = mongoose;

const JobsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assuming you have a User model
      required: true,
    },
    name: { type: String, required: true },
    address: { type: String, required: true },
    image: { type: String },
    description: { type: String },
    contact: { type: String },
  },
  { timestamps: true }
);

const Jobs = mongoose.model("Jobs", JobsSchema);
module.exports = Jobs;
