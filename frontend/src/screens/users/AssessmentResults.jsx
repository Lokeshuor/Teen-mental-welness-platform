import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChartLine, FaFileDownload, FaArrowLeft } from 'react-icons/fa';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import api from '../../utils/api';
import './AssessmentResults.css';

const AssessmentResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState(location.state?.assessment || null);
    const [riskLevel, setRiskLevel] = useState(location.state?.riskLevel || null);
    const [score, setScore] = useState(location.state?.score || null);
    const [recommendation, setRecommendation] = useState(location.state?.recommendation || null);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/assessments/student');
            setHistory(response.data || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Fetch history error:', error);
            setIsLoading(false);
        }
    };

    const getRiskBadge = (level) => {
        const badges = {
            low: 'badge-low',
            moderate: 'badge-moderate',
            high: 'badge-high'
        };
        return `badge ${badges[level] || 'badge-low'}`;
    };

    const getRiskDescription = (level) => {
        const descriptions = {
            low: 'Your responses indicate low levels of distress. Continue practicing self-care and maintain healthy habits.',
            moderate: 'Your responses indicate some signs of distress. It may be helpful to speak with a professional.',
            high: 'Your responses indicate significant distress. We strongly recommend speaking with a mental health professional.'
        };
        return descriptions[level] || '';
    };

    const getRecommendationColor = (level) => {
        const colors = {
            low: 'var(--risk-low)',
            moderate: 'var(--risk-moderate)',
            high: 'var(--risk-high)'
        };
        return colors[level] || 'var(--neutral-500)';
    };

    if (isLoading) {
        return (
            <div className="results-loading">
                <div className="spinner"></div>
                <p>Loading your results...</p>
            </div>
        );
    }

    if (!assessment && !location.state) {
        return (
            <div className="results-empty">
                <div className="container">
                    <div className="card">
                        <h2>No Assessment Results</h2>
                        <p>You haven't completed an assessment yet.</p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/student/assessment')}
                        >
                            Take Assessment
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const latestScore = assessment?.total_score || score;
    const latestRisk = assessment?.risk_level || riskLevel;
    const latestRecommendation = assessment?.recommendation || recommendation;

    // Prepare chart data
    const chartData = history.map((item, index) => ({
        name: `Assessment ${index + 1}`,
        score: item.total_score,
        date: new Date(item.completed_at).toLocaleDateString()
    }));

    // Risk distribution data
    const riskCounts = history.reduce((acc, item) => {
        acc[item.risk_level] = (acc[item.risk_level] || 0) + 1;
        return acc;
    }, { low: 0, moderate: 0, high: 0 });

    const riskData = Object.entries(riskCounts).map(([level, count]) => ({
        level: level.charAt(0).toUpperCase() + level.slice(1),
        count
    }));

    return (
        <div className="results-page">
            <div className="container">
                <button 
                    className="btn btn-outline btn-sm back-btn"
                    onClick={() => navigate('/student/dashboard')}
                >
                    <FaArrowLeft /> Back to Dashboard
                </button>

                <div className="results-header">
                    <h1>Assessment Results</h1>
                    <p>Here's a summary of your mental health assessment</p>
                </div>

                {/* Current Results */}
                <div className="results-grid">
                    <div className="result-card card">
                        <h3>Risk Level</h3>
                        <div className="result-value">
                            <span className={getRiskBadge(latestRisk)}>
                                {latestRisk.toUpperCase()} RISK
                            </span>
                        </div>
                        <p className="result-description">
                            {getRiskDescription(latestRisk)}
                        </p>
                    </div>

                    <div className="result-card card">
                        <h3>Score</h3>
                        <div className="result-value score-value">
                            <span className="score-number">{latestScore}</span>
                            <span className="score-max">/ 30</span>
                        </div>
                        <p className="result-description">
                            Higher scores indicate higher levels of distress
                        </p>
                    </div>

                    <div className="result-card card result-card-full">
                        <h3>Recommendation</h3>
                        <div 
                            className="recommendation-box"
                            style={{ borderColor: getRecommendationColor(latestRisk) }}
                        >
                            <p>{latestRecommendation}</p>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                {history.length > 1 && (
                    <div className="charts-section">
                        <h2>Your Progress Over Time</h2>
                        <div className="charts-grid">
                            <div className="chart-card card">
                                <h4>Score Trend</h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 30]} />
                                        <Tooltip />
                                        <Line 
                                            type="monotone" 
                                            dataKey="score" 
                                            stroke="var(--primary-500)" 
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="chart-card card">
                                <h4>Risk Distribution</h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={riskData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="level" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="var(--primary-400)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* History */}
                {history.length > 0 && (
                    <div className="history-section">
                        <h2>Assessment History</h2>
                        <div className="history-list">
                            {history.slice(0, 10).map((item, index) => (
                                <div key={item.id} className="history-item card">
                                    <div className="history-info">
                                        <span className="history-index">#{history.length - index}</span>
                                        <span className="history-date">
                                            {new Date(item.completed_at).toLocaleDateString()}
                                        </span>
                                        <span className={getRiskBadge(item.risk_level)}>
                                            {item.risk_level}
                                        </span>
                                    </div>
                                    <div className="history-score">
                                        Score: {item.total_score}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="results-actions">
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/student/assessment')}
                    >
                        <FaChartLine /> Take New Assessment
                    </button>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => navigate('/student/therapists')}
                    >
                        Find a Therapist
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssessmentResults;