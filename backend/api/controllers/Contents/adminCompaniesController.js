const Company = require("../../models/Contents/companyModel");
const User = require("../../models/userModel");
const jwt = require("jsonwebtoken"); // Add this line
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config();
// Set storage engine
const storage = multer.diskStorage({
  destination: "./uploads/contents/companies", // Save images in the 'uploads' directory
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

// Create new company
exports.createCompany = async (req, res) => {
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
        ? `/uploads/contents/companies/${req.file.filename}`
        : null;

      const company = new Company({
        userId,
        name,
        address,
        image,
        description,
        contact,
      });

      await company.save();

      // Fetch all user emails
      const users = await User.find();
      const emailAddresses = users.map((user) => user.email);

      // Send email notification
      await sendEmailNotification(
        emailAddresses,
        "🌟 New Company Alert: A New IT Company You Should Know About!",
        `A new company, "${name}", has just been added. Stay updated with the latest in the IT world and explore what this new company has to offer. It could be a great opportunity for new insights or connections!`
      );

      res.status(201).json(company);
    } catch (error) {
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  });
};

// Get all companies for a specific user
exports.getCompanies = async (req, res) => {
  try {
    // Fetch all companies without filtering by userId
    const companies = await Company.find();
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get a single company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }

    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Update company
exports.updateCompany = async (req, res) => {
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
      const newImage = req.file
        ? `/uploads/contents/companies/${req.file.filename}`
        : null;

      const company = await Company.findById(req.params.id);
      if (!company) {
        return res.status(404).json({ msg: "Company not found" });
      }

      if (userRole !== "admin" && company.userId.toString() !== userId) {
        return res.status(403).json({ msg: "Unauthorized" });
      }

      if (newImage && company.image) {
        const oldImagePath = path.join(__dirname, `../../../${company.image}`);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      company.name = name || company.name;
      company.address = address || company.address;
      company.image = newImage || company.image;
      company.description = description || company.description;
      company.contact = contact || company.contact;

      await company.save();

      // Fetch all user emails
      const users = await User.find();
      const emailAddresses = users.map((user) => user.email);
      // Send email notification
      await sendEmailNotification(
        emailAddresses,
        "🔔 Quick Heads Up: A Company Update Just Came In!",
        `Heads up! The company "${name}" has recently updated its details. Stay informed on their latest developments and explore what's new—they might have something valuable to offer!`
      );

      res.status(200).json(company);
    } catch (error) {
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  });
};

// Delete company
exports.deleteCompany = async (req, res) => {
  console.log("Delete request received for company ID:", req.params.id);
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      console.log("Token is missing.");
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token
    const userRole = decoded.role; // Get user role from the decoded token

    const company = await Company.findById(req.params.id);
    if (!company) {
      console.log("Company not found:", req.params.id);
      return res.status(404).json({ message: "Company not found" });
    }

    // Ensure user is admin or owns the company
    if (userRole !== "admin" && company.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // If the company has an image, delete the image file from the server
    if (company.image) {
      const imagePath = path.join(__dirname, `../../../${company.image}`);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the image file
        console.log("Old image deleted successfully:", imagePath); // Log successful deletion
      } else {
        console.log("Image not found at path:", imagePath); // Log if image doesn't exist
      }
    }

    await Company.deleteOne({ _id: req.params.id });
    console.log("Company deleted successfully:", req.params.id);
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    res
      .status(500)
      .json({ message: "Error deleting company", error: error.message });
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
