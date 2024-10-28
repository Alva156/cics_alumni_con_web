const mongoose = require("mongoose");
const { Schema } = mongoose;

// Schema to store individual question details
const questionSchema = new Schema({
    questionText: {
        type: String,
        required: true,
    },
    questionType: {
        type: String,
        enum: ["radio", "checkbox", "textInput", "textArea"],
        required: true,
    },
    choices: {
        type: [String], // Choices are only relevant for radio and checkbox types
        required: function () {
            return this.questionType === "radio" || this.questionType === "checkbox";
        },
    },
});

// Schema to store user responses to each question
const answerSchema = new Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the specific question
        ref: "Question",
        required: true,
    },
    answer: {
        type: Schema.Types.Mixed, // Can hold a string or array of strings (for checkboxes)
        required: true,
    },
});

// Schema to store responses from each user for a survey
const responseSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the user model
        required: true,
    },
    answers: [answerSchema], // Array of answers to the survey questions
    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

// Schema to represent a survey
const surveySchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId, // Reference to the admin user who created the survey
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        responseCount: {
            type: Number,
            default: 0,
        },
        answered: {
            type: Boolean,
            default: false,
        },
        questions: [questionSchema], // Embedded array of questions
        responses: [responseSchema], // Embedded array of responses from users
    },
    { timestamps: true }
);

const Survey = mongoose.model("Survey", surveySchema);
module.exports = Survey;
