const User = require("../models/userModel");
const OTP = require("../models/otpModel");
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
  },
  {
    email: "cicsadmin2@gmail.com",
    password: "cics123",
    role: "admin",
  },
  {
    email: "cicsadmin3@gmail.com",
    password: "cics123",
    role: "admin",
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
        isVerified: true,
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
      password,
      confirmPassword,
    } = req.body;

    // Check if the email already exists/registered
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.isVerified) {
        return res.status(200).json({
          msg: "User not verified. Redirecting to OTP verification.",
          redirect: "/verifyaccount",
        });
      } else {
        return res.status(400).json({ msg: "User already exists" });
      }
    }

    // To check if a user with the same name and birthday already exists (regardless of email)
    const duplicateUser = await User.findOne({
      firstName: firstName,
      lastName: lastName,
      birthday: birthday,
    });

    if (duplicateUser) {
      if (duplicateUser.isVerified) {
        return res.status(400).json({
          msg: "Duplicate accounts is not allowed.",
        });
      } else {
        // Update the existing unverified user with the new email
        duplicateUser.email = email;
        duplicateUser.password = await bcrypt.hash(
          password,
          await bcrypt.genSalt(10)
        );
        await duplicateUser.save();

        return res.status(200).json({
          msg: "An unverified account with the same name and birthday exists. Redirecting to OTP verification.",
          redirect: "/verifyaccount",
        });
      }
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

    // Format birthday input to match CSV date format (YYYY-MM-DD)
    const formattedBirthday = formatDateToISO(birthday.trim());

    // Match record in the CSV
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
      isVerified: false, // Users not yet verified
    });

    await newUser.save();

    // Set a secure cookie for email
    res.cookie("userEmail", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only true in production
      sameSite: "Strict", // Only sent in same-site requests
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    return res.status(201).json({
      redirect: "/verifyaccount",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    await User.updateOne({ email }, { isVerified: true });
    await OTP.deleteOne({ email, otp });

    // Remove email cookie on successful verification
    res.clearCookie("userEmail");

    res.status(200).json({ msg: "User verified successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { email, otpType } = req.body;
    if (!email || !otpType) {
      return res.status(400).json({ msg: "OTP type are required" });
    }

    const otp = generateOTP();

    // Save OTP to the database
    const newOTP = new OTP({ email, otp });
    await newOTP.save();

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

// if the user cancel or return to the regis page
exports.cancel = (req, res) => {
  res.clearCookie("userEmail", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ msg: "Cancelled, cookie removed" });
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
