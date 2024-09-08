const User = require("../models/userModel");
const OTP = require("../models/otpModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // 6 digit OTP
}

// Helper function to format date to YYYY-MM-DD
function formatDateToISO(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${year}-${month}-${day}`;
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

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    const csvFilePath = path.join(__dirname, "../alumnilist.csv");

    // Load and parse CSV data asynchronously
    const csvData = await new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on("data", (row) => {
          results.push(row);
        })
        .on("end", () => {
          resolve(results);
        })
        .on("error", (error) => {
          reject(error);
        });
    });

    // Debugging: Log the CSV data to check if it's loaded correctly
    console.log("CSV Data:", csvData);

    // Format the birthday input to match CSV date format (YYYY-MM-DD)
    const formattedBirthday = formatDateToISO(birthday.trim());

    let matchingRecord;

    // Validate based on whether studentNum is provided
    if (studentNum && studentNum.trim() !== "") {
      // Find matching record in CSV file using studentNum
      matchingRecord = csvData.find(
        (row) =>
          row.studentNum.trim() === studentNum.trim() &&
          row.firstName.trim().toLowerCase() ===
            firstName.trim().toLowerCase() &&
          row.lastName.trim().toLowerCase() === lastName.trim().toLowerCase() &&
          row.birthday.trim() === formattedBirthday // Ensure date format matches
      );
    } else {
      // If no studentNum, validate only firstName, lastName, and birthday
      matchingRecord = csvData.find(
        (row) =>
          row.firstName.trim().toLowerCase() ===
            firstName.trim().toLowerCase() &&
          row.lastName.trim().toLowerCase() === lastName.trim().toLowerCase() &&
          row.birthday.trim() === formattedBirthday // Ensure date format matches
      );
    }

    // Debugging: Log the matching record found (or not found)
    console.log("Matching Record:", matchingRecord);

    if (!matchingRecord) {
      return res.status(400).json({ msg: "Invalid registration details" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the new user
    const newUser = new User({
      studentNum: studentNum || "N/A",
      firstName,
      lastName,
      birthday: formattedBirthday,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp });

    // Debugging: Log the OTP record found (or not found)
    console.log("OTP Record:", otpRecord);

    if (!otpRecord) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // OTP is valid, update the user as verified
    await User.updateOne({ email }, { isVerified: true });

    // Optionally, delete OTP after successful verification
    await OTP.deleteOne({ email, otp });

    res.status(200).json({ msg: "User verified successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const { email, otpType } = req.body;
    if (!email || !otpType) {
      return res.status(400).json({ msg: "Email and OTP type are required" });
    }

    const otp = generateOTP();

    // Save OTP to the database
    const newOTP = new OTP({ email, otp });
    await newOTP.save();

    // Log the OTP being sent
    console.log(`Sending OTP ${otp} to ${email}`);

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
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
        console.error("Error sending OTP:", error);
        return res
          .status(500)
          .json({ msg: "Error sending OTP", error: error.message });
      }
      console.log("OTP sent successfully:", info.response);
      res.status(200).json({ msg: "OTP sent successfully" });
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(400).json({ msg: "Account not verified" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Successful login
    res.status(200).json({ success: true, msg: "Login successful" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
