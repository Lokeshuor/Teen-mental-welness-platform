import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaSchool, FaSave } from 'react-icons/fa';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import { GENDER_OPTIONS, GRADE_LEVELS } from '../../utils/constants';
import './Profile.css';

const Profile = () => {
    const user = getUser();
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/users/profile');
            setProfileData(response.data);
            reset(response.data);
        } catch (error) {
            console.error('Fetch profile error:', error);
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await api.put('/users/profile', data);
            setProfileData(response.data.user);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Update profile error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!profileData) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-header">
                    <h1>My Profile</h1>
                    <p>Manage your personal information and preferences</p>
                </div>

                <div className="profile-content card">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="profile-avatar-section">
                            <div className="profile-avatar">
                                {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </div>
                            <div className="profile-role">
                                <span className="badge badge-primary">{user?.role}</span>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    className={`form-input ${errors.first_name ? 'error' : ''}`}
                                    {...register('first_name')}
                                />
                                {errors.first_name && <span className="form-error">{errors.first_name.message}</span>}
                            </div>
                            <div className="form-group flex-1">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    className={`form-input ${errors.last_name ? 'error' : ''}`}
                                    {...register('last_name')}
                                />
                                {errors.last_name && <span className="form-error">{errors.last_name.message}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div className="input-group">
                                <FaEnvelope className="input-icon" />
                                <input
                                    type="email"
                                    className="form-input"
                                    value={profileData.email}
                                    disabled
                                />
                            </div>
                            <span className="form-hint">Email cannot be changed</span>
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label className="form-label">Phone</label>
                                <div className="input-group">
                                    <FaPhone className="input-icon" />
                                    <input
                                        type="tel"
                                        className={`form-input ${errors.phone ? 'error' : ''}`}
                                        {...register('phone')}
                                    />
                                </div>
                                {errors.phone && <span className="form-error">{errors.phone.message}</span>}
                            </div>
                            <div className="form-group flex-1">
                                <label className="form-label">Date of Birth</label>
                                <div className="input-group">
                                    <FaCalendar className="input-icon" />
                                    <input
                                        type="date"
                                        className={`form-input ${errors.date_of_birth ? 'error' : ''}`}
                                        {...register('date_of_birth')}
                                    />
                                </div>
                                {errors.date_of_birth && <span className="form-error">{errors.date_of_birth.message}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label className="form-label">Gender</label>
                                <select
                                    className={`form-select ${errors.gender ? 'error' : ''}`}
                                    {...register('gender')}
                                >
                                    <option value="">Select gender</option>
                                    {GENDER_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.gender && <span className="form-error">{errors.gender.message}</span>}
                            </div>
                            {user?.role === 'student' && (
                                <div className="form-group flex-1">
                                    <label className="form-label">Grade Level</label>
                                    <select
                                        className={`form-select ${errors.grade_level ? 'error' : ''}`}
                                        {...register('grade_level')}
                                    >
                                        <option value="">Select grade</option>
                                        {GRADE_LEVELS.map(grade => (
                                            <option key={grade} value={grade}>{grade}</option>
                                        ))}
                                    </select>
                                    {errors.grade_level && <span className="form-error">{errors.grade_level.message}</span>}
                                </div>
                            )}
                        </div>

                        {user?.role === 'student' && (
                            <div className="form-group">
                                <label className="form-label">School ID</label>
                                <div className="input-group">
                                    <FaSchool className="input-icon" />
                                    <input
                                        type="text"
                                        className={`form-input ${errors.school_id ? 'error' : ''}`}
                                        {...register('school_id')}
                                    />
                                </div>
                                {errors.school_id && <span className="form-error">{errors.school_id.message}</span>}
                            </div>
                        )}

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={isLoading}
                            >
                                <FaSave /> {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;