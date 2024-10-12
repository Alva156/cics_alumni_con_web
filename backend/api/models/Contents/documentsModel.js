const mongoose = require("mongoose");
const { Schema } = mongoose;

const DocumentsSchema = new mongoose.Schema(
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

const Documents = mongoose.model("Documents", DocumentsSchema);
module.exports = Documents;
