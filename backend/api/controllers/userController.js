const User = require("../models/userModel");
const OTP = require("../models/otpModel");
const UserProfile = require("../models/userProfileModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const jwt = require("jsonwebtoken");

// Helper function to generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // 6 digit OTP
}

// Helper function to format date to YYYY-MM-DD
function formatDateToISO(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${year}-${month}-${day}`;
}

// Admin accounts
const adminAccountsPlain = [
  {
    email: "cicsadmin@gmail.com",
    password: "cics123",
    role: "admin",
    mobileNumber: "00000000000",
  },
  {
    email: "cicsadmin2@gmail.com",
    password: "cics123",
    role: "admin",
    mobileNumber: "00000000000",
  },
  {
    email: "cicsadmin3@gmail.com",
    password: "cics123",
    role: "admin",
    mobileNumber: "00000000000",
  },
];

async function setupAdminAccounts() {
  try {
    const salt = await bcrypt.genSalt(10);

    const hashedAdmins = await Promise.all(
      adminAccountsPlain.map(async (account) => ({
        email: account.email,
        password: await bcrypt.hash(account.password, salt), // Hashing the password
        role: account.role,
        studentNum: "N/A",
        firstName: "CICS",
        lastName: "Admin",
        birthday: "1000-01-01",
        mobileNumber: account.mobileNumber,
        isVerified: true,
        createdAt: Date.now(),
      }))
    );

    for (const admin of hashedAdmins) {
      await User.findOneAndUpdate(
        { email: admin.email },
        { $set: admin },
        { upsert: true, new: true }
      );
    }

    console.log("Admin accounts have been set up successfully");
  } catch (err) {
    console.error("Error setting up admin accounts:", err);
  }
}
setupAdminAccounts();

// User registration
exports.registerUser = async (req, res) => {
  try {
    const {
      studentNum,
      firstName,
      lastName,
      birthday,
      email,
      mobileNumber,
      password,
      confirmPassword,
    } = req.body;

    // Check if the email already exists/registered
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Check for duplicate user by name and birthday
    const duplicateUser = await User.findOne({
      firstName: firstName,
      lastName: lastName,
      birthday: birthday,
    });

    if (duplicateUser) {
      return res
        .status(400)
        .json({ msg: "Duplicate accounts are not allowed." });
    }

    const csvFilePath = path.join(__dirname, "../alumnilist.csv");

    // Read and validate CSV data
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

    const formattedBirthday = formatDateToISO(birthday.trim());
    let matchingRecord;

    if (studentNum && studentNum.trim() !== "") {
      matchingRecord = csvData.find(
        (row) =>
          row.studentNum.trim() === studentNum.trim() &&
          row.firstName.trim().toLowerCase() ===
            firstName.trim().toLowerCase() &&
          row.lastName.trim().toLowerCase() === lastName.trim().toLowerCase() &&
          row.birthday.trim() === formattedBirthday
      );
    } else {
      matchingRecord = csvData.find(
        (row) =>
          row.firstName.trim().toLowerCase() ===
            firstName.trim().toLowerCase() &&
          row.lastName.trim().toLowerCase() === lastName.trim().toLowerCase() &&
          row.birthday.trim() === formattedBirthday
      );
    }

    if (!matchingRecord) {
      return res.status(400).json({
        msg: "No matching record found in the alumni list",
      });
    }

    // Generate JWT token with user details
    const tokenPayload = { firstName, lastName, birthday, email, mobileNumber };
    const jwtToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "10m", // Set token expiry time
    });

    // Set JWT token in cookies
    res.cookie("userToken", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: "strict",
      maxAge: 10 * 60 * 1000, // 10 minutes expiration
    });

    return res.status(200).json({
      msg: "Alumni verified. Proceeding to OTP verification...",
      redirect: "/verifyaccount",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};
// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    // Get the token from the cookies
    const token = req.cookies.userToken;

    if (!token) {
      console.error("Token missing in request");
      return res.status(401).json({ msg: "Unauthorized, token missing" });
    }

    // Decode the token to get the user details (specifically email)
    const { email } = jwt.verify(token, process.env.JWT_SECRET);

    if (!email) {
      return res.status(400).json({ msg: "Email is required for OTP" });
    }

    // Generate OTP and save it associated with the user's email
    const otp = generateOTP();
    const newOTP = new OTP({ email, otp });
    await newOTP.save();

    console.log(`Sending OTP ${otp} to email: ${email}`);

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

    await transporter.sendMail(mailOptions);

    // Respond with success message
    res.status(200).json({ msg: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    // Get the token from the cookies
    const token = req.cookies.userToken;
    if (!token) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Decode the token to get user details
    const userDetails = jwt.verify(token, process.env.JWT_SECRET);
    const { firstName, lastName, birthday, email, mobileNumber } = userDetails;

    // Validate OTP
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // Hash password or use a default
    const hashedPassword = await bcrypt.hash(
      req.body.password || "defaultPassword",
      10
    );

    // Check if the user already exists to avoid duplicate records
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already registered" });
    }

    // Create a new user record
    const newUser = new User({
      studentNum: "N/A", // If applicable, change based on real logic
      firstName,
      lastName,
      birthday,
      email,
      mobileNumber,
      password: hashedPassword,
      isVerified: true,
    });

    await newUser.save();
    await OTP.deleteOne({ email, otp }); // Clean up OTP records

    // Send success response along with user details
    return res.status(200).json({
      user: { firstName, lastName, email, mobileNumber, birthday },
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    // Clear the cookies
    res.clearCookie("userToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    res.clearCookie("userEmail", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    res.clearCookie("userMobile", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    // Send response to indicate success
    res.status(200).json({ msg: "Cookies cleared, process canceled" });
  } catch (error) {
    console.error("Error clearing cookies:", error);
    res
      .status(500)
      .json({ msg: "Error canceling process", error: error.message });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        msg: "Account not verified. Register your account once again to get verified",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const decodedToken = jwt.decode(token);
    const expirationTime = new Date(decodedToken.exp * 1000); // Convert to milliseconds

    console.log("Token Contents:", decodedToken);
    console.log("Token Expiration Time:", expirationTime.toLocaleString());

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true, // Secure cookie, not accessible via JavaScript
      secure: process.env.NODE_ENV === "production", // Only send via HTTPS in production
      sameSite: "strict", // Strict SameSite policy to prevent CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      success: true,
      msg: "Login successful",
      role: user.role,
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Logout user
exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    console.log(`User logged out: ${req.user.id}, Email: ${req.user.email}`);

    res.status(200).json({
      msg: "Logout successful. Cookie cleared.",
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
//FORGET PASS
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Email not found" });
    }

    // Generate a new OTP and save it
    const otp = generateOTP();
    const otpEntry = await OTP.findOneAndUpdate(
      { email },
      { otp }, // Update existing OTP entry
      { new: true, upsert: true } // Create if not exists
    );

    // Send OTP via email (using nodemailer)
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
      subject: "Your OTP Code for Password Reset",
      text: `Your OTP code is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`); // Console log for OTP sent

    return res.status(200).json({ msg: "OTP resent to email" });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.verifyOTPPassword = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // OTP is valid, delete OTP entry
    await OTP.deleteOne({ email, otp });

    // Set a secure cookie for email
    res.cookie("userEmail", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
    });

    // Respond with a success message
    res.status(200).json({ msg: "OTP verified successfully" });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const email = req.cookies.userEmail;
  const { newPassword } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Email cookie not set" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // Clear the email cookie after the password is reset
    res.clearCookie("userEmail");

    return res.status(200).json({ msg: "Password reset successfully" });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};
