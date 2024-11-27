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
const { body, validationResult } = require("express-validator");
const mongoSanitize = require("mongo-sanitize");

// Helper function to generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

// Helper function to format date to YYYY-MM-DD
function formatDateToISO(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${year}-${month}-${day}`;
}

exports.registerUser = async (req, res) => {
  try {
    await body("studentNum").optional().trim().run(req);

    await body("firstName").trim().isLength({ min: 1 }).run(req);

    await body("lastName").trim().isLength({ min: 1 }).run(req);

    await body("birthday").trim().isDate().run(req);

    await body("email").trim().isEmail().normalizeEmail().run(req);

    await body("mobileNumber").trim().run(req);

    await body("password").isLength({ min: 8 }).run(req);

    await body("confirmPassword")
      .custom((value, { req }) => value === req.body.password)
      .run(req);

    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sanitizedStudentNum = mongoSanitize(req.body.studentNum);
    const sanitizedFirstName = mongoSanitize(req.body.firstName);
    const sanitizedLastName = mongoSanitize(req.body.lastName);
    const sanitizedBirthday = mongoSanitize(req.body.birthday);
    const sanitizedEmail = mongoSanitize(req.body.email);
    const sanitizedMobileNumber = mongoSanitize(req.body.mobileNumber);
    const sanitizedPassword = mongoSanitize(req.body.password);
    const sanitizedConfirmPassword = mongoSanitize(req.body.confirmPassword);

    const normalizedFirstName = sanitizedFirstName.trim();
    const normalizedLastName = sanitizedLastName.trim();
    const formattedBirthday = formatDateToISO(sanitizedBirthday.trim());

    // Check if the email already exists/registered
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Check for duplicate user by name and birthday
    const duplicateUser = await User.findOne({
      firstName: { $regex: `^${normalizedFirstName}$`, $options: "i" }, // Case-insensitive match
      lastName: { $regex: `^${normalizedLastName}$`, $options: "i" }, // Case-insensitive match
      birthday: sanitizedBirthday.trim(),
    });

    if (duplicateUser) {
      return res
        .status(400)
        .json({ msg: "Duplicate accounts are not allowed." });
    }

    const csvFilePath = path.join(__dirname, "../alumnilist.csv");

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

    let matchingRecord;
    if (sanitizedStudentNum && sanitizedStudentNum.trim() !== "") {
      matchingRecord = csvData.find(
        (row) =>
          row.studentNum &&
          row.studentNum.trim() !== "0000000000" &&
          row.studentNum.trim() !== "" && // Skip if CSV studentNum is empty
          row.studentNum.trim() === sanitizedStudentNum.trim() &&
          row.firstName &&
          row.lastName &&
          row.birthday &&
          row.firstName.trim().toLowerCase() ===
            normalizedFirstName.toLowerCase() &&
          row.lastName.trim().toLowerCase() ===
            normalizedLastName.toLowerCase() &&
          row.birthday.trim() === formattedBirthday
      );
    } else {
      matchingRecord = csvData.find(
        (row) =>
          row.firstName &&
          row.lastName &&
          row.birthday &&
          row.firstName.trim().toLowerCase() ===
            normalizedFirstName.toLowerCase() &&
          row.lastName.trim().toLowerCase() ===
            normalizedLastName.toLowerCase() &&
          row.birthday.trim() === formattedBirthday
      );
    }

    // If no matching record, return a specific message
    if (!matchingRecord) {
      return res.status(400).json({
        msg: "No matching record found in the alumni list",
      });
    }

    // Generate JWT token with user details
    const tokenPayload = {
      studentNum: sanitizedStudentNum,
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName,
      birthday: sanitizedBirthday,
      email: sanitizedEmail,
      mobileNumber: sanitizedMobileNumber,
      password: sanitizedPassword,
    };
    const jwtToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "10m", // Set token expiry time
    });

    // Set JWT token in cookies
    res.cookie("userToken", jwtToken, {
      httpOnly: true,
      secure: true, // Only secure in production
      sameSite: "none",
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

// Import axios for sending HTTP requests
const axios = require("axios");

exports.sendOTP = async (req, res) => {
  try {
    // Get the token from the cookies
    const token = req.cookies.userToken;

    if (!token) {
      console.error("Token missing in request");
      return res.status(401).json({ msg: "Unauthorized, token missing" });
    }

    // Decode the token to get the user's details (email and mobile number)
    const { email, mobileNumber } = jwt.verify(token, process.env.JWT_SECRET);

    // Check if an otpType is specified and get the appropriate contact information
    const { otpType } = req.body;
    if (otpType === "Email" && email) {
      // Generate OTP and save it with the email
      const otp = generateOTP();
      const newOTP = new OTP({ email, otp });
      await newOTP.save();

      // Send OTP via email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f8; border-radius: 8px;">
          <div style="background-color: #ff4b4b; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
           
          </div>
          <div style="background-color: #fff; padding: 40px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #ff4b4b; text-align: center;">Your OTP Code</h2>
            <p style="text-align: center; font-size: 16px; color: #333;">
              Hello,
            </p>
            <p style="text-align: center; font-size: 16px; color: #333;">
              To continue with your registration, please use the following One-Time Password (OTP):
            </p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px;">
              <h1 style="color: #ff4b4b; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
            </div>
            <p style="text-align: center; font-size: 14px; color: #777;">
              This OTP will expire in 5 minutes.
            </p>
            <p style="text-align: center; font-size: 14px; color: #777;">
              If you didn’t request this, please ignore this email.
            </p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <p style="font-size: 12px; color: #999;">
            © 2024 CICS Alumni Connect. All rights reserved.
          </p>
        </div>
      </div>
    `;

      const mailOptions = {
        from: '"CICS Alumni Connect" <' + process.env.EMAIL_USER + ">",
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}`,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);
      console.log(`OTP sent to email: ${email}`);
    } else if (otpType === "SMS" && mobileNumber) {
      // Generate OTP and save it with the mobile number
      const otp = generateOTP();
      const newOTP = new OTP({ mobileNumber, otp });
      await newOTP.save();

      // Send OTP via SMS using PhilSMS
      const response = await axios.post(
        "https://app.philsms.com/api/v3/sms/send",
        {
          recipient: mobileNumber, // Use "recipient" instead of "to" to match PhilSMS syntax
          sender_id: "PhilSMS", // Replace "YourName" with your actual sender ID if needed
          type: "plain",
          message: `Your registration OTP is ${otp}. Expires in 5 mins.`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PHILSMS_API_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      console.log(`OTP sent to mobile number: ${mobileNumber}`);
    } else {
      return res
        .status(400)
        .json({ msg: "Valid email or mobile number required for OTP" });
    }

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
    await body("otp").trim().isLength({ min: 6, max: 6 }).isNumeric().run(req);

    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sanitizedOtp = mongoSanitize(req.body.otp);

    // Get the token from the cookies
    const token = req.cookies.userToken;
    if (!token) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Decode the token to get user details
    const userDetails = jwt.verify(token, process.env.JWT_SECRET);
    const {
      studentNum,
      firstName,
      lastName,
      birthday,
      email,
      mobileNumber,
      password,
    } = userDetails;

    const sanitizedStudentNum = mongoSanitize(studentNum);
    const sanitizedFirstName = mongoSanitize(firstName);
    const sanitizedLastName = mongoSanitize(lastName);
    const sanitizedBirthday = mongoSanitize(birthday);
    const sanitizedEmail = mongoSanitize(email);
    const sanitizedMobileNumber = mongoSanitize(mobileNumber);

    // Check for OTP associated with either email or mobile number
    let otpRecord;
    if (sanitizedEmail) {
      otpRecord = await OTP.findOne({
        email: sanitizedEmail,
        otp: sanitizedOtp,
      });
    }
    if (!otpRecord && sanitizedMobileNumber) {
      otpRecord = await OTP.findOne({
        mobileNumber: sanitizedMobileNumber,
        otp: sanitizedOtp,
      });
    }

    // If OTP does not match, return an error
    if (!otpRecord) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // Hash the password from the token
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the user already exists to prevent duplicate records
    const existingUser = await User.findOne(
      sanitizedEmail
        ? { email: sanitizedEmail }
        : { mobileNumber: sanitizedMobileNumber }
    );
    if (existingUser) {
      return res.status(400).json({ msg: "User already registered" });
    }

    // Create a new user record with isVerified set to true
    const newUser = new User({
      studentNum: sanitizedStudentNum || "N/A",
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName,
      birthday: sanitizedBirthday,
      email: sanitizedEmail,
      mobileNumber: sanitizedMobileNumber,
      password: hashedPassword,
      isVerified: true,
    });

    await newUser.save();
    await OTP.deleteOne({ _id: otpRecord._id }); // Clean up OTP record after successful verification

    // Send success response along with user details
    return res.status(200).json({
      user: {
        studentNum: sanitizedStudentNum,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        email: sanitizedEmail,
        mobileNumber: sanitizedMobileNumber,
        birthday: sanitizedBirthday,
      },
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
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("resetToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
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
    // Apply validation and sanitization to input fields
    await body("email")
      .trim()
      .isEmail()
      .withMessage("Invalid email or password")
      .normalizeEmail()
      .run(req);

    await body("password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Invalid email or password")
      .run(req);

    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there are validation errors, send specific messages based on the field
      const errorMessages = errors.array().map((error) => error.msg);
      return res.status(400).json({ msg: errorMessages.join(", ") });
    }

    const sanitizedEmail = mongoSanitize(req.body.email);
    const sanitizedPassword = mongoSanitize(req.body.password);
    console.log("...");

    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        msg: "Account not verified. Register your account once again to get verified",
      });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(sanitizedPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Fetch the userProfile to get the profileId
    const userProfile = await UserProfile.findOne({ userId: user._id });
    if (!userProfile) {
      return res.status(400).json({ msg: "UserProfile not found" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileId: userProfile._id,
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
      secure: true, // Only send via HTTPS in production
      sameSite: "none", // Strict SameSite policy to prevent CSRF attacks
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

exports.checkAuth = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, msg: "Not authenticated" });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Return success with user role
    return res.status(200).json({
      success: true,
      role: decoded.role, // Include role in the response
    });
  } catch (error) {
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

// Logout user
exports.logoutUser = async (req, res) => {
  try {
    // Clear the token cookie with the same options as when it was set
    res.clearCookie("token", {
      httpOnly: true, // Ensures the cookie is only accessible by the web server
      secure: true, // Only send the cookie over HTTPS
      sameSite: "none", // Allow cross-origin requests
    });

    console.log(`User logged out: ${req.user.id}, Email: ${req.user.email}`);

    res.status(200).json({
      msg: "Logout successful. Cookie cleared.",
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// FORGET PASS
exports.forgotPassword = async (req, res) => {
  try {
    await body("email").optional().isEmail().normalizeEmail().run(req);

    await body("mobileNumber").optional().run(req);

    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sanitizedEmail = mongoSanitize(req.body.email);
    const sanitizedMobileNumber = mongoSanitize(req.body.mobileNumber);

    let user;

    // Check if email or mobileNumber is provided and search based on that
    if (sanitizedEmail) {
      user = await User.findOne({ email: sanitizedEmail });
      if (!user) {
        return res.status(400).json({ msg: "Email not found" });
      }
    } else if (sanitizedMobileNumber) {
      user = await User.findOne({ mobileNumber: sanitizedMobileNumber });
      if (!user) {
        return res.status(400).json({ msg: "Mobile number not found" });
      }
    } else {
      return res
        .status(400)
        .json({ msg: "Email or mobile number is required" });
    }

    // Generate a new OTP
    const otp = generateOTP();

    // Save the OTP entry associated with either email or mobile number
    const otpEntry = await OTP.findOneAndUpdate(
      sanitizedEmail
        ? { email: sanitizedEmail }
        : { mobileNumber: sanitizedMobileNumber }, // use email if provided, otherwise mobileNumber
      { otp },
      { new: true, upsert: true }
    );

    // Send OTP via email if email was provided
    if (sanitizedEmail) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f8; border-radius: 8px;">
          <div style="background-color: #ff4b4b; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
           
          </div>
          <div style="background-color: #fff; padding: 40px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #ff4b4b; text-align: center;">Your OTP Code</h2>
            <p style="text-align: center; font-size: 16px; color: #333;">
              Hello,
            </p>
            <p style="text-align: center; font-size: 16px; color: #333;">
              To continue with your resetting your password, please use the following One-Time Password (OTP):
            </p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px;">
              <h1 style="color: #ff4b4b; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
            </div>
            <p style="text-align: center; font-size: 14px; color: #777;">
              This OTP will expire in 5 minutes.
            </p>
            <p style="text-align: center; font-size: 14px; color: #777;">
              If you didn’t request this, please ignore this email.
            </p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <p style="font-size: 12px; color: #999;">
            © 2024 CICS Alumni Connect. All rights reserved.
          </p>
        </div>
      </div>
    `;

      const mailOptions = {
        from: `"CICS Alumni Connect" <${process.env.EMAIL_USER}>`,
        to: sanitizedEmail,
        subject: "Your OTP Code for Password Reset",
        text: `Your OTP code is ${otp}`,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);
    }

    // Send OTP via SMS if mobile number was provided
    if (sanitizedMobileNumber) {
      await axios.post(
        "https://app.philsms.com/api/v3/sms/send",
        {
          recipient: sanitizedMobileNumber,
          sender_id: "PhilSMS",
          type: "plain",
          message: `Your OTP to reset your password is ${otp}. Expires in 5 mins.`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PHILSMS_API_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
    }

    return res.status(200).json({ msg: "OTP sent successfully" });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.verifyOTPPassword = async (req, res) => {
  try {
    await body("email").optional().isEmail().normalizeEmail().run(req);

    await body("mobileNumber").optional().run(req);

    await body("otp")
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits")
      .isNumeric()
      .run(req);

    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sanitizedEmail = mongoSanitize(req.body.email);
    const sanitizedMobileNumber = mongoSanitize(req.body.mobileNumber);
    const sanitizedOTP = mongoSanitize(req.body.otp);

    const query = sanitizedEmail
      ? { email: sanitizedEmail, otp: sanitizedOTP }
      : { mobileNumber: sanitizedMobileNumber, otp: sanitizedOTP };

    const otpRecord = await OTP.findOne(query);

    if (!otpRecord) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    await OTP.deleteOne(query);

    const token = jwt.sign(
      { email: sanitizedEmail, mobileNumber: sanitizedMobileNumber },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("resetToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 10 * 60 * 1000,
    });

    res.status(200).json({ msg: "OTP verified successfully" });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};
exports.resetPassword = async (req, res) => {
  const token = req.cookies.resetToken;

  if (!token) {
    return res.status(400).json({ msg: "JWT token not set" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, mobileNumber } = decoded;

    await body("newPassword").exists().isLength({ min: 8 }).run(req);

    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sanitizedNewPassword = mongoSanitize(req.body.newPassword);

    const user = email
      ? await User.findOne({ email })
      : await User.findOne({ mobileNumber });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(sanitizedNewPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.clearCookie("resetToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({ msg: "Password reset successfully" });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};
