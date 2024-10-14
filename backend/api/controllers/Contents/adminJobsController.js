const Jobs = require("../../models/Contents/jobsModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
