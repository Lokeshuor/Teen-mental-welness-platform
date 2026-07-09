import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    FaCalendarAlt, FaClock, FaUserMd, FaCheck, FaTimes, 
    FaVideo, FaUser, FaExclamationCircle
} from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import api from '../../utils/api';
import './MySessions.css';

const MySessions = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/sessions/student');
            setSessions(response.data || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Fetch sessions error:', error);
            setIsLoading(false);
        }
    };

    const handleCancel = async (sessionId) => {
        if (!window.confirm('Are you sure you want to cancel this session?')) return;

        try {
            await api.put(`/sessions/${sessionId}/cancel`, { reason: 'Cancelled by student' });
            toast.success('Session cancelled successfully');
            fetchSessions();
        } catch (error) {
            console.error('Cancel session error:', error);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            scheduled: 'badge-primary',
            'in-progress': 'badge-warning',
            completed: 'badge-success',
            cancelled: 'badge-danger',
            'no-show': 'badge-secondary'
        };
        return `badge ${badges[status] || 'badge-secondary'}`;
    };

    const getStatusIcon = (status) => {
        const icons = {
            scheduled: <FaClock />,
            'in-progress': <FaExclamationCircle />,
            completed: <FaCheck />,
            cancelled: <FaTimes />,
            'no-show': <FaTimes />
        };
        return icons[status] || <FaClock />;
    };

    const getFilteredSessions = () => {
        if (filter === 'all') return sessions;
        if (filter === 'upcoming') {
            return sessions.filter(s => s.status === 'scheduled' || s.status === 'in-progress');
        }
        if (filter === 'past') {
            return sessions.filter(s => s.status === 'completed' || s.status === 'cancelled' || s.status === 'no-show');
        }
        return sessions;
    };

    const formatDate = (date) => {
        return format(parseISO(date), 'EEE, MMM d, yyyy');
    };

    const formatTime = (time) => {
        return format(parseISO(`2000-01-01T${time}`), 'h:mm a');
    };

    if (isLoading) {
        return (
            <div className="sessions-loading">
                <div className="spinner"></div>
                <p>Loading your sessions...</p>
            </div>
        );
    }

    const filteredSessions = getFilteredSessions();

    return (
        <div className="my-sessions-page">
            <div className="container">
                <div className="sessions-header">
                    <h1>My Sessions</h1>
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/student/therapists')}
                    >
                        Book New Session
                    </button>
                </div>

                <div className="sessions-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setFilter('upcoming')}
                    >
                        Upcoming
                    </button>
                    <button
                        className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
                        onClick={() => setFilter('past')}
                    >
                        Past
                    </button>
                </div>

                {filteredSessions.length === 0 ? (
                    <div className="no-sessions card">
                        <p>No sessions found</p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/student/therapists')}
                        >
                            Find a Therapist
                        </button>
                    </div>
                ) : (
                    <div className="sessions-list">
                        {filteredSessions.map((session) => (
                            <div key={session.id} className="session-card card">
                                <div className="session-header">
                                    <div className="session-therapist">
                                        <FaUserMd className="therapist-icon" />
                                        <div>
                                            <h4>{session.therapist_first} {session.therapist_last}</h4>
                                            <span className="session-email">{session.therapist_email}</span>
                                        </div>
                                    </div>
                                    <span className={getStatusBadge(session.status)}>
                                        {getStatusIcon(session.status)} {session.status}
                                    </span>
                                </div>

                                <div className="session-details">
                                    <div className="detail-item">
                                        <FaCalendarAlt className="detail-icon" />
                                        <span>{formatDate(session.session_date)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <FaClock className="detail-icon" />
                                        <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                                    </div>
                                    <div className="detail-item">
                                        {session.session_type === 'online' ? <FaVideo /> : <FaUser />}
                                        <span>{session.session_type === 'online' ? 'Online' : 'In Person'}</span>
                                    </div>
                                    {session.meeting_link && (
                                        <div className="detail-item">
                                            <a 
                                                href={session.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="meeting-link"
                                            >
                                                Join Meeting
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {(session.status === 'scheduled' || session.status === 'in-progress') && (
                                    <div className="session-actions">
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleCancel(session.id)}
                                        >
                                            <FaTimes /> Cancel Session
                                        </button>
                                        {session.status === 'in-progress' && session.meeting_link && (
                                            <a
                                                href={session.meeting_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary btn-sm"
                                            >
                                                <FaVideo /> Join Now
                                            </a>
                                        )}
                                    </div>
                                )}

                                {session.cancellation_reason && (
                                    <div className="cancellation-reason">
                                        <span className="reason-label">Reason:</span>
                                        <span>{session.cancellation_reason}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MySessions;