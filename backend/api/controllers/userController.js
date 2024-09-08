const User = require("../models/userModel");
const OTP = require("../models/otpModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

// Helper function to generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // 6 digit OTP
}

exports.registerUser = async (req, res) => {
  try {
    const {
      studentNum,
      firstName,
      lastName,
      birthday,
      email,
      password,
      confirmPassword,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    // Validate against CSV
    const csvFilePath = path.join(__dirname, "../alumnilist.csv");
    let isValid = false;
    console.log("CSV File Path:", csvFilePath); // Debugging line

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        console.log("CSV Row:", row); // Debugging line
        if (
          row.studentNum === studentNum &&
          row.firstName === firstName &&
          row.lastName === lastName &&
          row.birthday === birthday
        ) {
          isValid = true;
        }
      })
      .on("end", async () => {
        if (!isValid) {
          return res.status(400).json({ msg: "Invalid registration details" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ msg: "User already exists" });
        }

        // Hash password and save user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
          studentNum,
          firstName,
          lastName,
          birthday,
          email,
          password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ msg: "User registered successfully" });
      });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // OTP is valid, save user to database
    const user = await User.findOne({ email });
    user.isVerified = true;
    await user.save();

    // Optionally, delete OTP after successful verification
    await OTP.deleteOne({ email, otp });

    res.status(200).json({ msg: "User verified successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();

    // Save OTP to the database
    const newOTP = new OTP({ email, otp });
    await newOTP.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "cidalvarico136@gmail.com",
        pass: "heat2002",
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ msg: "Error sending OTP" });
      }
      res.status(200).json({ msg: "OTP sent successfully" });
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
