const User = require("../models/userModel");
const UserProfile = require("../models/userProfileModel");
const jwt = require("jsonwebtoken");

// Get admin profile
exports.getAdminProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Token missing, please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find the admin user by userId
    const userProfile = await UserProfile.findOne({ userId }).populate(
      "userId",
      "firstName lastName email" // Include email from UserModel
    );

    // Check if userProfile exists
    if (!userProfile) {
      return res.status(404).json({ msg: "Admin profile not found" });
    }

    // Check if the user has an admin role
    const admin = await User.findById(userId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ msg: "Access denied, not an admin" });
    }

    res.status(200).json(userProfile); // Return the user profile
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ error: "Server Error", message: error.message });
  }
};

// Update admin profile
exports.updateAdminProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Token missing, please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const {
      firstName,
      lastName,
      email,
    } = req.body;

    // Check if user is admin
    const admin = await User.findById(userId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ error: "Access denied, not an admin" });
    }

    // Update the admin's profile
    const updatedAdmin = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
      },
      { new: true, upsert: false } // Return the updated document
    );

    if (!updatedAdmin) {
      return res.status(404).json({ error: "Admin profile not found" });
    }

    res.status(200).json({
      message: "Admin profile updated successfully!",
      profile: updatedAdmin,
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({ error: "Failed to update profile", details: error.message });
  }
};
