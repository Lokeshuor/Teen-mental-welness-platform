import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaClock, FaUser, FaCheck, FaTimes, FaVideo } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import api from '../../utils/api';
import './TherapistSessions.css';

const TherapistSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/sessions/therapist');
            setSessions(response.data || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Fetch sessions error:', error);
            setIsLoading(false);
        }
    };

    const updateSessionStatus = async (sessionId, status) => {
        try {
            await api.put(`/sessions/${sessionId}/status`, { status });
            toast.success(`Session ${status} successfully`);
            fetchSessions();
        } catch (error) {
            console.error('Update session error:', error);
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

    const getFilteredSessions = () => {
        if (filter === 'all') return sessions;
        return sessions.filter(s => s.status === filter);
    };

    const formatDate = (date) => {
        return format(parseISO(date), 'EEE, MMM d, yyyy');
    };

    const formatTime = (time) => {
        return format(parseISO(`2000-01-01T${time}`), 'h:mm a');
    };

    if (isLoading) {
        return (
            <div className="ts-loading">
                <div className="spinner"></div>
                <p>Loading sessions...</p>
            </div>
        );
    }

    const filteredSessions = getFilteredSessions();

    return (
        <div className="therapist-sessions">
            <div className="container">
                <div className="ts-header">
                    <h1>My Sessions</h1>
                </div>

                <div className="ts-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filter === 'scheduled' ? 'active' : ''}`}
                        onClick={() => setFilter('scheduled')}
                    >
                        Scheduled
                    </button>
                    <button
                        className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
                        onClick={() => setFilter('in-progress')}
                    >
                        In Progress
                    </button>
                    <button
                        className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completed
                    </button>
                </div>

                {filteredSessions.length === 0 ? (
                    <div className="ts-empty card">
                        <p>No sessions found</p>
                    </div>
                ) : (
                    <div className="ts-list">
                        {filteredSessions.map((session) => (
                            <div key={session.id} className="ts-item card">
                                <div className="ts-item-header">
                                    <div className="ts-student">
                                        <FaUser className="student-icon" />
                                        <div>
                                            <h4>{session.student_first} {session.student_last}</h4>
                                            <span className="student-email">{session.student_email}</span>
                                        </div>
                                    </div>
                                    <span className={getStatusBadge(session.status)}>
                                        {session.status}
                                    </span>
                                </div>

                                <div className="ts-item-details">
                                    <div className="detail">
                                        <FaCalendarAlt />
                                        <span>{formatDate(session.session_date)}</span>
                                    </div>
                                    <div className="detail">
                                        <FaClock />
                                        <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                                    </div>
                                    <div className="detail">
                                        <FaVideo />
                                        <span>{session.session_type === 'online' ? 'Online' : 'In Person'}</span>
                                    </div>
                                </div>

                                {session.status === 'scheduled' && (
                                    <div className="ts-actions">
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => updateSessionStatus(session.id, 'in-progress')}
                                        >
                                            <FaCheck /> Start Session
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => updateSessionStatus(session.id, 'cancelled')}
                                        >
                                            <FaTimes /> Cancel
                                        </button>
                                    </div>
                                )}

                                {session.status === 'in-progress' && (
                                    <div className="ts-actions">
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => updateSessionStatus(session.id, 'completed')}
                                        >
                                            <FaCheck /> Complete Session
                                        </button>
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

export default TherapistSessions;