const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController");
const authenticateJWT = require("../../middleware/auth");


router.get('/view', surveyController.getAllSurveys);
router.get('/viewpublish', surveyController.getPublished);
router.post('/respond', surveyController.saveSurveyResponse);

// Route to get a single survey by ID
router.get('/:id', surveyController.getSurveyById);
router.get('/viewpublish/:id', surveyController.getPublishedById);

router.post('/create', surveyController.createSurvey);
router.put('/publish/:id', surveyController.publishSurvey);
router.put('/update/:id', surveyController.updateSurvey);
router.delete('/delete/:id', surveyController.deleteSurvey);



module.exports = router;