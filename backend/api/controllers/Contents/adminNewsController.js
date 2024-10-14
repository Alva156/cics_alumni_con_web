const News = require("../../models/Contents/newsModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
