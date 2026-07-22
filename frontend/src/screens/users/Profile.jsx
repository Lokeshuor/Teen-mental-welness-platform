import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaSchool, FaSave, FaUserMd, FaCertificate, FaBriefcase, FaPoundSign } from 'react-icons/fa';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import { GENDER_OPTIONS, GRADE_LEVELS } from '../../utils/constants';
import './Profile.css';

const Profile = () => {
    const user = getUser();
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const isTherapist = user?.role === 'therapist';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/users/profile');
            setProfileData(response.data);
            reset({
                ...response.data,
                date_of_birth: response.data.date_of_birth ? response.data.date_of_birth.slice(0, 10) : '',
                is_available: Boolean(response.data.is_available)
            });
        } catch (error) {
            console.error('Fetch profile error:', error);
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            // A blank date input is represented as an empty string by the
            // browser. Send NULL explicitly so older API instances also do
            // not attempt to write '' into a MySQL DATE column.
            const payload = {
                ...data,
                date_of_birth: data.date_of_birth || null
            };
            const response = await api.put('/users/profile', payload);
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
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
                                <label className="form-label">First Name <span className="required-indicator">*</span></label>
                                <input
                                    type="text"
                                    className={`form-input ${errors.first_name ? 'error' : ''}`}
                                    {...register('first_name', { required: 'First name is required' })}
                                />
                                {errors.first_name && <span className="form-error">{errors.first_name.message}</span>}
                            </div>
                            <div className="form-group flex-1">
                                <label className="form-label">Last Name <span className="required-indicator">*</span></label>
                                <input
                                    type="text"
                                    className={`form-input ${errors.last_name ? 'error' : ''}`}
                                    {...register('last_name', { required: 'Last name is required' })}
                                />
                                {errors.last_name && <span className="form-error">{errors.last_name.message}</span>}
                            </div>
                        </div>

                        {isTherapist && (
                            <>
                                <div className="profile-section-heading">
                                    <FaUserMd />
                                    <div>
                                        <h2>Professional Details</h2>
                                        <p>These details help students find the right support.</p>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Specialization <span className="required-indicator">*</span></label>
                                    <input
                                        type="text"
                                        className={`form-input ${errors.specialization ? 'error' : ''}`}
                                        placeholder="e.g. Adolescent anxiety, CBT, family therapy"
                                        {...register('specialization', { required: 'Specialization is required' })}
                                    />
                                    {errors.specialization && <span className="form-error">{errors.specialization.message}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Qualifications <span className="required-indicator">*</span></label>
                                    <div className="input-group">
                                        <FaCertificate className="input-icon" />
                                        <input
                                            type="text"
                                            className={`form-input ${errors.qualifications ? 'error' : ''}`}
                                            placeholder="e.g. M.A. Clinical Psychology, Licensed Counselor"
                                            {...register('qualifications', { required: 'Qualifications are required' })}
                                        />
                                    </div>
                                    {errors.qualifications && <span className="form-error">{errors.qualifications.message}</span>}
                                </div>

                                <div className="form-row">
                                    <div className="form-group flex-1">
                                        <label className="form-label">Years of Experience <span className="required-indicator">*</span></label>
                                        <div className="input-group">
                                            <FaBriefcase className="input-icon" />
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                className={`form-input ${errors.experience_years ? 'error' : ''}`}
                                                {...register('experience_years', {
                                                    required: 'Years of experience is required',
                                                    min: { value: 0, message: 'Experience cannot be negative' }
                                                })}
                                            />
                                        </div>
                                        {errors.experience_years && <span className="form-error">{errors.experience_years.message}</span>}
                                    </div>
                                    <div className="form-group flex-1">
                                        <label className="form-label">Consultation Fee (£) <span className="required-indicator">*</span></label>
                                        <div className="input-group">
                                            <FaPoundSign className="input-icon" />
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className={`form-input ${errors.consultation_fee ? 'error' : ''}`}
                                                {...register('consultation_fee', {
                                                    required: 'Consultation fee is required',
                                                    min: { value: 0, message: 'Fee cannot be negative' }
                                                })}
                                            />
                                        </div>
                                        {errors.consultation_fee && <span className="form-error">{errors.consultation_fee.message}</span>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">License Number <span className="required-indicator">*</span></label>
                                    <input
                                        type="text"
                                        className={`form-input ${errors.license_number ? 'error' : ''}`}
                                        placeholder="Your professional license or registration number"
                                        {...register('license_number', { required: 'License number is required' })}
                                    />
                                    {errors.license_number && <span className="form-error">{errors.license_number.message}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Professional Bio <span className="required-indicator">*</span></label>
                                    <textarea
                                        rows="5"
                                        className={`form-input profile-textarea ${errors.bio ? 'error' : ''}`}
                                        placeholder="Briefly introduce your approach and the young people you support."
                                        {...register('bio', {
                                            required: 'Professional bio is required',
                                            maxLength: { value: 2000, message: 'Bio must be 2,000 characters or fewer' }
                                        })}
                                    />
                                    {errors.bio && <span className="form-error">{errors.bio.message}</span>}
                                </div>

                                <label className="availability-toggle">
                                    <input type="checkbox" {...register('is_available')} />
                                    <span>
                                        <strong>Available for new bookings</strong>
                                        <small>Turn this off when you are not accepting new student sessions.</small>
                                    </span>
                                </label>

                                <div className="profile-readonly-stats">
                                    <span>Rating: <strong>{Number(profileData.rating || 0).toFixed(1)} / 5</strong></span>
                                    <span>Completed sessions: <strong>{profileData.total_sessions || 0}</strong></span>
                                </div>
                            </>
                        )}

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
