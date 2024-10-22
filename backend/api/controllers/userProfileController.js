const UserProfile = require("../models/userProfileModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set storage engine for profile images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "profileImage") {
      cb(null, "./uploads/profileimg"); // Save profile images in 'uploads/profileimg'
    } else if (file.fieldname === "attachments") {
      cb(null, "./uploads/attachments"); // Save attachments in 'uploads/attachments'
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    let filetypes;
    
    // Determine allowed file types based on field name
    if (file.fieldname === "profileImage") {
      filetypes = /jpeg|jpg|png/; // Only allow image formats for profile image
    } else if (file.fieldname === "attachments") {
      filetypes = /jpeg|jpg|png|pdf|doc|docx/; // Allow image and document formats for attachments
    } else {
      return cb(new Error("Invalid field name."));
    }

    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (!mimetype || !extname) {
      return cb(new Error("Invalid file format."));
    }

    cb(null, true);
  },
}).fields([
  { name: "profileImage", maxCount: 1 }, // Single profile image
  { name: "attachments", maxCount: 10 }, // Up to 10 attachments
]);



// Function to delete previous image
const deletePreviousImage = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting image:", err);
    }
  });
};

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
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ msg: "Image size exceeds the limit of 5MB." });
      }
      return res.status(400).json({ msg: err.message });
    }
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

      // Handle profileImage
      const profileImage = req.files && req.files.profileImage
        ? `/uploads/profileimg/${req.files.profileImage[0].filename}`
        : null; // Set profile image path

      // Handle attachments array
      const attachments = req.files && req.files.attachments
  ? req.files.attachments.map(file => ({
      filename: file.originalname, // Store original filename
      filepath: `/uploads/attachments/${file.filename}`, // Store file path
    }))
  : [];

      // Extract profile details from request body
      const profileData = {
        userId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        birthday: req.body.birthday,
        careerBackground: req.body.careerBackground,
        college: req.body.college,
        collegeProgram: req.body.collegeProgram,
        contactInformation: req.body.contactInformation,
        employmentStatus: req.body.employmentStatus,
        maritalStatus: req.body.maritalStatus,
        placeOfEmployment: req.body.placeOfEmployment,
        profession: req.body.profession,
        professionAlignment: req.body.professionAlignment,
        profileImage, // Use new profile image handling logic
        salaryRange: req.body.salaryRange,
        accountEmail: req.body.accountEmail,
        secondaryEducation: req.body.secondaryEducation,
        specialization: req.body.specialization,
        tertiaryEducation: req.body.tertiaryEducation,
        timeToJob: req.body.timeToJob,
        workIndustry: req.body.workIndustry,
        yearGraduatedCollege: req.body.yearGraduatedCollege,
        yearStartedCollege: req.body.yearStartedCollege,
        attachments, // Use new attachments handling logic
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
  });
};



//after regis, this is executed
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

// Update an existing profile
exports.updateProfile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ msg: "Image size exceeds the limit of 5MB." });
      }
      return res.status(400).json({ msg: err.message });
    }

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
        college,
        collegeProgram,
        contactInformation,
        employmentStatus,
        maritalStatus,
        placeOfEmployment,
        profession,
        professionAlignment,
        salaryRange,
        secondaryEducation,
        specialization,
        tertiaryEducation,
        timeToJob,
        workIndustry,
        yearGraduatedCollege,
        yearStartedCollege,
        attachmentIds = [],
      } = req.body;

      // Find the existing profile
      const userProfile = await UserProfile.findOne({ userId });
      if (!userProfile) {
        return res
          .status(404)
          .json({ error: "Profile not found. Please create a profile first." });
      }

      // If a new image is uploaded, delete the old one
      if (req.files && req.files.profileImage && userProfile.profileImage) {
        const previousImagePath = path.join(
          __dirname,
          "../../",
          userProfile.profileImage
        );
        deletePreviousImage(previousImagePath);
      }

      // Handle profileImage
      const profileImage = req.files && req.files.profileImage
        ? `/uploads/profileimg/${req.files.profileImage[0].filename}`
        : userProfile.profileImage; // Keep old image if none uploaded

      // Handle attachments array
      const existingAttachments = userProfile.attachments || [];

      // Process new attachments (from uploaded files)
      const newAttachments = req.files && req.files.attachments
        ? req.files.attachments.map((file, index) => {
            const attachmentId = attachmentIds[index] || null;
            return {
              _id: attachmentId, // Existing ID from frontend
              filename: file.originalname,
              filepath: `/uploads/attachments/${file.filename}`,
            };
          })
        : [];

      console.log("New attachments processed:", newAttachments);

      // Updated attachments by replacing existing ones if IDs match
      const updatedAttachments = existingAttachments.map(existingAttachment => {
        const matchingNewAttachment = newAttachments.find(newAtt => newAtt._id === existingAttachment._id);

        if (matchingNewAttachment) {
          // Log the matching case
          console.log(`Replacing existing attachment with ID: ${existingAttachment._id}`);
          console.log("Existing attachment:", existingAttachment);
          console.log("New attachment:", matchingNewAttachment);

          // Delete old file before replacing it
          const oldAttachmentPath = path.join(__dirname, `../../${existingAttachment.filepath}`);
          if (fs.existsSync(oldAttachmentPath)) {
            fs.unlinkSync(oldAttachmentPath); // Remove old file from disk
            console.log(`Deleted old file: ${existingAttachment.filename}`);
          } else {
            console.log(`Old file not found for deletion: ${existingAttachment.filename}`);
          }

          // Replace with new attachment (while keeping the ID)
          return {
            _id: existingAttachment._id, // Keep the old ID
            filename: matchingNewAttachment.filename, // Replace filename
            filepath: matchingNewAttachment.filepath, // Replace filepath
          };
        }

        // Log when an attachment is kept unchanged
        console.log(`Keeping existing attachment with ID: ${existingAttachment._id}`);
        return existingAttachment;
      });

      // Add new attachments that don't have a match in existingAttachments
      const finalAttachments = [
        ...updatedAttachments, // Replaced or unchanged existing attachments
        ...newAttachments.filter(newAtt => !existingAttachments.some(existing => existing._id === newAtt._id)),
      ];

      console.log("Final attachments after update:", finalAttachments);

      // Update profile data
      const updatedProfileData = {
        firstName,
        lastName,
        birthday,
        careerBackground,
        accountEmail,
        college,
        collegeProgram,
        contactInformation,
        employmentStatus,
        maritalStatus,
        placeOfEmployment,
        profession,
        professionAlignment,
        profileImage, // Use new profile image handling logic
        salaryRange,
        secondaryEducation,
        specialization,
        tertiaryEducation,
        timeToJob,
        workIndustry,
        yearGraduatedCollege,
        yearStartedCollege,
        attachments: finalAttachments, // Use new attachments handling logic
      };

      // Update the profile in the database
      const updatedProfile = await UserProfile.findOneAndUpdate(
        { userId },
        updatedProfileData,
        { new: true }
      );

      // If accountEmail is provided, update the email in the User model
      if (accountEmail) {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { email: accountEmail },
          { new: true, upsert: false }
        );
        if (!updatedUser) {
          return res
            .status(404)
            .json({ error: "User not found while updating email." });
        }
      }

      // Respond with success
      res.status(200).json({
        message: "Profile updated successfully!",
        profile: updatedProfile,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res
        .status(500)
        .json({ error: "Failed to update profile", details: error.message });
    }
  });
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

exports.deleteSection = async (req, res) => {
  console.log("DeleteSection function triggered");
  console.log("Received parameters:", req.params);

  const sectionType = req.params.sectionType; // Get the type of section (e.g., company, secondary, tertiary)
  const sectionId = req.params.sectionId;
  const profileId = req.params.profileId;

  // Token extraction and user identification
  const token = req.cookies.token;
  if (!token) {
    console.log("Token is missing.");
    return res.status(401).json({ message: "Unauthorized, token missing." });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Unauthorized, invalid token." });
  }

  const userId = decoded.id; // Get userId from the decoded token

  try {
    // Check if the user profile exists
    const userProfile = await UserProfile.findOne({ _id: profileId, userId });
    if (!userProfile) {
      console.log(
        `User profile not found for profile ID: ${profileId} and user ID: ${userId}`
      );
      return res.status(404).json({ message: "User profile not found." });
    }

    // Define the mapping for the section type to its corresponding field in the UserProfile model
    const sectionFieldMap = {
      "company-section": "careerBackground",
      "secondary-section": "secondaryEducation",
      "tertiary-section": "tertiaryEducation",
    };

    // Validate sectionType
    const sectionField = sectionFieldMap[sectionType];
    if (!sectionField) {
      console.log(`Invalid section type: ${sectionType}`);
      return res.status(400).json({ message: "Invalid section type." });
    }

    // Use Mongoose's $pull operator to remove the section by its _id
    const result = await UserProfile.updateOne(
      { _id: profileId, userId }, // Match the profile by profileId and userId
      {
        $pull: { [sectionField]: { _id: sectionId } }, // Remove the section with the matching sectionId
      }
    );

    // Check if a document was modified (meaning the section was removed)
    if (result.modifiedCount === 0) {
      console.log(
        `No section found with ID: ${sectionId} in ${sectionField} for user ID: ${userId}`
      );
      return res.status(404).json({
        message: `${sectionType.replace("-", " ")} section not found.`,
      });
    }

    console.log(
      `${sectionType.replace(
        "-",
        " "
      )} section with ID: ${sectionId} deleted successfully for user ID: ${userId}`
    );
    return res.status(200).json({
      message: `${sectionType.replace("-", " ")} section deleted successfully.`,
    });
  } catch (error) {
    console.error(
      `Error deleting ${sectionType.replace("-", " ")} section:`,
      error
    );
    return res.status(500).json({
      message: `Error deleting ${sectionType.replace("-", " ")} section`,
      error: error.message,
    });
  }
};

//ALUMNI LIST PAGE
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
// DASHBOARD
exports.getDashboardStats = async (req, res) => {
  try {
    const alumniProfiles = await UserProfile.find().populate({
      path: "userId",
      match: { role: "user" },
    });

    // Filter valid alumni profiles
    const filteredAlumni = alumniProfiles.filter((profile) => profile.userId);

    // Calculate number of users
    const numberOfUsers = filteredAlumni.length;

    // Number of employed users
    const employedUsers = filteredAlumni.filter(
      (profile) => profile.employmentStatus === "Employed"
    ).length;

    // Users per academic program
    const academicPrograms = [
      "Information Technology",
      "Computer Science",
      "Information Systems",
    ];
    const usersPerProgram = academicPrograms.map(
      (program) =>
        filteredAlumni.filter((profile) => profile.collegeProgram === program)
          .length
    );

    // Users per specialization
    const specializations = ["Web Development", "Networking", "Automation"];

    const usersPerSpecialization = specializations.map(
      (specialization) =>
        filteredAlumni.filter(
          (profile) => profile.specialization === specialization
        ).length
    );

    // Users per year started and graduated (updated to extract only the year)
    const usersPerStartYear = {};
    const usersPerGradYear = {};

    filteredAlumni.forEach((profile) => {
      // Extract only the year portion of the dates
      const startYear = profile.yearStartedCollege
        ? new Date(profile.yearStartedCollege).getFullYear()
        : null;
      const gradYear = profile.yearGraduatedCollege
        ? new Date(profile.yearGraduatedCollege).getFullYear()
        : null;

      // Ensure we are only counting valid years
      if (startYear) {
        usersPerStartYear[startYear] = (usersPerStartYear[startYear] || 0) + 1;
      }
      if (gradYear) {
        usersPerGradYear[gradYear] = (usersPerGradYear[gradYear] || 0) + 1;
      }
    });

    // Employment status
    const employmentStatus = [
      "Employed",
      "Unemployed",
      "Underemployed",
      "Freelance",
    ];
    const usersPerEmploymentStatus = employmentStatus.map(
      (status) =>
        filteredAlumni.filter((profile) => profile.employmentStatus === status)
          .length
    );

    // Work industries
    const workIndustries = ["Local", "International"];
    const usersPerWorkIndustry = workIndustries.map(
      (industry) =>
        filteredAlumni.filter((profile) => profile.workIndustry === industry)
          .length
    );

    // Time to get a job (updated to use keys as time to job and values as counts)
    const usersPerTimeToJob = {};
    filteredAlumni.forEach((profile) => {
      const timeToJob = profile.timeToJob; // Ensure the key is correctly spelled
      if (timeToJob) {
        usersPerTimeToJob[timeToJob] = (usersPerTimeToJob[timeToJob] || 0) + 1;
      }
    });

    res.status(200).json({
      numberOfUsers,
      employedUsers,
      usersPerProgram,
      usersPerSpecialization,
      usersPerStartYear,
      usersPerGradYear,
      usersPerEmploymentStatus,
      usersPerWorkIndustry,
      usersPerTimeToJob,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      error: "Failed to fetch dashboard statistics",
      message: error.message,
    });
  }
};
