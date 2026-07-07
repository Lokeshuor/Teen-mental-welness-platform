import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { getUser, logout } from '../utils/auth';
import './Navbar.css';

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
        switch (user.role) {
            case 'student': return '/student/dashboard';
            case 'therapist': return '/therapist/dashboard';
            case 'parent': return '/parent/dashboard';
            case 'admin': return '/admin/dashboard';
            default: return '/login';
        }
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
                >
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </button>

                <div className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
                    <div className="navbar-user">
                        <FaUser className="user-icon" />
                        <span className="user-name">{user.first_name}</span>
                        <span className="user-role badge badge-primary">{user.role}</span>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline btn-sm">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;