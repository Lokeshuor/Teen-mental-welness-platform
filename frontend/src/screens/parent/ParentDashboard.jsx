import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FaUser, FaClipboardCheck, FaCalendarAlt, FaHistory, FaPlus, FaTimes, FaUserMd } from 'react-icons/fa';
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
    const [pastSessions, setPastSessions] = useState([]);
    const [sessionChildFilter, setSessionChildFilter] = useState('all');

    useEffect(() => {
        fetchChildren();
        fetchPastSessions();
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

    const fetchPastSessions = async () => {
        try {
            const response = await api.get('/users/my-children/sessions');
            setPastSessions(response.data || []);
        } catch (error) {
            console.error('Fetch past sessions error:', error);
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
            fetchPastSessions();
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
            fetchPastSessions();
        } catch (error) {
            // Error handled by interceptor
        }
    };

    const getRiskBadge = (level) => {
        const badges = { low: 'badge-low', moderate: 'badge-moderate', high: 'badge-high' };
        return `badge ${badges[level] || 'badge-low'}`;
    };

    const formatDate = (date) => {
        if (!date) return null;
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        }).format(new Date(date));
    };

    const formatTime = (time) => {
        if (!time) return null;
        const [hours, minutes] = String(time).split(':');
        return new Intl.DateTimeFormat('en-GB', {
            hour: 'numeric', minute: '2-digit', hour12: true
        }).format(new Date(2000, 0, 1, Number(hours), Number(minutes)));
    };

    const filteredSessions = useMemo(() => {
        if (sessionChildFilter === 'all') return pastSessions;
        return pastSessions.filter((session) => String(session.student_id) === sessionChildFilter);
    }, [pastSessions, sessionChildFilter]);

    const completedCount = useMemo(
        () => pastSessions.filter((session) => session.status === 'completed').length,
        [pastSessions]
    );

    const getStatusLabel = (session) => {
        // A session left "scheduled" or "in-progress" past its date was never
        // closed out by the therapist, so it reads as "Not recorded".
        if (session.status === 'scheduled' || session.status === 'in-progress') return 'Not recorded';
        return session.status === 'no-show'
            ? 'Missed'
            : session.status.charAt(0).toUpperCase() + session.status.slice(1);
    };

    const getStatusClass = (session) => {
        const map = {
            completed: 'is-completed',
            cancelled: 'is-cancelled',
            'no-show': 'is-missed'
        };
        return map[session.status] || 'is-pending';
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
                    <div className="pd-stat-card card">
                        <div className="pd-stat-icon" style={{ backgroundColor: 'var(--success-light)' }}>
                            <FaHistory style={{ color: 'var(--success)' }} />
                        </div>
                        <div className="pd-stat-info">
                            <h3>{completedCount}</h3>
                            <p>Completed Sessions</p>
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

                <section className="pd-wellness-updates" aria-labelledby="wellness-updates-heading">
                    <div className="pd-wellness-header">
                        <div>
                            <h2 id="wellness-updates-heading"><FaClipboardCheck /> Wellness Updates</h2>
                            <p>Latest assessment and session information for your linked children.</p>
                        </div>
                    </div>

                    {children.length === 0 ? (
                        <div className="pd-no-children card">
                            <p>Link a child to view their wellness updates.</p>
                        </div>
                    ) : (
                        <div className="pd-wellness-grid">
                            {children.map((child) => (
                                <article key={child.id} className="pd-wellness-card card">
                                    <h3>{child.first_name} {child.last_name}</h3>
                                    <div className="pd-wellness-item">
                                        <span>Latest wellness check</span>
                                        {child.latest_risk_level ? (
                                            <div>
                                                <span className={getRiskBadge(child.latest_risk_level)}>{child.latest_risk_level} risk</span>
                                                <small>{formatDate(child.latest_assessment_at)}</small>
                                            </div>
                                        ) : <strong>No assessment completed yet</strong>}
                                    </div>
                                    {child.latest_recommendation && (
                                        <p className="pd-recommendation">{child.latest_recommendation}</p>
                                    )}
                                    <div className="pd-wellness-item">
                                        <span>Next session</span>
                                        {child.next_session_date ? (
                                            <strong>{formatDate(child.next_session_date)}{child.next_session_time ? ` at ${formatTime(child.next_session_time)}` : ''}</strong>
                                        ) : <strong>No upcoming session</strong>}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="pd-history" aria-labelledby="past-sessions-heading">
                    <div className="pd-history-header">
                        <div>
                            <h2 id="past-sessions-heading"><FaHistory /> Past Sessions</h2>
                            <p>Completed, cancelled and missed appointments for your linked children.</p>
                        </div>
                        {children.length > 1 && pastSessions.length > 0 && (
                            <select
                                className="form-select pd-history-filter"
                                value={sessionChildFilter}
                                onChange={(e) => setSessionChildFilter(e.target.value)}
                                aria-label="Filter past sessions by child"
                            >
                                <option value="all">All children</option>
                                {children.map((child) => (
                                    <option key={child.id} value={String(child.id)}>
                                        {child.first_name} {child.last_name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {children.length === 0 ? (
                        <div className="pd-no-children card">
                            <p>Link a child to view their session history.</p>
                        </div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="pd-no-children card">
                            <p>
                                {pastSessions.length === 0
                                    ? 'No past sessions yet.'
                                    : 'No past sessions for this child.'}
                            </p>
                            <p className="pd-no-children-hint">
                                Completed appointments will appear here after they take place.
                            </p>
                        </div>
                    ) : (
                        <div className="pd-history-list">
                            {filteredSessions.map((session) => (
                                <article key={session.id} className="pd-history-item card">
                                    <div className="pd-history-date">
                                        <span className="pd-history-day">{formatDate(session.session_date)}</span>
                                        <span className="pd-history-time">
                                            {formatTime(session.start_time)} – {formatTime(session.end_time)}
                                        </span>
                                    </div>
                                    <div className="pd-history-body">
                                        <h4>{session.student_first} {session.student_last}</h4>
                                        <p className="pd-history-therapist">
                                            <FaUserMd /> {session.therapist_first} {session.therapist_last}
                                            {session.therapist_specialization ? ` • ${session.therapist_specialization}` : ''}
                                        </p>
                                        <p className="pd-history-meta">
                                            {session.session_type === 'in-person' ? 'In person' : 'Online'}
                                        </p>
                                        {session.status === 'cancelled' && session.cancellation_reason && (
                                            <p className="pd-history-reason">
                                                Reason: {session.cancellation_reason}
                                            </p>
                                        )}
                                    </div>
                                    <span className={`pd-history-status ${getStatusClass(session)}`}>
                                        {getStatusLabel(session)}
                                    </span>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ParentDashboard;
