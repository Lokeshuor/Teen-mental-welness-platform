import React, { useState, useEffect } from 'react';
import { FaBell, FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';
import api from '../../utils/api';
import './ParentNotifications.css';

const ParentNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            // In a real implementation, this would fetch from the API
            // For now, show sample notifications
            setNotifications([
                {
                    id: 1,
                    title: 'Assessment Completed',
                    message: 'Your child Alex has completed a mental health assessment.',
                    type: 'assessment',
                    created_at: new Date().toISOString(),
                    is_read: false
                },
                {
                    id: 2,
                    title: 'Session Scheduled',
                    message: 'A therapy session has been scheduled for Alex on Friday at 3:00 PM.',
                    type: 'session',
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                    is_read: true
                }
            ]);
            setIsLoading(false);
        } catch (error) {
            console.error('Fetch notifications error:', error);
            setIsLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            // In a real implementation, call API
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            setNotifications(prev => 
                prev.map(n => ({ ...n, is_read: true }))
            );
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    };

    const getTypeIcon = (type) => {
        const icons = {
            assessment: <FaCheckCircle />,
            session: <FaClock />,
            alert: <FaExclamationCircle />,
            system: <FaBell />
        };
        return icons[type] || <FaBell />;
    };

    const getTypeColor = (type) => {
        const colors = {
            assessment: 'var(--success)',
            session: 'var(--primary-500)',
            alert: 'var(--danger)',
            system: 'var(--accent-purple)'
        };
        return colors[type] || 'var(--neutral-500)';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="pn-loading">
                <div className="spinner"></div>
                <p>Loading notifications...</p>
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="parent-notifications">
            <div className="container">
                <div className="pn-header">
                    <div className="pn-header-left">
                        <h1>Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="badge badge-primary">{unreadCount} unread</span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button className="btn btn-outline btn-sm" onClick={markAllAsRead}>
                            Mark All as Read
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="pn-empty card">
                        <p>No notifications</p>
                    </div>
                ) : (
                    <div className="pn-list">
                        {notifications.map((notification) => (
                            <div 
                                key={notification.id} 
                                className={`pn-item card ${notification.is_read ? 'read' : 'unread'}`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div 
                                    className="pn-item-icon"
                                    style={{ backgroundColor: getTypeColor(notification.type) + '20', color: getTypeColor(notification.type) }}
                                >
                                    {getTypeIcon(notification.type)}
                                </div>
                                <div className="pn-item-content">
                                    <div className="pn-item-header">
                                        <h4>{notification.title}</h4>
                                        <span className="pn-item-date">{formatDate(notification.created_at)}</span>
                                    </div>
                                    <p>{notification.message}</p>
                                </div>
                                {!notification.is_read && <div className="pn-unread-dot"></div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentNotifications;