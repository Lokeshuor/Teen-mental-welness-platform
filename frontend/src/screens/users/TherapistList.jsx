import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaUserMd, FaCalendarCheck, FaSearch } from 'react-icons/fa';
import api from '../../utils/api';
import './TherapistList.css';

const TherapistList = () => {
    const navigate = useNavigate();
    const [therapists, setTherapists] = useState([]);
    const [filteredTherapists, setFilteredTherapists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState('');

    useEffect(() => {
        fetchTherapists();
    }, []);

    useEffect(() => {
        filterTherapists();
    }, [searchQuery, specializationFilter, therapists]);

    const fetchTherapists = async () => {
        try {
            const response = await api.get('/sessions/therapists');
            setTherapists(response.data || []);
            setFilteredTherapists(response.data || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Fetch therapists error:', error);
            setIsLoading(false);
        }
    };

    const filterTherapists = () => {
        let filtered = therapists;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t => 
                t.first_name.toLowerCase().includes(query) ||
                t.last_name.toLowerCase().includes(query) ||
                (t.specialization && t.specialization.toLowerCase().includes(query))
            );
        }

        if (specializationFilter) {
            filtered = filtered.filter(t => 
                t.specialization && t.specialization.toLowerCase().includes(specializationFilter.toLowerCase())
            );
        }

        setFilteredTherapists(filtered);
    };

    const getUniqueSpecializations = () => {
        const specs = new Set();
        therapists.forEach(t => {
            if (t.specialization) {
                t.specialization.split(',').forEach(s => {
                    specs.add(s.trim());
                });
            }
        });
        return Array.from(specs);
    };

    const handleBookSession = (therapistId) => {
        navigate(`/student/book-session/${therapistId}`);
    };

    if (isLoading) {
        return (
            <div className="therapists-loading">
                <div className="spinner"></div>
                <p>Loading therapists...</p>
            </div>
        );
    }

    const specializations = getUniqueSpecializations();

    return (
        <div className="therapists-page">
            <div className="container">
                <div className="therapists-header">
                    <h1>Find a Therapist</h1>
                    <p>Browse our qualified therapists and book a session</p>
                </div>

                <div className="therapists-filters">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name or specialization..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <select
                        className="form-select"
                        value={specializationFilter}
                        onChange={(e) => setSpecializationFilter(e.target.value)}
                    >
                        <option value="">All Specializations</option>
                        {specializations.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                </div>

                {filteredTherapists.length === 0 ? (
                    <div className="no-therapists card">
                        <p>No therapists found matching your criteria</p>
                    </div>
                ) : (
                    <div className="therapists-grid">
                        {filteredTherapists.map((therapist) => (
                            <div key={therapist.id} className="therapist-card card">
                                <div className="therapist-avatar">
                                    <FaUserMd />
                                </div>
                                <div className="therapist-info">
                                    <h3>{therapist.first_name} {therapist.last_name}</h3>
                                    <p className="specialization">
                                        {therapist.specialization || 'General Therapist'}
                                    </p>
                                    <div className="therapist-stats">
                                        <span className="rating">
                                            <FaStar className="star-icon" />
                                            {therapist.rating || 0} / 5
                                        </span>
                                        <span className="experience">
                                            🎓 {therapist.experience_years || 0} years
                                        </span>
                                        <span className="fee">
                                            💰 ${therapist.consultation_fee || 0}/session
                                        </span>
                                    </div>
                                    <div className="availability-status">
                                        {therapist.is_available ? (
                                            <span className="available">✅ Available</span>
                                        ) : (
                                            <span className="unavailable">❌ Unavailable</span>
                                        )}
                                    </div>
                                </div>
                                <div className="therapist-actions">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleBookSession(therapist.id)}
                                        disabled={!therapist.is_available}
                                    >
                                        <FaCalendarCheck /> Book Session
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TherapistList;