import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
    FaUser, FaSignOutAlt, FaBars, FaTimes, FaHome,
    FaClipboardCheck, FaUserMd, FaCalendarAlt, FaComments,
    FaUsers, FaChartLine, FaCog, FaBell
} from 'react-icons/fa';
import { getUser, logout } from '../utils/auth';
import './Navbar.css';

const NAV_ITEMS = {
    student: [
        { path: '/student/dashboard', icon: FaHome, label: 'Dashboard' },
        { path: '/student/assessment', icon: FaClipboardCheck, label: 'Assessment' },
        { path: '/student/therapists', icon: FaUserMd, label: 'Therapists' },
        { path: '/student/sessions', icon: FaCalendarAlt, label: 'Sessions' },
        { path: '/student/messages', icon: FaComments, label: 'Messages' },
        { path: '/student/profile', icon: FaUser, label: 'Profile' }
    ],
    therapist: [
        { path: '/therapist/dashboard', icon: FaHome, label: 'Dashboard' },
        { path: '/therapist/sessions', icon: FaCalendarAlt, label: 'Sessions' },
        { path: '/therapist/students', icon: FaUsers, label: 'Students' },
        { path: '/therapist/availability', icon: FaClipboardCheck, label: 'Availability' },
        { path: '/therapist/messages', icon: FaComments, label: 'Messages' },
        { path: '/therapist/reports', icon: FaChartLine, label: 'Reports' }
    ],
    parent: [
        { path: '/parent/dashboard', icon: FaHome, label: 'Dashboard' },
        { path: '/parent/notifications', icon: FaBell, label: 'Notifications' }
    ],
    admin: [
        { path: '/admin/dashboard', icon: FaHome, label: 'Dashboard' },
        { path: '/admin/users', icon: FaUsers, label: 'Users' },
        { path: '/admin/reports', icon: FaChartLine, label: 'Reports' },
        { path: '/admin/settings', icon: FaCog, label: 'Settings' }
    ]
};

const Navbar = () => {
    const navigate = useNavigate();
    const user = getUser();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getDashboardPath = () => {
        if (!user) return '/login';
        return NAV_ITEMS[user.role] ? `/${user.role}/dashboard` : '/login';
    };

    if (!user) {
        return (
            <nav className="navbar">
                <div className="container navbar-container">
                    <Link to="/" className="navbar-brand">
                        <span className="brand-icon">🧠</span>
                        <span className="brand-text">Teen Wellness</span>
                    </Link>
                    <div className="navbar-actions">
                        <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                        <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
                    </div>
                </div>
            </nav>
        );
    }

    const navItems = NAV_ITEMS[user.role] || [];

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to={getDashboardPath()} className="navbar-brand">
                    <span className="brand-icon">🧠</span>
                    <span className="brand-text">Teen Wellness</span>
                </Link>

                <button
                    className="navbar-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle navigation menu"
                >
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </button>

                <div className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
                    <div className="navbar-links">
                        {navItems.map(({ path, icon: Icon, label }) => (
                            <NavLink
                                key={path}
                                to={path}
                                className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Icon className="navbar-link-icon" />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </div>

                    <div className="navbar-user">
                        <FaUser className="user-icon" />
                        <span className="user-name">{user.first_name}</span>
                        <span className="user-role badge badge-primary">{user.role}</span>
                        <button onClick={handleLogout} className="btn btn-outline btn-sm">
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
