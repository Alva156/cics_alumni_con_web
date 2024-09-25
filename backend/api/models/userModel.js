const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  studentNum: {
    type: String,
    required: function () {
      return this.role === "user";
    }, // Only required for non-admin users and for first name, last name and birthday
  },
  firstName: {
    type: String,
    required: function () {
      return this.role === "user";
    },
  },
  lastName: {
    type: String,
    required: function () {
      return this.role === "user";
    },
  },
  birthday: {
    type: String,
    required: function () {
      return this.role === "user";
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
