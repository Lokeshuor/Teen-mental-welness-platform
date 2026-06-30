const express = require('express');
const { 
    getQuestions, 
    submitAssessment, 
    getStudentAssessments, 
    getLatestAssessment,
    getStatistics 
} = require('../controllers/assessmentController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.get('/questions', authenticate, getQuestions);
router.post('/submit', authenticate, submitAssessment);
router.get('/student/:studentId?', authenticate, getStudentAssessments);
router.get('/latest/:studentId?', authenticate, getLatestAssessment);
router.get('/statistics', authenticate, roleCheck('admin', 'therapist'), getStatistics);

module.exports = router;