const Documents = require("../../models/Contents/documentsModel");
const User = require("../../models/userModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Set storage engine for file uploads
const storage = multer.diskStorage({
  destination: "./uploads/contents/documents", // Save images in the 'uploads' directory
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize upload for single file
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/; // Allowing images and PDFs
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (!mimetype || !extname) {
      return cb(new Error("Only images (jpeg, jpg, png) and PDFs are allowed")); // Custom error message
    }

    cb(null, true);
  },
}).single("image"); // Expecting a field named 'image' for file uploads

// Create new document
exports.createDocuments = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ msg: "Image/PDF must be a maximum of 5MB" });
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
        ? `/uploads/contents/documents/${req.file.filename}`
        : null;

      const documents = new Documents({
        userId,
        name,
        address,
        image,
        description,
        contact,
      });
      await documents.save();
      // Fetch all user emails
      const users = await User.find();
      const emailAddresses = users.map((user) => user.email);

      // Send email notification
      await sendEmailNotification(
        emailAddresses,
        "📝 New Steps Alert: How to Attain the Document!",
        `There are new steps for attaining the document titled "${name}". Review these steps to access this important resource more easily!`
      );

      res.status(201).json(documents);
    } catch (error) {
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  });
};

// Get all documents for a specific user
exports.getDocuments = async (req, res) => {
  try {
    // Fetch all documents without filtering by userId
    const documents = await Documents.find();
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get a single document by ID
exports.getDocumentsById = async (req, res) => {
  try {
    const documents = await Documents.findById(req.params.id);

    if (!documents) {
      return res.status(404).json({ msg: "Documents not found" });
    }

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Update document
exports.updateDocuments = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ msg: "Image/PDF must be a maximum of 5MB" });
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
        ? `/uploads/contents/documents/${req.file.filename}`
        : null;

      const documents = await Documents.findById(req.params.id);
      if (!documents) {
        return res.status(404).json({ msg: "Documents not found" });
      }

      // Ensure user is admin or owns the documents
      if (userRole !== "admin" && documents.userId.toString() !== userId) {
        return res.status(403).json({ msg: "Unauthorized" });
      }

      if (newImage && documents.image) {
        const oldImagePath = path.join(
          __dirname,
          `../../../${documents.image}`
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      documents.name = name || documents.name;
      documents.address = address || documents.address;
      documents.image = newImage || documents.image;
      documents.description = description || documents.description;
      documents.contact = contact || documents.contact;

      await documents.save();
      // Fetch all user emails
      const users = await User.find();
      const emailAddresses = users.map((user) => user.email);

      // Send email notification
      await sendEmailNotification(
        emailAddresses,
        "🔔 Quick Heads Up: Updates on Document Retrieval Steps!",
        `Heads up! There are updates on the steps for retrieving the document titled "${name}". Review these changes to ensure a smooth process—they might provide valuable guidance!`
      );

      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ msg: "Server Error", error: error.message });
    }
  });
};

// Delete document
exports.deleteDocuments = async (req, res) => {
  console.log("Delete request received for documents ID:", req.params.id);
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      console.log("Token is missing.");
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token
    const userRole = decoded.role; // Get user role from the decoded token

    const documents = await Documents.findById(req.params.id);
    if (!documents) {
      console.log("Documents not found:", req.params.id);
      return res.status(404).json({ message: "Documents not found" });
    }

    // Ensure user is admin or owns the documents
    if (userRole !== "admin" && documents.userId.toString() !== userId) {
      console.log(
        "Unauthorized attempt to delete documents:",
        userId,
        documents.userId
      );
      return res.status(403).json({ message: "Unauthorized" });
    }

    // If the documents has an image, delete the image file from the server
    if (documents.image) {
      const imagePath = path.join(__dirname, `../../../${documents.image}`);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the image file
        console.log("Old image deleted successfully:", imagePath); // Log successful deletion
      } else {
        console.log("Image not found at path:", imagePath); // Log if image doesn't exist
      }
    }

    await Documents.deleteOne({ _id: req.params.id });
    console.log("Documents deleted successfully:", req.params.id);
    res.status(200).json({ message: "Documents deleted successfully" });
  } catch (error) {
    console.error("Error deleting documents:", error);
    res
      .status(500)
      .json({ message: "Error deleting documents", error: error.message });
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
      from: '"CICS Alumni Connect" <' + process.env.EMAIL_USER + ">",
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
exports.downloadDocument = async (req, res) => {
  try {
    const { filename } = req.params;

    // Define the full path to the file directly
    const filePath = path.join(
      __dirname,
      "../../../uploads/contents/documents",
      filename
    );

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ msg: "File not found on the server" });
    }

    // Trigger the file download
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error during file download:", err);
        res.status(500).json({ error: "Error downloading the file" });
      }
    });
  } catch (error) {
    console.error("Error downloading document:", error);
    res.status(500).json({ error: "Server Error", message: error.message });
  }
};
