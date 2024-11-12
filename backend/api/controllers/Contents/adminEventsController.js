const Events = require("../../models/Contents/eventsModel");
const User = require("../../models/userModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Set storage engine for images
const storage = multer.diskStorage({
  destination: "./uploads/contents/events", // Save images in the 'uploads' directory for events
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
      return cb(new Error("Only images (jpeg, jpg, png) are allowed"));
    }

    cb(null, true);
  },
}).single("image");

// Create new events
exports.createEvents = async (req, res) => {
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
        ? `/uploads/contents/events/${req.file.filename}`
        : null;

      const events = new Events({
        userId,
        name,
        address,
        image,
        description,
        contact,
      });

      await events.save();

      // Fetch all user emails
      const users = await User.find();
      const emailAddresses = users.map((user) => user.email);

      // Send email notification
      await sendEmailNotification(
        emailAddresses,
        "📅 New Event Alert: A New Event Has Been Posted!",
        `A new event titled "${name}" has just been announced. Check out the details and discover what this event has to offer. It could be a great opportunity for fresh insights and valuable connections!`
      );

      res.status(201).json(events);
    } catch (error) {
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  });
};

// Get all events for a specific user
exports.getEvents = async (req, res) => {
  try {
    // Fetch all events without filtering by userId
    const events = await Events.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get a single event by ID
exports.getEventsById = async (req, res) => {
  try {
    const events = await Events.findById(req.params.id);

    if (!events) {
      return res.status(404).json({ msg: "Event not found" });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Update events
exports.updateEvents = async (req, res) => {
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
      const newImage = req.file
        ? `/uploads/contents/events/${req.file.filename}`
        : null;

      const events = await Events.findById(req.params.id);
      if (!events) {
        return res.status(404).json({ msg: "Event not found" });
      }

      // Ensure user is admin or owns the event
      if (userRole !== "admin" && events.userId.toString() !== userId) {
        return res.status(403).json({ msg: "Unauthorized" });
      }

      if (newImage && events.image) {
        const oldImagePath = path.join(__dirname, `../../../${events.image}`);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      events.name = name || events.name;
      events.address = address || events.address;
      events.image = newImage || events.image;
      events.description = description || events.description;
      events.contact = contact || events.contact;

      await events.save();
      // Fetch all user emails
      const users = await User.find();
      const emailAddresses = users.map((user) => user.email);

      // Send email notification
      await sendEmailNotification(
        emailAddresses,
        "🔔 Quick Heads Up: Event Details Have Been Updated!",
        `Heads up! The details for the event titled "${name}" have recently been updated. Check out the latest information and see what’s new—they might have something valuable to offer!`
      );

      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  });
};

// Delete events
exports.deleteEvents = async (req, res) => {
  console.log("Delete request received for event ID:", req.params.id);
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      console.log("Token is missing.");
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token
    const userRole = decoded.role; // Get user role from the decoded token

    const events = await Events.findById(req.params.id);
    if (!events) {
      console.log("Event not found:", req.params.id);
      return res.status(404).json({ message: "Event not found" });
    }

    // Ensure user is admin or owns the event
    if (userRole !== "admin" && events.userId.toString() !== userId) {
      console.log(
        "Unauthorized attempt to delete event:",
        userId,
        events.userId
      );
      return res.status(403).json({ message: "Unauthorized" });
    }

    // If the event has an image, delete the image file from the server
    if (events.image) {
      const imagePath = path.join(__dirname, `../../../${events.image}`);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the image file
        console.log("Old image deleted successfully:", imagePath); // Log successful deletion
      } else {
        console.log("Image not found at path:", imagePath); // Log if image doesn't exist
      }
    }

    await Events.deleteOne({ _id: req.params.id });
    console.log("Event deleted successfully:", req.params.id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res
      .status(500)
      .json({ message: "Error deleting event", error: error.message });
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
