const News = require("../../models/Contents/newsModel");
const jwt = require("jsonwebtoken"); // Add this line

// Create new news
exports.createNews = async (req, res) => {
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token

    const { name, address, image, description, contact } = req.body;

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
};

// Get all news for a specific user
exports.getNews = async (req, res) => {
  try {
    // Fetch all news without filtering by userId
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
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token
    const userRole = decoded.role; // Get user role from the decoded token

    const { name, address, image, description, contact } = req.body;
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ msg: "News not found" });
    }

    // Ensure user is admin or owns the news
    if (userRole !== "admin" && news.userId.toString() !== userId) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    news.name = name || news.name;
    news.address = address || news.address;
    news.image = image || news.image;
    news.description = description || news.description;
    news.contact = contact || news.contact;

    await news.save();
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Delete news
exports.deleteNews = async (req, res) => {
  console.log("Delete request received for news ID:", req.params.id);
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      console.log("Token is missing.");
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token
    const userRole = decoded.role; // Get user role from the decoded token

    const news = await News.findById(req.params.id);
    if (!news) {
      console.log("News not found:", req.params.id);
      return res.status(404).json({ message: "News not found" });
    }

    // Ensure user is admin or owns the news
    if (userRole !== "admin" && news.userId.toString() !== userId) {
      console.log("Unauthorized attempt to delete news:", userId, news.userId);
      return res.status(403).json({ message: "Unauthorized" });
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
