import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaClipboardCheck, 
    FaCalendarAlt, 
    FaUserMd, 
    FaChartLine,
    FaComments,
    FaArrowRight
} from 'react-icons/fa';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import './Dashboard.css';

const Dashboard = () => {
    const user = getUser();
    const [stats, setStats] = useState({
        assessments: 0,
        upcomingSessions: 0,
        messages: 0,
        therapistCount: 0
    });
    const [latestAssessment, setLatestAssessment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const [assessmentsRes, sessionsRes, messagesRes, therapistsRes, latestAssessmentRes] = await Promise.all([
                api.get('/assessments/student'),
                api.get('/sessions/upcoming'),
                api.get('/messages/recent?limit=5'),
                api.get('/sessions/therapists'),
                api.get('/assessments/latest').catch(() => ({ data: null }))
            ]);

            setStats({
                assessments: assessmentsRes.data?.length || 0,
                upcomingSessions: sessionsRes.data?.length || 0,
                messages: messagesRes.data?.length || 0,
                therapistCount: therapistsRes.data?.length || 0
            });
            setLatestAssessment(latestAssessmentRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
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

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>Welcome back, {user?.first_name}!</h1>
                        <p>Here's your mental wellness overview</p>
                    </div>
                    <Link to="/student/assessment" className="btn btn-primary">
                        <FaClipboardCheck /> Take Assessment
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card card">
                        <div className="stat-icon" style={{ backgroundColor: 'var(--primary-100)' }}>
                            <FaClipboardCheck style={{ color: 'var(--primary-500)' }} />
                        </div>
                        <div className="stat-info">
                            <h3>{stats.assessments}</h3>
                            <p>Assessments Taken</p>
                        </div>
                    </div>
                    <div className="stat-card card">
                        <div className="stat-icon" style={{ backgroundColor: 'var(--accent-purple-light)' }}>
                            <FaCalendarAlt style={{ color: 'var(--accent-purple)' }} />
                        </div>
                        <div className="stat-info">
                            <h3>{stats.upcomingSessions}</h3>
                            <p>Upcoming Sessions</p>
                        </div>
                    </div>
                    <div className="stat-card card">
                        <div className="stat-icon" style={{ backgroundColor: 'var(--success-light)' }}>
                            <FaComments style={{ color: 'var(--success)' }} />
                        </div>
                        <div className="stat-info">
                            <h3>{stats.messages}</h3>
                            <p>Unread Messages</p>
                        </div>
                    </div>
                    <div className="stat-card card">
                        <div className="stat-icon" style={{ backgroundColor: 'var(--warning-light)' }}>
                            <FaUserMd style={{ color: 'var(--warning)' }} />
                        </div>
                        <div className="stat-info">
                            <h3>{stats.therapistCount}</h3>
                            <p>Available Therapists</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-actions">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <Link to="/student/assessment" className="action-card card">
                            <FaClipboardCheck className="action-icon" />
                            <h4>Take Assessment</h4>
                            <p>Complete a mental health screening</p>
                            <span className="action-arrow"><FaArrowRight /></span>
                        </Link>
                        <Link to="/student/therapists" className="action-card card">
                            <FaUserMd className="action-icon" />
                            <h4>Find a Therapist</h4>
                            <p>Browse available therapists</p>
                            <span className="action-arrow"><FaArrowRight /></span>
                        </Link>
                        <Link to="/student/sessions" className="action-card card">
                            <FaCalendarAlt className="action-icon" />
                            <h4>My Sessions</h4>
                            <p>View and manage your appointments</p>
                            <span className="action-arrow"><FaArrowRight /></span>
                        </Link>
                        <Link to="/student/messages" className="action-card card">
                            <FaComments className="action-icon" />
                            <h4>Messages</h4>
                            <p>Chat with your therapist</p>
                            <span className="action-arrow"><FaArrowRight /></span>
                        </Link>
                    </div>
                </div>

                {/* Latest Assessment Result */}
                {latestAssessment && (
                    <div className="latest-assessment card">
                        <h3>Latest Assessment Results</h3>
                        <div className="assessment-result">
                            <div className="result-score">
                                <span className="score-number">{latestAssessment.total_score}</span>
                                <span className="score-label">Score</span>
                            </div>
                            <div className="result-details">
                                <div className="result-risk">
                                    <span className={getRiskBadge(latestAssessment.risk_level)}>
                                        {latestAssessment.risk_level.toUpperCase()} Risk
                                    </span>
                                </div>
                                <div className="result-recommendation">
                                    <p>{latestAssessment.recommendation}</p>
                                </div>
                            </div>
                            <Link to="/student/assessment/results" className="btn btn-outline btn-sm">
                                View Full Report
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;