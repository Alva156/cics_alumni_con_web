const Survey = require("../models/surveyModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const Survey = require("../models/Survey"); // Import the Survey model

// Get all surveys
exports.getAllSurveys = async (req, res) => {
    try {
        const surveys = await Survey.find();
        res.status(200).json(surveys);
    } catch (error) {
        res.status(500).json({ message: "Error fetching surveys", error });
    }
};

// Get a single survey by ID
exports.getSurveyById = async (req, res) => {
    const { id } = req.params;
    try {
        const survey = await Survey.findById(id);
        if (!survey) {
            return res.status(404).json({ message: "Survey not found" });
        }
        res.status(200).json(survey);
    } catch (error) {
        res.status(500).json({ message: "Error fetching survey", error });
    }
};

// Create a new survey
exports.createSurvey = async (req, res) => {
    const { name, questions } = req.body; // Expects survey name and array of questions
    try {
        const newSurvey = new Survey({
            name,
            questions,
            response: "0 responses",
            answered: false,
        });
        await newSurvey.save();
        res.status(201).json(newSurvey);
    } catch (error) {
        res.status(500).json({ message: "Error creating survey", error });
    }
};

// Update a survey
exports.updateSurvey = async (req, res) => {
    const { id } = req.params;
    const { name, questions } = req.body;
    try {
        const updatedSurvey = await Survey.findByIdAndUpdate(
            id,
            { name, questions },
            { new: true }
        );
        if (!updatedSurvey) {
            return res.status(404).json({ message: "Survey not found" });
        }
        res.status(200).json(updatedSurvey);
    } catch (error) {
        res.status(500).json({ message: "Error updating survey", error });
    }
};

// Delete a survey
exports.deleteSurvey = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedSurvey = await Survey.findByIdAndDelete(id);
        if (!deletedSurvey) {
            return res.status(404).json({ message: "Survey not found" });
        }
        res.status(200).json({ message: "Survey deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting survey", error });
    }
};

// Publish or unpublish a survey (toggle answered state)
exports.togglePublishSurvey = async (req, res) => {
    const { id } = req.params;
    try {
        const survey = await Survey.findById(id);
        if (!survey) {
            return res.status(404).json({ message: "Survey not found" });
        }
        survey.answered = !survey.answered;
        await survey.save();
        res.status(200).json(survey);
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error publishing/unpublishing survey", error });
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

