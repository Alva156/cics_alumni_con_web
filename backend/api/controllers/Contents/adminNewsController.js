const News = require("../../models/Contents/newsModel");
const User = require("../../models/userModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config();
// Set storage engine for news images
const storage = multer.diskStorage({
  destination: "./uploads/contents/news", // Save images in the 'uploads' directory
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize upload for news images
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
      return cb(new Error("Only images (jpeg, jpg, png) are allowed"));
    }

    cb(null, true);
  },
}).single("image");

// Create new news
exports.createNews = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ msg: "Image must be a maximum of 5MB" });
      }
      return res.status(400).json({ msg: err.message });
    }

    try {
      const token = req.cookies.token;
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized, token missing." });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const { name, address, description, contact } = req.body;
      const image = req.file
        ? `/uploads/contents/news/${req.file.filename}`
        : null;

      const news = new News({
        userId,
        name,
        address,
        image,
        description,
        contact,
      });

      await news.save();
      // Fetch all user emails
      const users = await User.find();
      const emailAddresses = users.map((user) => user.email);

      // Send email notification
      await sendEmailNotification(
        emailAddresses,
        "📰 New News Alert from CICS Alumni Connect!",
        `Hello everyone! 👋\n\nWe’re thrilled to bring you some exciting news from CICS Alumni Connect! Our admin team has just shared some fresh and important news that you won’t want to miss.\n\nStay in the loop and discover what’s happening in our community—there could be valuable insights and opportunities for you!\n\nBe sure to check out the latest news now and see what’s new! 🔗\n\nBest wishes,\nThe CICS Alumni Connect Team`
      );

      res.status(201).json(news);
    } catch (error) {
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  });
};

// Get all news for a specific user
exports.getNews = async (req, res) => {
  try {
    const news = await News.find();
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get a single news by ID
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ msg: "News not found" });
    }

    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Update news
exports.updateNews = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ msg: "Image must be a maximum of 5MB" });
      }
      return res.status(400).json({ msg: err.message });
    }

    try {
      const token = req.cookies.token;
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized, token missing." });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      const userRole = decoded.role;

      const { name, address, description, contact } = req.body;
      const news = await News.findById(req.params.id);

      if (!news) {
        return res.status(404).json({ msg: "News not found" });
      }

      if (userRole !== "admin" && news.userId.toString() !== userId) {
        return res.status(403).json({ msg: "Unauthorized" });
      }

      const newImage = req.file
        ? `/uploads/contents/news/${req.file.filename}`
        : news.image;

      if (req.file && news.image) {
        const oldImagePath = path.join(__dirname, `../../../${news.image}`);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      news.name = name || news.name;
      news.address = address || news.address;
      news.image = newImage;
      news.description = description || news.description;
      news.contact = contact || news.contact;

      await news.save();
      // Fetch all user emails
      const users = await User.find();
      const emailAddresses = users.map((user) => user.email);

      // Send email notification
      await sendEmailNotification(
        emailAddresses,
        "🔔 Quick Heads Up: Recent News Update!",
        `Hello everyone! 👋\n\nWe wanted to let you know that some existing news about "${name}" has just been updated!  Our team has refreshed the details, and you won’t want to miss the latest insights.\n\nStay informed about what’s new—there could be valuable information and opportunities for you! \n\nCheck out the updated news now and see what’s changed! 🔗\n\nBest regards,\nThe CICS Alumni Connect Team`
      );

      res.status(200).json(news);
    } catch (error) {
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  });
};

// Delete news
exports.deleteNews = async (req, res) => {
  console.log("Delete request received for news ID:", req.params.id);
  try {
    const token = req.cookies.token;
    if (!token) {
      console.log("Token is missing.");
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const userRole = decoded.role;

    const news = await News.findById(req.params.id);
    if (!news) {
      console.log("News not found:", req.params.id);
      return res.status(404).json({ message: "News not found" });
    }

    if (userRole !== "admin" && news.userId.toString() !== userId) {
      console.log("Unauthorized attempt to delete news:", userId, news.userId);
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (news.image) {
      const imagePath = path.join(__dirname, `../../../${news.image}`);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Old image deleted successfully:", imagePath);
      } else {
        console.log("Image not found at path:", imagePath);
      }
    }

    await News.deleteOne({ _id: req.params.id });
    console.log("News deleted successfully:", req.params.id);
    res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    console.error("Error deleting news:", error);
    res
      .status(500)
      .json({ message: "Error deleting news", error: error.message });
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
