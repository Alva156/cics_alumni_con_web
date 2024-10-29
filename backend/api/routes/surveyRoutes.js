const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController");
const authenticateJWT = require("../../middleware/auth");


router.get('/view', surveyController.getAllSurveys);

// Route to get a single survey by ID
router.get('/:id', surveyController.getSurveyById);

router.post('/create', surveyController.createSurvey);
router.put('/publish/:id', surveyController.publishSurvey);
router.put('/update/:id', surveyController.updateSurvey);
router.delete('/delete/:id', surveyController.deleteSurvey);

module.exports = router;