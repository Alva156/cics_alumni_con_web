const Company = require("../models/companyModel");
const jwt = require("jsonwebtoken"); // Add this line

// Create new company
exports.createCompany = async (req, res) => {
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token

    const { name, address, image, description, contact } = req.body;

    const company = new Company({
      userId,
      name,
      address,
      image,
      description,
      contact,
    });
    await company.save();

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get all companies for a specific user
exports.getCompanies = async (req, res) => {
  try {
    const userId = req.user.id; // You can fetch this from the JWT if you're using it in the middleware
    const companies = await Company.find({ userId });

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
  try {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from the decoded token

    const { name, address, image, description, contact } = req.body;
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }

    // Ensure user owns the company
    if (company.userId.toString() !== userId) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    company.name = name || company.name;
    company.address = address || company.address;
    company.image = image || company.image;
    company.description = description || company.description;
    company.contact = contact || company.contact;

    await company.save();
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
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

    const company = await Company.findById(req.params.id);
    if (!company) {
      console.log("Company not found:", req.params.id);
      return res.status(404).json({ message: "Company not found" });
    }

    if (company.userId.toString() !== userId) {
      console.log(
        "Unauthorized attempt to delete company:",
        userId,
        company.userId
      );
      return res.status(403).json({ message: "Unauthorized" });
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
