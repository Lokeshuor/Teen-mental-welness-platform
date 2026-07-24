import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaUserMd, FaCalendarCheck, FaSearch } from 'react-icons/fa';
import api from '../../utils/api';
import './TherapistList.css';

const TherapistList = () => {
    const navigate = useNavigate();
    const [therapists, setTherapists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState('');

    useEffect(() => {
        fetchTherapists();
    }, []);

    const fetchTherapists = async () => {
        try {
            const response = await api.get('/sessions/therapists');
            setTherapists(response.data || []);
        } catch (error) {
            console.error('Fetch therapists error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const splitSpecializations = (specialization) => (
        String(specialization || '')
            .split(/[,;|]/)
            .map((item) => item.trim())
            .filter(Boolean)
    );

    const specializations = useMemo(() => {
        const specs = new Set();
        therapists.forEach(t => {
            splitSpecializations(t.specialization).forEach((specialization) => specs.add(specialization));
        });
        return Array.from(specs).sort((a, b) => a.localeCompare(b));
    }, [therapists]);

    const filteredTherapists = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return therapists.filter((therapist) => {
            const fullName = `${therapist.first_name || ''} ${therapist.last_name || ''}`.toLowerCase();
            const searchableDetails = [
                therapist.specialization,
                therapist.qualifications,
                therapist.bio
            ].filter(Boolean).join(' ').toLowerCase();
            const matchesSearch = !query || fullName.includes(query) || searchableDetails.includes(query);
            const matchesSpecialization = !specializationFilter || splitSpecializations(therapist.specialization)
                .some((specialization) => specialization.toLowerCase() === specializationFilter.toLowerCase());
            const isAvailable = Boolean(Number(therapist.is_available));
            const matchesAvailability = !availabilityFilter || (
                availabilityFilter === 'available' ? isAvailable : !isAvailable
            );

            return matchesSearch && matchesSpecialization && matchesAvailability;
        });
    }, [therapists, searchQuery, specializationFilter, availabilityFilter]);

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
                    <select
                        className="form-select"
                        value={availabilityFilter}
                        onChange={(e) => setAvailabilityFilter(e.target.value)}
                        aria-label="Filter therapists by availability"
                    >
                        <option value="">All Availability</option>
                        <option value="available">Available to book</option>
                        <option value="unavailable">Unavailable</option>
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
                                    {therapist.qualifications && (
                                        <p className="therapist-detail"><strong>Qualifications:</strong> {therapist.qualifications}</p>
                                    )}
                                    <div className="therapist-stats">
                                        <span className="rating">
                                            <FaStar className="star-icon" />
                                            {therapist.rating || 0} / 5
                                        </span>
                                        <span className="experience">
                                            🎓 {therapist.experience_years || 0} years
                                        </span>
                                        <span className="fee">
                                            £{Number(therapist.consultation_fee || 0).toFixed(2)} / session
                                        </span>
                                        <span>Completed sessions: {therapist.total_sessions || 0}</span>
                                    </div>
                                    {therapist.license_number && (
                                        <p className="therapist-detail"><strong>Registration:</strong> {therapist.license_number}</p>
                                    )}
                                    {therapist.bio && <p className="therapist-bio">{therapist.bio}</p>}
                                    <div className="availability-status">
                                        {Boolean(Number(therapist.is_available)) ? (
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
                                        disabled={!Boolean(Number(therapist.is_available))}
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
