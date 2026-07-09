import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { ASSESSMENT_QUESTIONS } from '../../utils/constants';
import './Assessment.css';

const Assessment = () => {
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [responses, setResponses] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasCompleted, setHasCompleted] = useState(false);

    useEffect(() => {
        // Check if student already completed assessment
        checkPreviousAssessment();
    }, []);

    const checkPreviousAssessment = async () => {
        try {
            const response = await api.get('/assessments/latest');
            if (response.data) {
                setHasCompleted(true);
            }
        } catch (error) {
            // No previous assessment found
        }
    };

    const handleResponse = (value) => {
        const newResponses = [...responses];
        newResponses[currentQuestion] = value;
        setResponses(newResponses);
    };

    const handleNext = () => {
        if (responses[currentQuestion] === undefined || responses[currentQuestion] === null) {
            toast.error('Please select an answer before continuing');
            return;
        }
        if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        // Check all questions answered
        if (responses.length < ASSESSMENT_QUESTIONS.length || responses.includes(undefined)) {
            toast.error('Please answer all questions before submitting');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post('/assessments/submit', { responses });
            toast.success('Assessment submitted successfully!');
            navigate('/student/assessment/results', { 
                state: { 
                    assessment: response.data.assessment,
                    riskLevel: response.data.riskLevel,
                    score: response.data.score,
                    recommendation: response.data.recommendation
                } 
            });
        } catch (error) {
            console.error('Submit assessment error:', error);
            toast.error('Failed to submit assessment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (hasCompleted) {
        return (
            <div className="assessment-completed">
                <div className="container">
                    <div className="card assessment-card">
                        <div className="completed-icon">✅</div>
                        <h2>Assessment Already Completed</h2>
                        <p>You have already completed a mental health assessment. You can view your results in the dashboard.</p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/student/dashboard')}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const question = ASSESSMENT_QUESTIONS[currentQuestion];
    const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;

    return (
        <div className="assessment-page">
            <div className="container">
                <div className="assessment-header">
                    <h1>Mental Health Assessment</h1>
                    <p>Please answer all questions honestly. Your responses are confidential.</p>
                </div>

                <div className="card assessment-card">
                    <div className="assessment-progress">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="progress-text">
                            {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
                        </span>
                    </div>

                    <div className="question-container">
                        <h3 className="question-text">{question.text}</h3>
                        <div className="options-container">
                            {question.options.map((option, index) => (
                                <label key={index} className="option-label">
                                    <input
                        type="radio"
                        name="question"
                        value={index}
                        checked={responses[currentQuestion] === index}
                        onChange={() => handleResponse(index)}
                    />
                                    <span className="option-text">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="assessment-actions">
                        <button
                            className="btn btn-outline"
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                        >
                            Previous
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleNext}
                            disabled={isSubmitting}
                        >
                            {currentQuestion === ASSESSMENT_QUESTIONS.length - 1 
                                ? (isSubmitting ? 'Submitting...' : 'Submit') 
                                : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Assessment;