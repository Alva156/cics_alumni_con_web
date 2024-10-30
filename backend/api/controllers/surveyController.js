const Survey = require("../models/surveyModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// ADMIN-SIDE

// Display all surveys
exports.getAllSurveys = async (req, res) => {
    try {
        const token = req.cookies.token;
        let userProfileId = null;

        // Decode the token if it exists
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userProfileId = decoded.profileId;
        }

        // Find all surveys and populate userId and questions
        const surveys = await Survey.find()
            .populate("userId", "firstName lastName profileImage profession") // Populating userId
            .populate("questions") // Populating questions
            .lean();

        // Enhance each survey with response count and ownership status
        const surveysWithResponseCount = surveys.map(survey => {
            // Count responses related to this survey
            const responseCount = survey.responses.length; // Since responses is an array
            return {
                ...survey,
                responseCount,
                isOwner: userProfileId && survey.userId._id.toString() === userProfileId.toString(), // Check ownership
            };
        });

        // Return enhanced surveys
        res.status(200).json(surveysWithResponseCount);
    } catch (error) {
        console.error("Error fetching surveys:", error); // Log the error for debugging
        res.status(500).json({ message: "Error fetching surveys", error: error.message });
    }
};

// Get a single survey by ID
exports.getSurveyById = async (req, res) => {
    try {
        // Fetch the survey and populate userId and questions
        const survey = await Survey.findById(req.params.id)
            .populate("userId", "firstName lastName profileImage profession") // Populating userId
            .populate("questions") // Populating questions
            .lean();

        if (!survey) {
            return res.status(404).json({ message: "Survey not found" });
        }

        res.status(200).json(survey);
    } catch (error) {
        console.error("Error fetching survey:", error); // Added logging for better debugging
        res.status(500).json({ message: "Error fetching survey", error });
    }
};

// Create a new survey
exports.createSurvey = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: "Token missing" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userProfileId = decoded.profileId;

        const { title, questions } = req.body;

        // Ensure title and questions are provided
        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: "Title and at least one question are required." });
        }

        // Create the survey instance
        const newSurvey = new Survey({
            userId: userProfileId,  // Assign userProfileId to userId field
            name: title,             // Use title as the name of the survey
            questions: questions,
        });

        // Save the survey
        await newSurvey.save();

        const populatedSurvey = await Survey.findById(newSurvey._id).populate(
            "userId",  // Update to use userId here
            "firstName lastName profileImage profession"
        );

        res.status(201).json({
            message: "Survey created successfully!",
            survey: populatedSurvey,
        });
    } catch (error) {
        console.error("Error creating survey:", error.message);
        res.status(500).json({ error: "Failed to create survey" });
    }
};

// Update a survey
exports.updateSurvey = async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) return res.status(401).json({ error: "Token missing" });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userProfileId = decoded.profileId;
  
      const survey = await Survey.findById(req.params.id);
      if (!survey) return res.status(404).json({ message: "Survey not found" });
  
      if (survey.userId.toString() !== userProfileId) {
        return res.status(403).json({ message: "Unauthorized to update this survey" });
      }
  
      // Update the survey's properties
      survey.name = req.body.title; // Update the title
      survey.questions = req.body.questions; // Update questions directly
  
      // Validate questions to ensure they have required fields
      const invalidQuestions = survey.questions.filter(
        (question) => !question.questionText || !question.questionType
      );
      
      if (invalidQuestions.length) {
        return res.status(400).json({ error: "All questions must have a text and a type." });
      }
  
      const updatedSurvey = await survey.save();
  
      const populatedSurvey = await Survey.findById(updatedSurvey._id)
        .populate("userId", "firstName lastName profileImage profession")
        .lean();
  
      const responseCount = updatedSurvey.responses.length;
      res.status(200).json({
        message: "Survey updated successfully!",
        survey: { ...populatedSurvey, responseCount },
      });
    } catch (error) {
      console.error("Error updating survey:", error);
      res.status(500).json({ message: "Error updating survey", error });
    }
  };
  
// Delete a survey
exports.deleteSurvey = async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized, token missing." });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userProfileId = decoded.profileId;
  
      const survey = await Survey.findById(req.params.id);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found." });
      }
  
      // Check if the `userId` exists before trying to access it
      if (!survey.userId) {
        return res.status(500).json({ message: "Survey is missing user profile information." });
      }
  
      // Ensure the user is authorized to delete the survey
      if (survey.userId.toString() !== userProfileId) {
        return res.status(403).json({ message: "Unauthorized to delete this survey." });
      }
  
      await Survey.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: "Survey deleted successfully." });
    } catch (error) {
      console.error("Error deleting survey:", error);
      res.status(500).json({ message: "Error deleting survey", error });
    }
  };
  
// Toggle publish and unpublish
exports.publishSurvey = async (req, res) => {
    const surveyId = req.params.id;
    const survey = await Survey.findById(surveyId);

    if (!survey) {
        return res.status(404).json({ msg: "Survey not found" });
    }

    // Toggle the published status
    survey.published = !survey.published;
    
    try {
        await survey.save();
        res.status(200).json(survey); // Return the updated survey
    } catch (error) {
        console.error("Error updating survey:", error);
        res.status(500).json({ msg: "Server Error", error: error.message });
    }
};


// USER-SIDE

// Display all published surveys
exports.getPublished = async (req, res) => {
  try {
    const token = req.cookies.token;
    let userProfileId = null;

    // Decode the token if it exists
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userProfileId = decoded.profileId;
    }

    // Find all surveys and populate userId and questions
    const surveys = await Survey.find({published:true})
        .populate("userId", "firstName lastName profileImage profession") // Populating userId
        .populate("questions") // Populating questions
        .lean();

    // Enhance each survey with response count and ownership status
    const surveysWithResponseCount = surveys.map(survey => {
        // Count responses related to this survey
        const responseCount = survey.responses.length; // Since responses is an array
        return {
            ...survey,
            responseCount,
            isOwner: userProfileId && survey.userId._id.toString() === userProfileId.toString(), // Check ownership
        };
    });

    // Return enhanced surveys
    res.status(200).json(surveysWithResponseCount);
} catch (error) {
    console.error("Error fetching surveys:", error); // Log the error for debugging
    res.status(500).json({ message: "Error fetching surveys", error: error.message });
}
};

// Get a single published survey by ID
exports.getPublishedById = async (req, res) => {
  try {
      // Find the survey by ID, ensuring it's published, and populate userId and questions
      const survey = await Survey.findOne({ _id: req.params.id, published: true })
          .populate("userId", "firstName lastName profileImage profession")
          .populate("questions")
          .lean();

      if (!survey) {
          return res.status(404).json({ message: "Survey not found or not published" });
      }

      res.status(200).json(survey);
  } catch (error) {
      console.error("Error fetching published survey by ID:", error);
      res.status(500).json({ message: "Error fetching survey", error: error.message });
  }
};


// Get a single survey by ID

// Toggle Answered and Unanswered

// Submit survey response (user-side)

const authenticateUser = async (req, res, next) => {
  const token = req.cookies.token; // Assuming you're storing the JWT in a cookie

  if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret
      req.userId = decoded.id; // Store the user ID in the request object
      next();
  } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
  }
};


exports.saveSurveyResponse = async (req, res) => {
  const { surveyId, answers } = req.body; // Expect surveyId and answers from the request body
  const userId = req.userId; // Get userId from request object

  try {
      // Find the survey by ID
      const survey = await Survey.findById(surveyId);
      if (!survey) {
          return res.status(404).json({ message: "Survey not found" });
      }

      // Create or update response for the user
      const existingResponse = survey.responses.find(response => response.userId.toString() === userId);

      if (existingResponse) {
          // Update the existing response
          existingResponse.answers = answers; // Update answers
      } else {
          // Create a new response
          survey.responses.push({
              userId: userId, // Ensure this is set correctly
              answers,
          });
      }

      // Mark the survey as answered
      survey.answered = true; // Set to boolean
      // Increment the response count
      survey.responseCount += 1;

      // Save the updated survey
      await survey.save();

      res.status(200).json({ message: "Response saved successfully", survey });
  } catch (error) {
      console.error("Error saving survey response:", error);
      res.status(500).json({ message: "Error saving response", error: error.message });
  }
};


