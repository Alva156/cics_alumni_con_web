const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController");
const authenticateJWT = require("../../middleware/auth");


router.get("/view", authenticateJWT, surveyController.getAllSurveys);


module.exports = router;