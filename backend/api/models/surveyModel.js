const mongoose = require("mongoose");
const { Schema } = mongoose;

// Schema to store individual question details
const questionSchema = new Schema({
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ["radio", "checkbox", "textInput", "textArea"],
    required: true,
  },
  choices: {
    type: [String],
    default: [], // Provide a default empty array
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
    type: String, // Change to String if you are using String for user IDs
    ref: "UserProfile",
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model
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
      type: [String], // Change to array of Strings for user profile IDs
      default: [], // Default to an empty array
    },
    published: {
      // New field to track if the survey is published
      type: Boolean,
      default: false,
    },
    questions: [questionSchema],
    responses: [responseSchema],
  },
  { timestamps: true }
);

const Survey = mongoose.model("Survey", surveySchema);

module.exports = Survey;
