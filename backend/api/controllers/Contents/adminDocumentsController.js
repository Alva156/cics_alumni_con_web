const Documents = require("../../models/Contents/documentsModel");
const jwt = require("jsonwebtoken"); // Add this line

// Create new documents
exports.createDocuments = async (req, res) => {
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token

    const { name, address, image, description, contact } = req.body;

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

// Get a single documents by ID
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

// Update documents
exports.updateDocuments = async (req, res) => {
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token

    const { name, address, image, description, contact } = req.body;
    const documents = await Documents.findById(req.params.id);

    if (!documents) {
      return res.status(404).json({ msg: "Documents not found" });
    }

    // Ensure user owns the documents
    if (documents.userId.toString() !== userId) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    documents.name = name || documents.name;
    documents.address = address || documents.address;
    documents.image = image || documents.image;
    documents.description = description || documents.description;
    documents.contact = contact || documents.contact;

    await documents.save();
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Delete documents
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

    const documents = await Documents.findById(req.params.id);
    if (!documents) {
      console.log("Documents not found:", req.params.id);
      return res.status(404).json({ message: "Documents not found" });
    }

    if (documents.userId.toString() !== userId) {
      console.log(
        "Unauthorized attempt to delete documents:",
        userId,
        documents.userId
      );
      return res.status(403).json({ message: "Unauthorized" });
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
