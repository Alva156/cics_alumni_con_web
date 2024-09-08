const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  studentNum: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthday: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false }, // Add a field to track if the user is verified
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
