const Assessment = require('../models/Assessment');
const User = require('../models/User');
const { RISK_BANDS } = require('../config/auth');

// Assessment questions configuration
const QUESTIONS = [
    { id: 1, text: 'Over the past two weeks, how often have you felt down, depressed, or hopeless?', options: [0, 1, 2, 3] },
    { id: 2, text: 'Over the past two weeks, how often have you had little interest or pleasure in doing things?', options: [0, 1, 2, 3] },
    { id: 3, text: 'How often do you feel nervous, anxious, or on edge?', options: [0, 1, 2, 3] },
    { id: 4, text: 'How often do you have trouble sleeping or sleeping too much?', options: [0, 1, 2, 3] },
    { id: 5, text: 'How often do you feel tired or have little energy?', options: [0, 1, 2, 3] },
    { id: 6, text: 'How often do you have poor appetite or overeating?', options: [0, 1, 2, 3] },
    { id: 7, text: 'How often do you have trouble concentrating on things?', options: [0, 1, 2, 3] },
    { id: 8, text: 'How often do you feel you have failed or let yourself or your family down?', options: [0, 1, 2, 3] },
    { id: 9, text: 'How often do you think about hurting yourself or that you would be better off dead?', options: [0, 1, 2, 3] },
    { id: 10, text: 'How often do you feel lonely or isolated from others?', options: [0, 1, 2, 3] },
];

const calculateRiskLevel = (score) => {
    if (score >= 20) return RISK_BANDS.HIGH;
    if (score >= 12) return RISK_BANDS.MODERATE;
    return RISK_BANDS.LOW;
};

const getRecommendation = (riskLevel, score) => {
    switch (riskLevel) {
        case RISK_BANDS.HIGH:
            return 'Based on your responses, we strongly recommend that you speak with a mental health professional immediately. Please book a session with one of our therapists as soon as possible. If you are in crisis, please contact emergency services.';
        case RISK_BANDS.MODERATE:
            return 'Your responses indicate some signs of distress. We recommend scheduling a session with a therapist to discuss your feelings and develop coping strategies.';
        case RISK_BANDS.LOW:
            return 'Your responses show low levels of distress. Continue practicing self-care and reach out if you need support. You can access self-help resources and guided exercises in your dashboard.';
        default:
            return 'Thank you for completing the assessment. If you have concerns, please reach out to a therapist.';
    }
};

exports.getQuestions = async (req, res) => {
    try {
        res.json(QUESTIONS);
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.submitAssessment = async (req, res) => {
    try {
        const { responses } = req.body;
        const studentId = req.user.id;

        if (!responses || !Array.isArray(responses) || responses.length !== QUESTIONS.length) {
            return res.status(400).json({ message: 'Invalid responses format' });
        }

        // Calculate total score
        let totalScore = 0;
        responses.forEach((response, index) => {
            if (response >= 0 && response <= 3) {
                totalScore += response;
            }
        });

        const riskLevel = calculateRiskLevel(totalScore);
        const recommendation = getRecommendation(riskLevel, totalScore);

        // Create assessment
        const assessmentId = await Assessment.create({
            student_id: studentId,
            assessment_type: 'mental_health',
            responses: responses,
            total_score: totalScore,
            risk_level: riskLevel,
            recommendation: recommendation
        });

        // Get assessment
        const assessment = await Assessment.getById(assessmentId);

        res.status(201).json({
            message: 'Assessment submitted successfully',
            assessment: assessment,
            riskLevel,
            recommendation,
            score: totalScore
        });
    } catch (error) {
        console.error('Submit assessment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStudentAssessments = async (req, res) => {
    try {
        const studentId = req.params.studentId || req.user.id;
        
        // Check authorization
        if (req.user.role !== 'admin' && req.user.role !== 'therapist' && req.user.id !== parseInt(studentId)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const assessments = await Assessment.getByStudentId(studentId);
        res.json(assessments);
    } catch (error) {
        console.error('Get student assessments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLatestAssessment = async (req, res) => {
    try {
        const studentId = req.params.studentId || req.user.id;
        
        // Check authorization
        if (req.user.role !== 'admin' && req.user.role !== 'therapist' && req.user.id !== parseInt(studentId)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const assessment = await Assessment.getLatestByStudentId(studentId);
        // No assessment yet is an expected state for new students, not an error
        res.json(assessment || null);
    } catch (error) {
        console.error('Get latest assessment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStatistics = async (req, res) => {
    try {
        // Check authorization
        if (req.user.role !== 'admin' && req.user.role !== 'therapist') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const stats = await Assessment.getRiskStatistics();
        const recent = await Assessment.getRecentAssessments(10);
        
        res.json({
            riskDistribution: stats,
            recentAssessments: recent
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};