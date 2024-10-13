const UserProfile = require("../models/userProfileModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.getProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Token missing, please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from decoded token

    // Fetch the profile by userId and populate user details from UserModel
    const userProfile = await UserProfile.findOne({ userId }).populate(
      "userId",
      "firstName lastName birthday email mobileNumber" // Include email from UserModel
    );

    if (!userProfile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    // If accountEmail exists in userProfile, use it. Otherwise, use the email from userModel.
    const profileResponse = {
      ...userProfile.toObject(),
      accountEmail: userProfile.accountEmail || userProfile.userId.email, // Fallback to userModel email
    };

    res.status(200).json(profileResponse);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Server Error", message: error.message });
  }
};

exports.createProfile = async (req, res) => {
  try {
    // Extract the token from cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Token missing, please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from token

    // Check if a profile already exists for the user
    const existingProfile = await UserProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({
        error: "Profile already exists. Please update your profile instead.",
      });
    }

    // Extract profile details from request body
    const profileData = {
      userId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      birthday: req.body.birthday,
      careerBackground: req.body.careerBackground,
      collegeProgram: req.body.collegeProgram,
      contactInformation: req.body.contactInformation,
      employmentStatus: req.body.employmentStatus,
      maritalStatus: req.body.maritalStatus,
      placeOfEmployment: req.body.placeOfEmployment,
      profession: req.body.profession,
      professionAlignment: req.body.professionAlignment,
      profileImage: req.body.profileImage,
      salaryRange: req.body.salaryRange,
      accountEmail: req.body.accountEmail,
      secondaryEducation: req.body.secondaryEducation,
      specialization: req.body.specialization,
      tertiaryEducation: req.body.tertiaryEducation,
      timeToJob: req.body.timeToJob,
      workIndustry: req.body.workIndustry,
      yearGraduatedCollege: req.body.yearGraduatedCollege,
      yearStartedCollege: req.body.yearStartedCollege,
      attachments: req.body.attachments,
    };

    // Validate required fields (this can be customized based on your requirements)
    const requiredFields = ["firstName", "lastName", "birthday"];
    for (const field of requiredFields) {
      if (!profileData[field]) {
        return res.status(400).json({ error: `${field} is required.` });
      }
    }

    // Create a new UserProfile instance
    const newProfile = new UserProfile(profileData);

    // Save the profile
    await newProfile.save();
    console.log(
      `User profile for ${profileData.firstName} ${profileData.lastName} created successfully.`
    );

    res.status(201).json({
      message: "Profile created successfully!",
      profile: newProfile,
    });
  } catch (error) {
    console.error("Error creating profile:", error); // Log the error for debugging
    res
      .status(500)
      .json({ error: "Failed to create profile", details: error.message });
  }
};

exports.createUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, birthday } = req.body;

    const user = await User.findOne({ firstName, lastName, birthday });
    if (!user) {
      console.log("User not found");
    }
    const userId = user._id;

    // Check if a profile already exists for the user
    const existingProfile = await UserProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({
        error: "Profile already exists. Please update your profile instead.",
      });
    }

    // Extract profile details from request body
    const profileData = {
      userId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      birthday: req.body.birthday,
      contactInformation: {
        mobileNumber: req.body.mobileNumber,
      },
      accountEmail: req.body.accountEmail,
    };

    // Create a new UserProfile instance
    const newProfile = new UserProfile(profileData);

    // Save the profile
    await newProfile.save();
    res.status(201).json({
      msg: `Profile for ${profileData.firstName} ${profileData.lastName} created successfully.`,
    });
  } catch (error) {
    console.error("Error creating profile:", error); // Log the error for debugging
    res
      .status(500)
      .json({ error: "Failed to create profile", details: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Extract the token from cookies
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from token

    // Extract profile details from request body
    const {
      firstName,
      lastName,
      birthday,
      careerBackground,
      accountEmail,
      collegeProgram,
      contactInformation,
      employmentStatus,
      maritalStatus,
      placeOfEmployment,
      profession,
      professionAlignment,
      profileImage,
      salaryRange,
      secondaryEducation,
      specialization,
      tertiaryEducation,
      timeToJob,
      workIndustry,
      yearGraduatedCollege,
      yearStartedCollege,
      attachments,
    } = req.body;

    // Find the existing profile and update it
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId }, // Find profile by userId
      {
        firstName,
        lastName,
        birthday,
        careerBackground,
        accountEmail,
        collegeProgram,
        contactInformation,
        employmentStatus,
        maritalStatus,
        placeOfEmployment,
        profession,
        professionAlignment,
        profileImage,
        salaryRange,
        secondaryEducation,
        specialization,
        tertiaryEducation,
        timeToJob,
        workIndustry,
        yearGraduatedCollege,
        yearStartedCollege,
        attachments,
      },
      { new: true, upsert: false } // Return the updated document, don't create if it doesn't exist
    );

    if (!updatedProfile) {
      return res
        .status(404)
        .json({ error: "Profile not found. Please create a profile first." });
    }
    // If accountEmail is provided, update the email in User model
    if (accountEmail) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { email: accountEmail }, // Update the user's email with the new accountEmail
        { new: true, upsert: false } // Don't create a new user if not found
      );
      if (!updatedUser) {
        return res
          .status(404)
          .json({ error: "User not found while updating email." });
      }
    }

    res.status(200).json({
      message: "Profile updated successfully!",
      profile: updatedProfile,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update profile", details: error.message });
  }
};

// Get all alumni profiles

exports.getAllAlumni = async (req, res) => {
  try {
    const alumniProfiles = await UserProfile.find().populate({
      path: "userId",
      match: { role: "user" },
    });

    const filteredAlumni = alumniProfiles.filter((profile) => profile.userId);

    // Send the retrieved and filtered alumni profiles in the response
    res.status(200).json({ alumni: filteredAlumni });
  } catch (error) {
    console.error("Error fetching alumni profiles:", error);
    res.status(500).json({
      error: "Failed to fetch alumni profiles",
      message: error.message,
    });
  }
};
exports.changePassword = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized, please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get the userId from the token

    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: "New password is required." });
    }

    // Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check password complexity (Optional: adjust this as needed)
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res
        .status(400)
        .json({ error: "Password must meet the complexity requirements." });
    }

    // Hash the new password and update it
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};
