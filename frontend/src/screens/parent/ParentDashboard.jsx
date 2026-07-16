import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaBell, FaUser, FaClipboardCheck, FaCalendarAlt, FaPlus, FaTimes } from 'react-icons/fa';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import './ParentDashboard.css';

const ParentDashboard = () => {
    const user = getUser();
    const [children, setChildren] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [childEmail, setChildEmail] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    const [showLinkForm, setShowLinkForm] = useState(false);

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/users/my-children');
            setChildren(response.data || []);
        } catch (error) {
            console.error('Fetch children error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLinkChild = async (e) => {
        e.preventDefault();
        if (!childEmail.trim()) {
            toast.error("Please enter your child's email");
            return;
        }
        setIsLinking(true);
        try {
            const response = await api.post('/users/link-child', { student_email: childEmail.trim() });
            toast.success(response.data.message);
            setChildEmail('');
            setShowLinkForm(false);
            fetchChildren();
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setIsLinking(false);
        }
    };

    const handleUnlinkChild = async (child) => {
        if (!window.confirm(`Remove ${child.first_name} ${child.last_name} from your account?`)) return;
        try {
            await api.delete(`/users/my-children/${child.id}`);
            toast.success('Child unlinked');
            fetchChildren();
        } catch (error) {
            // Error handled by interceptor
        }
    };

    const getRiskBadge = (level) => {
        const badges = { low: 'badge-low', moderate: 'badge-moderate', high: 'badge-high' };
        return `badge ${badges[level] || 'badge-low'}`;
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
                            <FaCalendarAlt style={{ color: 'var(--warning)' }} />
                        </div>
                        <div className="pd-stat-info">
                            <h3>{children.reduce((sum, c) => sum + (c.upcoming_sessions || 0), 0)}</h3>
                            <p>Upcoming Sessions</p>
                        </div>
                    </div>
                </div>

                <div className="pd-children">
                    <div className="pd-children-header">
                        <h2>Your Children</h2>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setShowLinkForm(!showLinkForm)}
                        >
                            {showLinkForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Link a Child</>}
                        </button>
                    </div>

                    {showLinkForm && (
                        <form className="pd-link-form card" onSubmit={handleLinkChild}>
                            <div className="form-group flex-1">
                                <label className="form-label">Child's Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="Enter your child's account email"
                                    value={childEmail}
                                    onChange={(e) => setChildEmail(e.target.value)}
                                />
                                <span className="form-hint">Your child must already have a student account.</span>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={isLinking}>
                                {isLinking ? 'Linking...' : 'Link Child'}
                            </button>
                        </form>
                    )}

                    {children.length === 0 ? (
                        <div className="pd-no-children card">
                            <p>No children linked to your account yet.</p>
                            <p className="pd-no-children-hint">
                                Click "Link a Child" above and enter your child's account email to get started.
                            </p>
                        </div>
                    ) : (
                        <div className="pd-children-grid">
                            {children.map((child) => (
                                <div key={child.id} className="pd-child-card card">
                                    <div className="pd-child-top">
                                        <div className="pd-child-avatar">
                                            {child.first_name[0]}{child.last_name[0]}
                                        </div>
                                        <div className="pd-child-info">
                                            <h4>{child.first_name} {child.last_name}</h4>
                                            <p>
                                                {child.grade_level ? `Grade ${child.grade_level}` : 'Student'}
                                                {child.school_id ? ` • ${child.school_id}` : ''}
                                            </p>
                                        </div>
                                        <button
                                            className="pd-child-unlink"
                                            title="Unlink child"
                                            onClick={() => handleUnlinkChild(child)}
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                    <div className="pd-child-stats">
                                        <div className="pd-child-stat">
                                            <span className="pd-child-stat-label">Wellness check</span>
                                            {child.latest_risk_level ? (
                                                <span className={getRiskBadge(child.latest_risk_level)}>
                                                    {child.latest_risk_level} risk
                                                </span>
                                            ) : (
                                                <span className="pd-child-stat-value">No assessment yet</span>
                                            )}
                                        </div>
                                        <div className="pd-child-stat">
                                            <span className="pd-child-stat-label">Upcoming sessions</span>
                                            <span className="pd-child-stat-value">{child.upcoming_sessions || 0}</span>
                                        </div>
                                    </div>
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
                        <Link to="/parent/notifications" className="pd-action-card card">
                            <FaClipboardCheck className="pd-action-icon" />
                            <h4>Wellness Updates</h4>
                            <p>Assessment and session alerts</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
