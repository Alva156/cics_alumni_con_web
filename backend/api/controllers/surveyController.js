const Survey = require("../models/surveyModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// ADMIN-SIDE

// Display all surveys with responder details
exports.getAllSurveys = async (req, res) => {
  try {
    const token = req.cookies.token;
    let userProfileId = null;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userProfileId = decoded.profileId;
    }

    // Fetch all surveys and populate responder profile fields
    const surveys = await Survey.find()
      .populate(
        "responses.userId",
        "firstName lastName birthday college collegeProgram yearGraduatedCollege gender region employmentStatus"
      ) // Populate responder details
      .populate("questions") // Populate questions
      .lean();

    const surveysWithResponseCount = surveys.map((survey) => {
      const responseCount = survey.responses.length;
      return {
        ...survey,
        responseCount,
        isOwner:
          userProfileId &&
          survey.userId._id.toString() === userProfileId.toString(),
      };
    });

    res.status(200).json(surveysWithResponseCount);
  } catch (error) {
    console.error("Error fetching surveys:", error);
    res
      .status(500)
      .json({ message: "Error fetching surveys", error: error.message });
  }
};

// Get a single survey by ID with responder details
exports.getSurveyById = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)
      .populate(
        "responses.userId",
        "firstName lastName birthday college collegeProgram yearGraduatedCollege gender region employmentStatus"
      ) // Populate responder details
      .populate("questions") // Populate questions
      .lean();

    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    res.status(200).json(survey);
  } catch (error) {
    console.error("Error fetching survey:", error);
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
    if (
      !title ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Title and at least one question are required." });
    }

    // Create the survey instance
    const newSurvey = new Survey({
      userId: userProfileId, // Assign userProfileId to userId field
      name: title, // Use title as the name of the survey
      questions: questions,
    });

    // Save the survey
    await newSurvey.save();

    const populatedSurvey = await Survey.findById(newSurvey._id).populate(
      "userId", // Update to use userId here
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
    const userRole = decoded.role; // Assuming the role is stored in the token

    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: "Survey not found" });

    // Allow access if the user is the owner or an admin
    if (survey.userId.toString() !== userProfileId && userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this survey" });
    }

    // Update the survey's properties
    survey.name = req.body.title; // Update the title
    survey.questions = req.body.questions; // Update questions directly

    // Validate questions to ensure they have required fields
    const invalidQuestions = survey.questions.filter(
      (question) => !question.questionText || !question.questionType
    );

    if (invalidQuestions.length) {
      return res
        .status(400)
        .json({ error: "All questions must have a text and a type." });
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
    const userRole = decoded.role; // Assuming role is stored in the token

    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: "Survey not found." });
    }

    // Allow deletion if the user is the owner or an admin
    if (survey.userId.toString() !== userProfileId && userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this survey." });
    }

    await Survey.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Survey deleted successfully." });
  } catch (error) {
    console.error("Error deleting survey:", error);
    res.status(500).json({ message: "Error deleting survey", error });
  }
};

// Toggle publish and unpublish with response reset logic
exports.publishSurvey = async (req, res) => {
  const surveyId = req.params.id;

  try {
    const survey = await Survey.findById(surveyId);

    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    // Toggle the published status
    const wasPublished = survey.published;
    survey.published = !survey.published;

    // Reset responses and answered fields if publishing again after unpublishing
    if (!wasPublished && survey.published) {
      survey.responses = [];
      survey.answered = [];
      survey.responseCount = 0;
      console.log("Survey responses and answers reset upon republishing.");

      // Fetch all users with the role 'user'
      const users = await User.find({ role: "user" });

      if (users.length > 0) {
        // Send email notification to all users with role 'user'
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        // Email content
        const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f8; border-radius: 8px;">
            <div style="background-color: #ff4b4b; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            </div>
            <div style="background-color: #fff; padding: 40px; border-radius: 0 0 8px 8px;">
              <h2 style="color: #ff4b4b; text-align: center;">New Survey Published</h2>
              <p style="text-align: center; font-size: 16px; color: #333;">
                Hello,
              </p>
              <p style="text-align: center; font-size: 16px; color: #333;">
                A new survey titled "<strong>${survey.name}</strong>" has just been published by the CICS Alumni Connect.
              </p>
              <p style="text-align: center; font-size: 16px; color: #333;">
                We would really appreciate your time and input in answering the questions provided in this survey. Your responses will help improve our services and provide better support for our alumni community.
              </p>
              <p style="text-align: center; font-size: 16px; color: #333;">
                If you have some time to spare, we would be grateful for your participation.
              </p>
              <p style="text-align: center; font-size: 16px; color: #333;">
                Thank you for your continued support!
              </p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 12px; color: #999;">
              © 2024 CICS Alumni Connect. All rights reserved.
            </p>
          </div>
        </div>
      `;

        // Send email to all users
        for (let user of users) {
          const mailOptions = {
            from: '"CICS Alumni Connect" <' + process.env.EMAIL_USER + ">",
            to: user.email, // Assuming user schema has 'email' field
            subject: `New Survey Alert "${survey.name}" `,
            html: htmlContent,
          };

          await transporter.sendMail(mailOptions);
          console.log(`Email sent to ${user.email} for survey publication.`);
        }
      } else {
        console.log("No users with role 'user' found.");
      }
    }

    await survey.save();
    res.status(200).json(survey); // Return the updated survey
  } catch (error) {
    console.error("Error updating survey:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
      console.log("Decoded token, userProfileId:", userProfileId); // Log the decoded profileId
    }

    // Find all published surveys
    const surveys = await Survey.find({ published: true })
      .populate("userId", "firstName lastName profileImage profession") // Populating userId
      .populate("questions") // Populating questions
      .lean();

    console.log("Fetched surveys:", surveys.length); // Log the number of surveys found

    // Separate surveys into answered and unanswered sections
    const answeredSurveys = [];
    const unansweredSurveys = [];

    surveys.forEach((survey) => {
      const responseCount = survey.responses.length;
      console.log("Survey ID:", survey._id, "Response Count:", responseCount); // Log survey details

      // Log the answered array and current user's profile ID for debugging
      console.log("Survey answered array:", survey.answered);
      console.log("Current user profile ID:", userProfileId);

      // Ensure userProfileId is a string and check if the user has answered the survey
      const isAnswered = survey.answered.some(
        (id) => id.toString() === userProfileId?.toString()
      );

      console.log("Is answered:", isAnswered); // Log if the survey is answered by the user

      const surveyWithInfo = {
        ...survey,
        responseCount,
        answered: isAnswered, // Add this field to the response
      };

      // Push the survey into the appropriate array
      if (isAnswered) {
        answeredSurveys.push(surveyWithInfo);
        console.log("Survey added to answeredSurveys:", survey._id); // Log if added to answeredSurveys
      } else {
        unansweredSurveys.push(surveyWithInfo);
        console.log("Survey added to unansweredSurveys:", survey._id); // Log if added to unansweredSurveys
      }
    });

    // Log the final counts for both answered and unanswered surveys
    console.log("Total answered surveys:", answeredSurveys.length);
    console.log("Total unanswered surveys:", unansweredSurveys.length);

    // Return separated surveys in two sections
    res.status(200).json({
      answeredSurveys,
      unansweredSurveys,
    });
  } catch (error) {
    console.error("Error fetching surveys:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Error fetching surveys", error: error.message });
  }
};

// Get a single published survey by ID
exports.getPublishedById = async (req, res) => {
  try {
    const survey = await Survey.findOne({ _id: req.params.id, published: true })
      .populate("userId", "firstName lastName profileImage profession")
      .populate("questions")
      .lean();

    if (!survey) {
      return res
        .status(404)
        .json({ message: "Survey not found or not published" });
    }

    // Fetch the user profile ID from the token if available
    const token = req.cookies.token;
    let userProfileId = null;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userProfileId = decoded.profileId;
    }

    // Find the previous response for this user if it exists
    const previousResponse = survey.responses.find(
      (response) => response.userId === userProfileId
    );

    res.status(200).json({
      ...survey,
      previousAnswers: previousResponse ? previousResponse.answers : [],
    });
  } catch (error) {
    console.error("Error fetching survey:", error);
    res.status(500).json({ message: "Error fetching survey", error });
  }
};

// Submit survey response (user-side)
exports.saveSurveyResponse = async (req, res) => {
  try {
    const token = req.cookies.token; // Adjust this if you're using headers instead
    console.log("Incoming request to save survey response:", req.body);
    console.log("Token received:", token); // Log the token for debugging

    if (!token) return res.status(401).json({ error: "Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userProfileId = decoded.profileId;
    console.log("Extracted userProfileId from token:", userProfileId);

    // Ensure that userProfileId is valid
    if (!userProfileId) {
      console.warn("UserProfileId is missing from decoded token");
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { surveyId, answers } = req.body;
    console.log("Survey ID:", surveyId, "Answers:", answers);

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      console.warn("Survey not found with ID:", surveyId);
      return res.status(404).json({ message: "Survey not found" });
    }

    // Ensure responses and answered arrays are initialized
    survey.responses = survey.responses || [];
    survey.answered = survey.answered || [];

    // Check for existing response
    const existingResponse = survey.responses.find(
      (response) => response.userId === userProfileId
    );
    console.log(
      "Existing Response for userId:",
      userProfileId,
      "found:",
      existingResponse
    );

    if (existingResponse) {
      // Update existing response
      console.log("Updating existing response for userId:", userProfileId);
      existingResponse.answers = answers;
    } else {
      // Create new response
      console.log("Creating new response for userId:", userProfileId);
      survey.responses.push({ userId: userProfileId, answers });

      // Update answered array and response count if it's a new response
      if (!survey.answered.includes(userProfileId)) {
        survey.answered.push(userProfileId);
        survey.responseCount += 1;
        console.log(
          "Incremented response count. New count:",
          survey.responseCount
        );
      }
    }

    await survey.save();
    console.log("Survey response saved successfully:", survey);

    // Fetch all published surveys and categorize them as answered or unanswered
    const surveys = await Survey.find({ published: true })
      .populate("userId", "firstName lastName profileImage profession") // Populating userId
      .populate("questions") // Populating questions
      .lean();

    const answeredSurveys = [];
    const unansweredSurveys = [];

    surveys.forEach((s) => {
      const isAnswered = s.answered.includes(userProfileId);
      const surveyWithInfo = {
        ...s,
        answered: isAnswered,
      };

      if (isAnswered) {
        answeredSurveys.push(surveyWithInfo);
      } else {
        unansweredSurveys.push(surveyWithInfo);
      }
    });

    // Log the final counts for both answered and unanswered surveys
    console.log("Total answered surveys:", answeredSurveys.length);
    console.log("Total unanswered surveys:", unansweredSurveys.length);

    // Return separated surveys in two sections
    res.status(200).json({
      message: "Response saved successfully",
      survey,
      answeredSurveys,
      unansweredSurveys,
    });
  } catch (error) {
    console.error("Error saving survey response:", error.message);
    res
      .status(500)
      .json({ message: "Error saving response", error: error.message });
  }
};
