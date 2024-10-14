const Certifications = require("../../models/Contents/certificationsModel");
const jwt = require("jsonwebtoken"); // Add this line

// Create new certifications
exports.createCertifications = async (req, res) => {
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token

    const { name, address, image, description, contact } = req.body;

    const certifications = new Certifications({
      userId,
      name,
      address,
      image,
      description,
      contact,
    });
    await certifications.save();

    res.status(201).json(certifications);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get all certifications for a specific user
exports.getCertifications = async (req, res) => {
  try {
    // Fetch all certifications without filtering by userId
    const certifications = await Certifications.find();
    res.status(200).json(certifications);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get a single certifications by ID
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
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token

    const { name, address, image, description, contact } = req.body;
    const certifications = await Certifications.findById(req.params.id);

    if (!certifications) {
      return res.status(404).json({ msg: "Certifications not found" });
    }

    // Ensure user owns the certifications
    if (certifications.userId.toString() !== userId) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    certifications.name = name || certifications.name;
    certifications.address = address || certifications.address;
    certifications.image = image || certifications.image;
    certifications.description = description || certifications.description;
    certifications.contact = contact || certifications.contact;

    await certifications.save();
    res.status(200).json(certifications);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Delete certifications
exports.deleteCertifications = async (req, res) => {
  console.log("Delete request received for certifications ID:", req.params.id);
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      console.log("Token is missing.");
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token

    const certifications = await Certifications.findById(req.params.id);
    if (!certifications) {
      console.log("Certifications not found:", req.params.id);
      return res.status(404).json({ message: "Certifications not found" });
    }

    if (certifications.userId.toString() !== userId) {
      console.log(
        "Unauthorized attempt to delete certifications:",
        userId,
        certifications.userId
      );
      return res.status(403).json({ message: "Unauthorized" });
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
