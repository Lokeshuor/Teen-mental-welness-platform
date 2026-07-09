import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaUser, FaChartLine, FaClipboardCheck } from 'react-icons/fa';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import './ParentDashboard.css';

const ParentDashboard = () => {
    const user = getUser();
    const [children, setChildren] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            // In a real implementation, this would fetch the parent's children
            // For now, we'll show placeholder data
            setChildren([
                { id: 1, first_name: 'Alex', last_name: 'Smith', grade_level: '10', school_id: 'HS-101' }
            ]);
            setNotifications([]);
        } catch (error) {
            console.error('Fetch parent dashboard error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="pd-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="parent-dashboard">
            <div className="container">
                <div className="pd-header">
                    <h1>Welcome, {user?.first_name}!</h1>
                    <p>Stay connected with your child's mental wellness journey</p>
                </div>

                <div className="pd-stats-grid">
                    <div className="pd-stat-card card">
                        <div className="pd-stat-icon" style={{ backgroundColor: 'var(--primary-100)' }}>
                            <FaUser style={{ color: 'var(--primary-500)' }} />
                        </div>
                        <div className="pd-stat-info">
                            <h3>{children.length}</h3>
                            <p>Children</p>
                        </div>
                    </div>
                    <div className="pd-stat-card card">
                        <div className="pd-stat-icon" style={{ backgroundColor: 'var(--warning-light)' }}>
                            <FaBell style={{ color: 'var(--warning)' }} />
                        </div>
                        <div className="pd-stat-info">
                            <h3>{notifications.length}</h3>
                            <p>Notifications</p>
                        </div>
                    </div>
                </div>

                <div className="pd-children">
                    <h2>Your Children</h2>
                    {children.length === 0 ? (
                        <div className="pd-no-children card">
                            <p>No children linked to your account</p>
                        </div>
                    ) : (
                        <div className="pd-children-grid">
                            {children.map((child) => (
                                <div key={child.id} className="pd-child-card card">
                                    <div className="pd-child-avatar">
                                        {child.first_name[0]}{child.last_name[0]}
                                    </div>
                                    <div className="pd-child-info">
                                        <h4>{child.first_name} {child.last_name}</h4>
                                        <p>Grade {child.grade_level} • {child.school_id}</p>
                                    </div>
                                    <Link to={`/parent/child/${child.id}`} className="btn btn-outline btn-sm">
                                        View Details
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pd-actions">
                    <h2>Quick Actions</h2>
                    <div className="pd-actions-grid">
                        <Link to="/parent/notifications" className="pd-action-card card">
                            <FaBell className="pd-action-icon" />
                            <h4>Notifications</h4>
                            <p>View updates about your child</p>
                        </Link>
                        <Link to="/parent/resources" className="pd-action-card card">
                            <FaClipboardCheck className="pd-action-icon" />
                            <h4>Resources</h4>
                            <p>Parent resources and guides</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;