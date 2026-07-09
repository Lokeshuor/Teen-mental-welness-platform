import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaCalendarAlt, FaUsers, FaComments, FaChartLine, 
    FaCheckCircle, FaClock, FaExclamationCircle
} from 'react-icons/fa';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import './TherapistDashboard.css';

const TherapistDashboard = () => {
    const user = getUser();
    const [stats, setStats] = useState({
        totalSessions: 0,
        upcomingSessions: 0,
        totalStudents: 0,
        unreadMessages: 0,
        completionRate: 0
    });
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const [sessionsRes, upcomingRes, studentsRes, messagesRes] = await Promise.all([
                api.get('/sessions/therapist'),
                api.get('/sessions/upcoming'),
                api.get('/users/students'),
                api.get('/messages/unread')
            ]);

            const allSessions = sessionsRes.data || [];
            const completed = allSessions.filter(s => s.status === 'completed').length;
            
            setStats({
                totalSessions: allSessions.length,
                upcomingSessions: upcomingRes.data?.length || 0,
                totalStudents: studentsRes.data?.length || 0,
                unreadMessages: messagesRes.data?.unread || 0,
                completionRate: allSessions.length > 0 ? (completed / allSessions.length * 100).toFixed(1) : 0
            });
            setUpcomingSessions(upcomingRes.data || []);
        } catch (error) {
            console.error('Fetch dashboard error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric'
        });
    };

    const formatTime = (time) => {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="td-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="therapist-dashboard">
            <div className="container">
                <div className="td-header">
                    <div>
                        <h1>Welcome back, {user?.first_name}!</h1>
                        <p>Here's your therapy practice overview</p>
                    </div>
                </div>

                <div className="td-stats-grid">
                    <div className="td-stat-card card">
                        <div className="td-stat-icon" style={{ backgroundColor: 'var(--primary-100)' }}>
                            <FaCalendarAlt style={{ color: 'var(--primary-500)' }} />
                        </div>
                        <div className="td-stat-info">
                            <h3>{stats.totalSessions}</h3>
                            <p>Total Sessions</p>
                        </div>
                    </div>
                    <div className="td-stat-card card">
                        <div className="td-stat-icon" style={{ backgroundColor: 'var(--warning-light)' }}>
                            <FaClock style={{ color: 'var(--warning)' }} />
                        </div>
                        <div className="td-stat-info">
                            <h3>{stats.upcomingSessions}</h3>
                            <p>Upcoming Sessions</p>
                        </div>
                    </div>
                    <div className="td-stat-card card">
                        <div className="td-stat-icon" style={{ backgroundColor: 'var(--success-light)' }}>
                            <FaUsers style={{ color: 'var(--success)' }} />
                        </div>
                        <div className="td-stat-info">
                            <h3>{stats.totalStudents}</h3>
                            <p>Students</p>
                        </div>
                    </div>
                    <div className="td-stat-card card">
                        <div className="td-stat-icon" style={{ backgroundColor: 'var(--accent-purple-light)' }}>
                            <FaComments style={{ color: 'var(--accent-purple)' }} />
                        </div>
                        <div className="td-stat-info">
                            <h3>{stats.unreadMessages}</h3>
                            <p>Unread Messages</p>
                        </div>
                    </div>
                </div>

                <div className="td-actions">
                    <h2>Quick Actions</h2>
                    <div className="td-actions-grid">
                        <Link to="/therapist/availability" className="td-action-card card">
                            <FaClock className="td-action-icon" />
                            <h4>Manage Availability</h4>
                            <p>Set your working hours</p>
                        </Link>
                        <Link to="/therapist/sessions" className="td-action-card card">
                            <FaCalendarAlt className="td-action-icon" />
                            <h4>View Sessions</h4>
                            <p>Manage your appointments</p>
                        </Link>
                        <Link to="/therapist/messages" className="td-action-card card">
                            <FaComments className="td-action-icon" />
                            <h4>Messages</h4>
                            <p>Respond to students</p>
                        </Link>
                        <Link to="/therapist/reports" className="td-action-card card">
                            <FaChartLine className="td-action-icon" />
                            <h4>Reports</h4>
                            <p>View practice analytics</p>
                        </Link>
                    </div>
                </div>

                {upcomingSessions.length > 0 && (
                    <div className="td-upcoming">
                        <h2>Upcoming Sessions</h2>
                        <div className="td-upcoming-list">
                            {upcomingSessions.map((session) => (
                                <div key={session.id} className="td-upcoming-item card">
                                    <div className="td-upcoming-info">
                                        <span className="td-student-name">
                                            {session.student_first} {session.student_last}
                                        </span>
                                        <span className="td-session-detail">
                                            {formatDate(session.session_date)} at {formatTime(session.start_time)}
                                        </span>
                                    </div>
                                    <div className="td-upcoming-status">
                                        {session.status === 'scheduled' ? (
                                            <span className="badge badge-primary"><FaClock /> Scheduled</span>
                                        ) : (
                                            <span className="badge badge-warning"><FaExclamationCircle /> In Progress</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TherapistDashboard;