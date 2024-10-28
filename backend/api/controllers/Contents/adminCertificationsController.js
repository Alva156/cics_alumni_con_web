const Certifications = require("../../models/Contents/certificationsModel");
const User = require("../../models/userModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Set storage engine for images
const storage = multer.diskStorage({
  destination: "./uploads/contents/certifications", // Save images in the 'uploads' directory
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

// Create new certifications
exports.createCertifications = async (req, res) => {
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
        ? `/uploads/contents/certifications/${req.file.filename}`
        : null;

      const certifications = new Certifications({
        userId,
        name,
        address,
        image,
        description,
        contact,
      });
      await certifications.save();
      // Fetch all user emails
      const users = await User.find();
      const emailAddresses = users.map((user) => user.email);

      // Send email notification
      await sendEmailNotification(
        emailAddresses,
        "🎓 New Certification ALert: New Certification Opportunity for CICS Alumni!",
        `A new certification titled "${name}" has just been introduced that CICS alumni can take advantage of. This could be a valuable addition to your resume and a great opportunity to enhance your job prospects!`
      );

      res.status(201).json(certifications);
    } catch (error) {
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  });
};

// Get all certifications for a specific user
exports.getCertifications = async (req, res) => {
  try {
    const certifications = await Certifications.find();
    res.status(200).json(certifications);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get a single certification by ID
exports.getCertificationsById = async (req, res) => {
  try {
    const certifications = await Certifications.findById(req.params.id);

    if (!certifications) {
      return res.status(404).json({ msg: "Certifications not found" });
    }

    res.status(200).json(certifications);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Update certifications
exports.updateCertifications = async (req, res) => {
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
      const certifications = await Certifications.findById(req.params.id);

      if (!certifications) {
        return res.status(404).json({ msg: "Certifications not found" });
      }

      if (userRole !== "admin" && certifications.userId.toString() !== userId) {
        return res.status(403).json({ msg: "Unauthorized" });
      }

      const newImage = req.file
        ? `/uploads/contents/certifications/${req.file.filename}`
        : null;

      // Delete old image if a new one is uploaded
      if (newImage && certifications.image) {
        const oldImagePath = path.join(
          __dirname,
          `../../../${certifications.image}`
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      certifications.name = name || certifications.name;
      certifications.address = address || certifications.address;
      certifications.image = newImage || certifications.image;
      certifications.description = description || certifications.description;
      certifications.contact = contact || certifications.contact;

      await certifications.save();

      // Fetch all user emails
      const users = await User.find();
      const emailAddresses = users.map((user) => user.email);

      // Send email notification
      await sendEmailNotification(
        emailAddresses,
        "🔔 Quick Heads Up: Certification Details Have Been Updated!",
        `Heads up! The certification titled "${name}" has recently updated its details. Check out the latest information and see what’s new—it might offer valuable benefits for your career!`
      );

      res.status(200).json(certifications);
    } catch (error) {
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  });
};

// Delete certifications
exports.deleteCertifications = async (req, res) => {
  console.log("Delete request received for certifications ID:", req.params.id);
  try {
    const token = req.cookies.token;
    if (!token) {
      console.log("Token is missing.");
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const userRole = decoded.role;

    const certifications = await Certifications.findById(req.params.id);
    if (!certifications) {
      console.log("Certifications not found:", req.params.id);
      return res.status(404).json({ message: "Certifications not found" });
    }

    if (userRole !== "admin" && certifications.userId.toString() !== userId) {
      console.log(
        "Unauthorized attempt to delete certifications:",
        userId,
        certifications.userId
      );
      return res.status(403).json({ message: "Unauthorized" });
    }

    // If the certifications have an image, delete the image file from the server
    if (certifications.image) {
      const imagePath = path.join(
        __dirname,
        `../../../${certifications.image}`
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Old image deleted successfully:", imagePath);
      } else {
        console.log("Image not found at path:", imagePath);
      }
    }

    await Certifications.deleteOne({ _id: req.params.id });
    console.log("Certifications deleted successfully:", req.params.id);
    res.status(200).json({ message: "Certifications deleted successfully" });
  } catch (error) {
    console.error("Error deleting certifications:", error);
    res
      .status(500)
      .json({ message: "Error deleting certifications", error: error.message });
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
