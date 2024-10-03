const mongoose = require("mongoose");
const { Schema } = mongoose;

const OTP_Schema = new Schema({
  email: { type: String, required: true },
  // mobileNumber: { type: String, required: true },
  otp: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // OTP expires in 5 minutes
});

const OTP = mongoose.model("OTP", OTP_Schema);
module.exports = OTP;
