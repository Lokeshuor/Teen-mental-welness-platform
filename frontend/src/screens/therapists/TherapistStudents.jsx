import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaComments, FaGraduationCap, FaSchool, FaSearch, FaTimes, FaUsers } from 'react-icons/fa';
import api from '../../utils/api';
import './TherapistStudents.css';

const STATUS_FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

const getInitials = (student) =>
    `${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}`.toUpperCase() || '?';

const TherapistStudents = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/users/students');
            setStudents(response.data || []);
        } catch (error) {
            console.error('Fetch students error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Derived from state so the list can never drift out of sync with the filters.
    const filteredStudents = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return students.filter((s) => {
            if (statusFilter === 'active' && !s.is_active) return false;
            if (statusFilter === 'inactive' && s.is_active) return false;
            if (!query) return true;
            return [s.first_name, s.last_name, s.email, s.school_id]
                .filter(Boolean)
                .some((field) => String(field).toLowerCase().includes(query));
        });
    }, [students, searchQuery, statusFilter]);

    const activeCount = useMemo(
        () => students.filter((s) => s.is_active).length,
        [students]
    );

    const handleMessageStudent = (studentId) => {
        navigate(`/therapist/messages/${studentId}`);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
    };

    if (isLoading) {
        return (
            <div className="tstu-loading">
                <div className="spinner"></div>
                <p>Loading students...</p>
            </div>
        );
    }

    return (
        <div className="therapist-students">
            <div className="container">
                <div className="tstu-header">
                    <div className="tstu-header-text">
                        <h1>My Students</h1>
                        <p>View and manage your student roster</p>
                    </div>
                    <div className="tstu-stats">
                        <div className="tstu-stat">
                            <span className="tstu-stat-value">{students.length}</span>
                            <span className="tstu-stat-label">Total</span>
                        </div>
                        <div className="tstu-stat">
                            <span className="tstu-stat-value">{activeCount}</span>
                            <span className="tstu-stat-label">Active</span>
                        </div>
                    </div>
                </div>

                <div className="tstu-toolbar">
                    <div className="tstu-search">
                        <FaSearch className="tstu-search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or school..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-input"
                            aria-label="Search students"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="tstu-search-clear"
                                onClick={() => setSearchQuery('')}
                                aria-label="Clear search"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    <div className="tstu-filters" role="group" aria-label="Filter by status">
                        {STATUS_FILTERS.map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                className={`tstu-filter ${statusFilter === filter.value ? 'is-active' : ''}`}
                                onClick={() => setStatusFilter(filter.value)}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="tstu-result-count">
                    Showing {filteredStudents.length} of {students.length} student
                    {students.length === 1 ? '' : 's'}
                </p>

                {filteredStudents.length === 0 ? (
                    <div className="tstu-empty card">
                        <FaUsers className="tstu-empty-icon" />
                        {students.length === 0 ? (
                            <>
                                <h3>No students yet</h3>
                                <p>Students will appear here once they join the platform.</p>
                            </>
                        ) : (
                            <>
                                <h3>No matching students</h3>
                                <p>Try a different search term or status filter.</p>
                                <button type="button" className="btn btn-outline btn-sm" onClick={resetFilters}>
                                    Clear filters
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="tstu-grid">
                        {filteredStudents.map((student) => (
                            <article key={student.id} className="tstu-card card">
                                <header className="tstu-card-top">
                                    <div className="tstu-avatar">{getInitials(student)}</div>
                                    <div className="tstu-identity">
                                        <h4>{student.first_name} {student.last_name}</h4>
                                        <p className="tstu-email" title={student.email}>{student.email}</p>
                                    </div>
                                    <span className={`tstu-status ${student.is_active ? 'is-active' : 'is-inactive'}`}>
                                        {student.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </header>
                                <div className="tstu-meta">
                                    <span className="tstu-chip">
                                        <FaGraduationCap />
                                        {student.grade_level ? `Grade ${student.grade_level}` : 'Grade not set'}
                                    </span>
                                    <span className="tstu-chip">
                                        <FaSchool />
                                        {student.school_id || 'No school listed'}
                                    </span>
                                </div>
                                <div className="tstu-actions">
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleMessageStudent(student.id)}
                                    >
                                        <FaComments /> Message
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TherapistStudents;
