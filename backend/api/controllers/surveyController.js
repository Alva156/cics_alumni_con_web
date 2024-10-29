const Survey = require("../models/surveyModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");


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

        // Fetch the survey to update
        const survey = await Survey.findById(req.params.id);
        if (!survey) {
            return res.status(404).json({ message: "Survey not found" });
        }

        // Check if the user is the owner of the survey
        if (survey.userId.toString() !== userProfileId) {
            return res.status(403).json({ message: "Unauthorized to update this survey" });
        }

        // Update the survey fields
        survey.name = req.body.title; // Update the title
        survey.questions = req.body.questions; // Update the questions array

        // Save the updated survey
        const updatedSurvey = await survey.save();

        // Populate the updated survey for response
        const populatedSurvey = await Survey.findById(updatedSurvey._id)
            .populate("userId", "firstName lastName profileImage profession")
            .lean();

        // Count responses for the updated survey
        const responseCount = updatedSurvey.responses.length;

        res.status(200).json({
            message: "Survey updated successfully!",
            survey: {
                ...populatedSurvey,
                responseCount, // Include response count in the response
            },
        });
    } catch (error) {
        console.error("Error updating survey:", error.message);
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




// Submit survey response (user-side)

exports.submitSurveyResponse = async (req, res) => {
    const { id } = req.params;
    const { responses } = req.body; // Expecting array of user responses
    try {
        const survey = await Survey.findById(id);
        if (!survey) {
            return res.status(404).json({ message: "Survey not found" });
        }

        // Logic to process user responses
        // Update the response count (this is a simplified example)
        survey.response = `${parseInt(survey.response) + 1} responses`;

        await survey.save();
        res.status(200).json({ message: "Response submitted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error submitting response", error });
    }
};

