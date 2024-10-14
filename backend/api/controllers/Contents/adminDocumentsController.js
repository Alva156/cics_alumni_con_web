const Documents = require("../../models/Contents/documentsModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
