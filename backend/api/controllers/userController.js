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
        // Set email in cookie
        console.log("Attempting to set cookie for email:", email);
        res.cookie("userEmail", email, {
          httpOnly: true, // Set to false so frontend can access it
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 10 * 60 * 1000, // 1 day expiration
        });

        return res.status(200).json({
          msg: "User not verified. Redirecting to OTP verification.",
          redirect: "/verifyaccount",
        });
      } else {
        return res.status(400).json({ msg: "User already exists" });
      }
    }

    // Check for duplicate user by name and birthday
    const duplicateUser = await User.findOne({
      firstName: firstName,
      lastName: lastName,
      birthday: birthday,
    });

    if (duplicateUser) {
      if (duplicateUser.isVerified) {
        return res
          .status(400)
          .json({ msg: "Duplicate accounts are not allowed." });
      } else {
        duplicateUser.email = email;
        duplicateUser.password = await bcrypt.hash(
          password,
          await bcrypt.genSalt(10)
        );
        await duplicateUser.save();

        console.log("Attempting to set cookie for email:", email);
        res.cookie("userEmail", email, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 10 * 60 * 1000,
        });

        return res.status(200).json({
          msg: "User not verified. Redirecting to OTP verification.",
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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      studentNum: studentNum || "N/A",
      firstName,
      lastName,
      birthday: formattedBirthday,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    await newUser.save();

    try {
      console.log("Attempting to set cookie for email:", email);
      res.cookie("userEmail", email, {
        httpOnly: true, // Set to false so frontend can access it
        secure: process.env.NODE_ENV === "production", // Only set cookies over HTTPS in production
        sameSite: "strict", // Can adjust depending on CORS setup
        maxAge: 10 * 60 * 1000, // 10min expiration for example
      });

      console.log("Cookie set successfully for email:", email);

      res.status(200).json({
        redirect: "/verifyaccount",
      });
    } catch (error) {
      console.error("Failed to set cookie:", error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
exports.getEmailFromCookie = (req, res) => {
  const email = req.cookies.userEmail; // Retrieve the email from the cookie
  if (email) {
    return res.status(200).json({ email });
  } else {
    return res.status(400).json({ msg: "Session expired" });
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
