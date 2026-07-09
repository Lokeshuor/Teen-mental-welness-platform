import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaUsers, FaUserMd, FaClipboardCheck, FaChartLine,
    FaCalendarAlt, FaCog, FaFileAlt
} from 'react-icons/fa';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const user = getUser();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTherapists: 0,
        totalAssessments: 0,
        totalSessions: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const [usersRes, assessmentsRes, sessionsRes] = await Promise.all([
                api.get('/users/students'),
                api.get('/assessments/statistics'),
                api.get('/sessions/therapist')
            ]);

            const students = usersRes.data || [];
            const therapists = await api.get('/users/therapists').then(r => r.data || []);

            setStats({
                totalUsers: students.length + therapists.length,
                totalStudents: students.length,
                totalTherapists: therapists.length,
                totalAssessments: assessmentsRes.data?.recentAssessments?.length || 0,
                totalSessions: sessionsRes.data?.length || 0
            });

            // Get recent assessments for activity
            setRecentActivity(assessmentsRes.data?.recentAssessments || []);
        } catch (error) {
            console.error('Fetch admin dashboard error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="ad-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="container">
                <div className="ad-header">
                    <h1>Admin Dashboard</h1>
                    <p>System overview and management</p>
                </div>

                <div className="ad-stats-grid">
                    <div className="ad-stat-card card">
                        <div className="ad-stat-icon" style={{ backgroundColor: 'var(--primary-100)' }}>
                            <FaUsers style={{ color: 'var(--primary-500)' }} />
                        </div>
                        <div className="ad-stat-info">
                            <h3>{stats.totalUsers}</h3>
                            <p>Total Users</p>
                        </div>
                    </div>
                    <div className="ad-stat-card card">
                        <div className="ad-stat-icon" style={{ backgroundColor: 'var(--success-light)' }}>
                            <FaUserMd style={{ color: 'var(--success)' }} />
                        </div>
                        <div className="ad-stat-info">
                            <h3>{stats.totalStudents}</h3>
                            <p>Students</p>
                        </div>
                    </div>
                    <div className="ad-stat-card card">
                        <div className="ad-stat-icon" style={{ backgroundColor: 'var(--accent-purple-light)' }}>
                            <FaClipboardCheck style={{ color: 'var(--accent-purple)' }} />
                        </div>
                        <div className="ad-stat-info">
                            <h3>{stats.totalAssessments}</h3>
                            <p>Assessments</p>
                        </div>
                    </div>
                    <div className="ad-stat-card card">
                        <div className="ad-stat-icon" style={{ backgroundColor: 'var(--warning-light)' }}>
                            <FaCalendarAlt style={{ color: 'var(--warning)' }} />
                        </div>
                        <div className="ad-stat-info">
                            <h3>{stats.totalSessions}</h3>
                            <p>Sessions</p>
                        </div>
                    </div>
                </div>

                <div className="ad-actions">
                    <h2>Management</h2>
                    <div className="ad-actions-grid">
                        <Link to="/admin/users" className="ad-action-card card">
                            <FaUsers className="ad-action-icon" />
                            <h4>User Management</h4>
                            <p>Manage users and roles</p>
                        </Link>
                        <Link to="/admin/reports" className="ad-action-card card">
                            <FaFileAlt className="ad-action-icon" />
                            <h4>Reports</h4>
                            <p>View system analytics</p>
                        </Link>
                        <Link to="/admin/settings" className="ad-action-card card">
                            <FaCog className="ad-action-icon" />
                            <h4>Settings</h4>
                            <p>Configure system settings</p>
                        </Link>
                    </div>
                </div>

                {recentActivity.length > 0 && (
                    <div className="ad-activity">
                        <h2>Recent Activity</h2>
                        <div className="ad-activity-list">
                            {recentActivity.slice(0, 5).map((item) => (
                                <div key={item.id} className="ad-activity-item card">
                                    <div className="ad-activity-info">
                                        <span className="ad-activity-user">
                                            {item.first_name} {item.last_name}
                                        </span>
                                        <span className="ad-activity-action">
                                            Completed assessment
                                        </span>
                                        <span className="ad-activity-risk badge badge-{item.risk_level}">
                                            {item.risk_level} risk
                                        </span>
                                    </div>
                                    <span className="ad-activity-date">
                                        {new Date(item.completed_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;