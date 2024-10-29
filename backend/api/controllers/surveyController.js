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

        // Find all surveys and populate userId
        const surveys = await Survey.find()
            .populate("userId", "firstName lastName profileImage profession")
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
        // Fetch the survey and populate userId
        const survey = await Survey.findById(req.params.id)
            .populate("userId", "firstName lastName profileImage profession") // Updated to use userId
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userProfileId = decoded.profileId;

        const { title, questions } = req.body;
        const survey = await Survey.findById(req.params.id);

        if (!survey) {
            return res.status(404).json({ message: "Survey not found" });
        }

        if (survey.userProfileId.toString() !== userProfileId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Update the survey title and questions
        survey.title = title;
        survey.questions = questions;

        const updatedSurvey = await survey.save();

        const populatedSurvey = await Survey.findById(updatedSurvey._id)
            .populate("userProfileId", "firstName lastName profileImage profession")
            .lean();

        // Fetch the response count for this survey
        const responseCount = await Response.countDocuments({ surveyId: survey._id });

        res.status(200).json({
            message: "Survey updated successfully",
            survey: { ...populatedSurvey, responseCount },
        });
    } catch (error) {
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
            return res.status(404).json({ message: "Survey not found" });
        }

        if (survey.userProfileId.toString() !== userProfileId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await Survey.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: "Survey deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting survey", error });
    }
};

exports.publishSurvey = async (req, res) => {
    const { published } = req.body; // Expecting { published: true/false }
    const { id } = req.params; // Get the ID from the request parameters

    console.log("Received request to publish survey:", { id, published }); // Log the incoming request

    // Ensure id is defined
    if (!id) {
        return res.status(400).json({ message: "Survey ID is required" });
    }

    try {
        // Verify JWT token
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized, token missing." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const userRole = decoded.role;

        // Find the survey by ID
        const survey = await Survey.findById(id);
        if (!survey) {
            return res.status(404).json({ message: "Survey not found" });
        }

        // Optionally, check user authorization if needed
        // if (userRole !== "admin" && survey.userId.toString() !== userId) {
        //     return res.status(403).json({ message: "Unauthorized" });
        // }

        // Update the published status
        survey.published = published !== undefined ? published : !survey.published; // Use provided status or toggle if not provided
        await survey.save(); // Save the updated survey

        // Send email notification if necessary
        // Example: await sendEmailNotification([recipient], subject, message);

        return res.status(200).json({ message: 'Survey updated successfully', survey });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error publishing/unpublishing survey", error });
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

