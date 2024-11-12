const Jobs = require("../../models/Contents/jobsModel");
const User = require("../../models/userModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Set storage engine for job images
const storage = multer.diskStorage({
  destination: "./uploads/contents/jobs", // Save images in the 'uploads' directory for jobs
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (!mimetype || !extname) {
      return cb(new Error("Only images (jpeg, jpg, png) are allowed")); // Custom error message
    }

    cb(null, true);
  },
}).single("image");

// Create new jobs
exports.createJobs = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ msg: "Image must be a maximum of 5MB" });
      }
      return res.status(400).json({ msg: err.message });
    }

    try {
      const token = req.cookies.token; // Get the token from cookies
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized, token missing." });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id; // Get userId from the decoded token

      const { name, address, description, contact } = req.body;
      const image = req.file
        ? `/uploads/contents/jobs/${req.file.filename}`
        : null;

      const jobs = new Jobs({
        userId,
        name,
        address,
        image,
        description,
        contact,
      });
      await jobs.save();
      // Fetch all user emails
      const users = await User.find();
      const emailAddresses = users.map((user) => user.email);

      // Send email notification
      await sendEmailNotification(
        emailAddresses,
        "🏆 New Job Opportunity Alert! ",
        `A new job opportunity titled "${name}" is now available. Check it out and see what this position has to offer—it could be a fantastic chance for new insights and career growth!`
      );

      res.status(201).json(jobs);
    } catch (error) {
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  });
};

// Get all jobs for a specific user
exports.getJobs = async (req, res) => {
  try {
    // Fetch all jobs without filtering by userId
    const jobs = await Jobs.find();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get a single job by ID
exports.getJobsById = async (req, res) => {
  try {
    const jobs = await Jobs.findById(req.params.id);

    if (!jobs) {
      return res.status(404).json({ msg: "Jobs not found" });
    }

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Update jobs
exports.updateJobs = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ msg: "Image must be a maximum of 5MB" });
      }
      return res.status(400).json({ msg: err.message });
    }

    try {
      const token = req.cookies.token; // Get the token from cookies
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized, token missing." });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id; // Get userId from the decoded token
      const userRole = decoded.role; // Get user role from the decoded token

      const { name, address, description, contact } = req.body;
      const jobs = await Jobs.findById(req.params.id);

      if (!jobs) {
        return res.status(404).json({ msg: "Jobs not found" });
      }

      // Ensure user is admin or owns the job
      if (userRole !== "admin" && jobs.userId.toString() !== userId) {
        return res.status(403).json({ msg: "Unauthorized" });
      }

      const newImage = req.file
        ? `/uploads/contents/jobs/${req.file.filename}`
        : null;

      // If there's a new image, delete the old one
      if (newImage && jobs.image) {
        const oldImagePath = path.join(__dirname, `../../../${jobs.image}`);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      jobs.name = name || jobs.name;
      jobs.address = address || jobs.address;
      jobs.image = newImage || jobs.image;
      jobs.description = description || jobs.description;
      jobs.contact = contact || jobs.contact;

      await jobs.save();
      // Fetch all user emails
      const users = await User.find();
      const emailAddresses = users.map((user) => user.email);

      // Send email notification
      await sendEmailNotification(
        emailAddresses,
        "🔔 Quick Heads Up: Job Opportunity Details Updated! ",
        `Heads up! The details for the job opportunity titled "${name}" have recently been updated. Be sure to check out the latest information—they might have something valuable to offer!`
      );

      res.status(200).json(jobs);
    } catch (error) {
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  });
};

// Delete jobs
exports.deleteJobs = async (req, res) => {
  console.log("Delete request received for jobs ID:", req.params.id);
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      console.log("Token is missing.");
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token
    const userRole = decoded.role; // Get user role from the decoded token

    const jobs = await Jobs.findById(req.params.id);
    if (!jobs) {
      console.log("Jobs not found:", req.params.id);
      return res.status(404).json({ message: "Jobs not found" });
    }

    // Ensure user is admin or owns the job
    if (userRole !== "admin" && jobs.userId.toString() !== userId) {
      console.log("Unauthorized attempt to delete jobs:", userId, jobs.userId);
      return res.status(403).json({ message: "Unauthorized" });
    }

    // If the job has an image, delete the image file from the server
    if (jobs.image) {
      const imagePath = path.join(__dirname, `../../../${jobs.image}`);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the image file
        console.log("Old image deleted successfully:", imagePath);
      } else {
        console.log("Image not found at path:", imagePath);
      }
    }

    await Jobs.deleteOne({ _id: req.params.id });
    console.log("Jobs deleted successfully:", req.params.id);
    res.status(200).json({ message: "Jobs deleted successfully" });
  } catch (error) {
    console.error("Error deleting jobs:", error);
    res
      .status(500)
      .json({ message: "Error deleting jobs", error: error.message });
  }
};
// Function to send email notifications
const sendEmailNotification = async (emailAddresses, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
        <div style="background-color: #f5f5f5; padding: 20px;">
          <div style="background-color: #ffffff; padding: 20px; max-width: 600px; margin: 0 auto; border-radius: 8px;">
            <div style="text-align: center; padding-bottom: 20px;">
              <img src="https://your-logo-url.com/logo.png" alt="Company Logo" style="max-width: 150px;">
            </div>
            <div style="background-color: #ff4b4b; color: #ffffff; padding: 15px; border-radius: 8px;">
              <h1 style="margin: 0; font-size: 24px; text-align: center;">${subject}</h1>
            </div>
            <div style="padding: 20px 0; text-align: center; font-size: 18px; color: #333;">
              <p>${message}</p>
            </div>
            <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <p style="text-align: center; font-size: 14px; color: #555;">
                This email is sent to keep you updated with the latest updates.
              </p>
              <p style="text-align: center; font-size: 14px; color: #555;">
                © 2024 CICS Alumni Connect. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      bcc: emailAddresses, // Use 'bcc' to hide recipients
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent to:", emailAddresses);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};
