import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    FaHome, 
    FaClipboardCheck, 
    FaUserMd, 
    FaCalendarAlt, 
    FaComments,
    FaUser,
    FaChartLine,
    FaUsers,
    FaCog,
    FaBars,
    FaTimes,
    FaBell
} from 'react-icons/fa';
import { getRole } from '../utils/auth';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const role = getRole();
    const [collapsed, setCollapsed] = useState(false);

    const getNavItems = () => {
        const commonItems = [
            { path: `/${role}/dashboard`, icon: FaHome, label: 'Dashboard' },
            { path: `/${role}/messages`, icon: FaComments, label: 'Messages' },
            { path: `/${role}/profile`, icon: FaUser, label: 'Profile' },
        ];

        switch (role) {
            case 'student':
                return [
                    ...commonItems.slice(0, 1),
                    { path: '/student/assessment', icon: FaClipboardCheck, label: 'Assessment' },
                    { path: '/student/therapists', icon: FaUserMd, label: 'Therapists' },
                    { path: '/student/sessions', icon: FaCalendarAlt, label: 'Sessions' },
                    ...commonItems.slice(1),
                ];
            case 'therapist':
                return [
                    ...commonItems.slice(0, 1),
                    { path: '/therapist/sessions', icon: FaCalendarAlt, label: 'Sessions' },
                    { path: '/therapist/students', icon: FaUsers, label: 'Students' },
                    { path: '/therapist/availability', icon: FaCalendarAlt, label: 'Availability' },
                    { path: '/therapist/reports', icon: FaChartLine, label: 'Reports' },
                    ...commonItems.slice(1),
                ];
            case 'admin':
                return [
                    ...commonItems.slice(0, 1),
                    { path: '/admin/users', icon: FaUsers, label: 'Users' },
                    { path: '/admin/reports', icon: FaChartLine, label: 'Reports' },
                    { path: '/admin/settings', icon: FaCog, label: 'Settings' },
                    ...commonItems.slice(1),
                ];
            case 'parent':
                return [
                    ...commonItems.slice(0, 1),
                    { path: '/parent/notifications', icon: FaBell, label: 'Notifications' },
                    ...commonItems.slice(1),
                ];
            default:
                return commonItems;
        }
    };

    const navItems = getNavItems();

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div className="sidebar-overlay" onClick={onClose} />
            )}

            <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <button 
                        className="sidebar-toggle" 
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? <FaBars /> : <FaTimes />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <Icon className="sidebar-icon" />
                                {!collapsed && <span className="sidebar-label">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
};

// Add these styles to global.css
const sidebarStyles = `
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: calc(var(--z-fixed) - 1);
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 240px;
  background: white;
  border-right: 1px solid var(--neutral-200);
  z-index: var(--z-fixed);
  transition: all var(--transition-base);
  overflow-y: auto;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--neutral-200);
  min-height: 60px;
}

.sidebar-toggle {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  color: var(--neutral-500);
  cursor: pointer;
  padding: var(--spacing-sm);
  transition: color var(--transition-fast);
}

.sidebar-toggle:hover {
  color: var(--primary-500);
}

.sidebar-nav {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  color: var(--neutral-600);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.sidebar-link:hover {
  background: var(--neutral-50);
  color: var(--primary-500);
}

.sidebar-link.active {
  background: var(--primary-50);
  color: var(--primary-600);
  font-weight: 600;
}

.sidebar-icon {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.sidebar-label {
  font-size: var(--font-size-sm);
  white-space: nowrap;
}

.sidebar.collapsed .sidebar-label {
  display: none;
}

.sidebar.collapsed .sidebar-link {
  justify-content: center;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .sidebar-overlay {
    display: block;
  }
  
  .sidebar.collapsed {
    transform: translateX(-100%);
  }
  
  .sidebar.collapsed.open {
    transform: translateX(0);
    width: 240px;
  }
}
`;

export default Sidebar;