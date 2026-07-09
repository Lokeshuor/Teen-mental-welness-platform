import React, { useState, useEffect } from 'react';
import { FaUser, FaCalendarAlt, FaClipboardCheck, FaSearch } from 'react-icons/fa';
import api from '../../utils/api';
import './TherapistStudents.css';

const TherapistStudents = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        filterStudents();
    }, [searchQuery, students]);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/users/students');
            setStudents(response.data || []);
            setFilteredStudents(response.data || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Fetch students error:', error);
            setIsLoading(false);
        }
    };

    const filterStudents = () => {
        if (!searchQuery) {
            setFilteredStudents(students);
            return;
        }
        const query = searchQuery.toLowerCase();
        const filtered = students.filter(s => 
            s.first_name.toLowerCase().includes(query) ||
            s.last_name.toLowerCase().includes(query) ||
            s.email.toLowerCase().includes(query)
        );
        setFilteredStudents(filtered);
    };

    if (isLoading) {
        return (
            <div className="ts-loading">
                <div className="spinner"></div>
                <p>Loading students...</p>
            </div>
        );
    }

    return (
        <div className="therapist-students">
            <div className="container">
                <div className="ts-header">
                    <h1>My Students</h1>
                    <p>View and manage your student roster</p>
                </div>

                <div className="ts-search">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input"
                    />
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="ts-empty card">
                        <p>No students found</p>
                    </div>
                ) : (
                    <div className="ts-grid">
                        {filteredStudents.map((student) => (
                            <div key={student.id} className="ts-card card">
                                <div className="ts-card-avatar">
                                    <FaUser />
                                </div>
                                <div className="ts-card-info">
                                    <h4>{student.first_name} {student.last_name}</h4>
                                    <p className="student-email">{student.email}</p>
                                    <div className="student-details">
                                        <span className="detail">
                                            <FaCalendarAlt /> Grade {student.grade_level}
                                        </span>
                                        <span className="detail">
                                            <FaClipboardCheck /> {student.school_id || 'No School'}
                                        </span>
                                    </div>
                                </div>
                                <div className="ts-card-actions">
                                    <span className={`status ${student.is_active ? 'active' : 'inactive'}`}>
                                        {student.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TherapistStudents;