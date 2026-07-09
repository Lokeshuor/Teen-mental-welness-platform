import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaSearch, FaUser, FaUserMd, FaUserPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import api from '../../utils/api';
import Modal from '../../components/Modal';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchQuery, roleFilter, users]);

    const fetchUsers = async () => {
        try {
            const [studentsRes, therapistsRes] = await Promise.all([
                api.get('/users/students'),
                api.get('/users/therapists')
            ]);
            const allUsers = [...(studentsRes.data || []), ...(therapistsRes.data || [])];
            setUsers(allUsers);
            setFilteredUsers(allUsers);
            setIsLoading(false);
        } catch (error) {
            console.error('Fetch users error:', error);
            setIsLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;
        
        if (roleFilter !== 'all') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(u => 
                u.first_name.toLowerCase().includes(query) ||
                u.last_name.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query)
            );
        }
        
        setFilteredUsers(filtered);
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            await api.put(`/users/${userId}/status`, { is_active: !currentStatus });
            toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
            fetchUsers();
        } catch (error) {
            console.error('Toggle user status error:', error);
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        
        try {
            await api.delete(`/users/${userId}`);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            console.error('Delete user error:', error);
        }
    };

    const getRoleBadge = (role) => {
        const colors = {
            student: 'badge-primary',
            therapist: 'badge-success',
            parent: 'badge-warning',
            admin: 'badge-danger'
        };
        return `badge ${colors[role] || 'badge-secondary'}`;
    };

    const getStatusBadge = (isActive) => {
        return isActive ? 'badge-success' : 'badge-danger';
    };

    if (isLoading) {
        return (
            <div className="um-loading">
                <div className="spinner"></div>
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className="user-management">
            <div className="container">
                <div className="um-header">
                    <h1>User Management</h1>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <FaUserPlus /> Add User
                    </button>
                </div>

                <div className="um-filters">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <select
                        className="form-select"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="student">Students</option>
                        <option value="therapist">Therapists</option>
                        <option value="parent">Parents</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>

                <div className="um-table-container">
                    <table className="um-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="no-data">No users found</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">
                                                    {user.role === 'therapist' ? <FaUserMd /> : <FaUser />}
                                                </div>
                                                {user.first_name} {user.last_name}
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={getRoleBadge(user.role)}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={getStatusBadge(user.is_active)}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="um-actions">
                                                <button
                                                    className="btn btn-outline btn-sm"
                                                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                                                >
                                                    {user.is_active ? <FaToggleOn /> : <FaToggleOff />}
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => deleteUser(user.id)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New User">
                <div className="um-modal-content">
                    <p className="modal-hint">User creation form would go here.</p>
                    <button className="btn btn-primary btn-full" onClick={() => setShowModal(false)}>
                        Close
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagement;