const UserProfile = require("../models/userProfileModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.getProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Token missing, please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Get userId from decoded token

    // Fetch the profile by userId and populate user details
    const userProfile = await UserProfile.findOne({ userId }).populate(
      "userId",
      "firstName lastName birthday email mobileNumber"
    );

    if (!userProfile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    // Ensure all fields are returned
    res.status(200).json(userProfile);
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
        emailAddress: req.body.email,
        mobileNumber: req.body.mobileNumber,
      },
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
