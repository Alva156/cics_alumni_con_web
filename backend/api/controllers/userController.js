const User = require("../models/userModel");
const OTP = require("../models/otpModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

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

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    const csvFilePath = path.join(__dirname, "../alumnilist.csv");

    //  CSV chekcer rawr
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

    console.log("CSV Data:", csvData);

    // To Format birthday input to match CSV date format (YYYY-MM-DD)
    const formattedBirthday = formatDateToISO(birthday.trim());

    let matchingRecord;

    // Mailagay ba studentNum?
    if (studentNum && studentNum.trim() !== "") {
      matchingRecord = csvData.find(
        (row) =>
          row.studentNum.trim() === studentNum.trim() &&
          row.firstName.trim().toLowerCase() ===
            firstName.trim().toLowerCase() &&
          row.lastName.trim().toLowerCase() === lastName.trim().toLowerCase() &&
          row.birthday.trim() === formattedBirthday // Ensure date format matches
      );
    } else {
      matchingRecord = csvData.find(
        (row) =>
          row.firstName.trim().toLowerCase() ===
            firstName.trim().toLowerCase() &&
          row.lastName.trim().toLowerCase() === lastName.trim().toLowerCase() &&
          row.birthday.trim() === formattedBirthday // Ensure date format matches
      );
    }

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

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp });

    console.log("OTP Record:", otpRecord);

    if (!otpRecord) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // OTP is valid, update the user to as verified
    await User.updateOne({ email }, { isVerified: true });

    // to delete otp after successful regis
    await OTP.deleteOne({ email, otp });

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
      return res.status(400).json({ msg: "Email and OTP type are required" });
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

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt with email:", email);

    // Check if email matches any hardcoded admin accounts
    const adminAccount = adminAccountsPlain.find(
      (account) => account.email === email
    );

    if (adminAccount) {
      console.log("Admin account found:", adminAccount);

      // Retrieve the admin account from the database
      const dbAdmin = await User.findOne({ email });
      if (!dbAdmin) {
        console.log("Admin not found in database");
        return res.status(400).json({ msg: "Invalid email or password" });
      }

      // Compare password with hashed password
      const isMatch = await bcrypt.compare(password, dbAdmin.password);
      if (!isMatch) {
        console.log("Invalid password for admin account");
        return res.status(400).json({ msg: "Invalid email or password" });
      }

      // Successful login for admin
      return res.status(200).json({
        success: true,
        msg: "Login successful",
        role: dbAdmin.role,
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      console.log("User not verified:", email);
      return res.status(400).json({ msg: "Account not verified" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password for user:", email);
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Successful login
    res.status(200).json({
      success: true,
      msg: "Login successful",
      role: user.role,
    });
  } catch (err) {
    console.error("Server error in loginUser:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
