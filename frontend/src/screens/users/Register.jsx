import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import {
    FaUser, FaEnvelope, FaLock, FaSchool, FaEye, FaEyeSlash,
    FaUserGraduate, FaUserMd, FaUserFriends, FaHeart
} from 'react-icons/fa';
import api from '../../utils/api';
import { registerSchema } from '../../utils/validation';
import { GRADE_LEVELS } from '../../utils/constants';
import './Auth.css';

const ROLE_OPTIONS = [
    { value: 'student', label: 'Student', icon: <FaUserGraduate /> },
    { value: 'therapist', label: 'Therapist', icon: <FaUserMd /> },
    { value: 'parent', label: 'Parent', icon: <FaUserFriends /> }
];

const Register = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: yupResolver(registerSchema),
        defaultValues: {
            role: 'student'
        }
    });

    const role = watch('role');

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            // Backend expects snake_case field names
            const payload = {
                email: data.email,
                password: data.password,
                first_name: data.firstName,
                last_name: data.lastName,
                role: data.role,
                ...(data.role === 'student' && {
                    school_id: data.schoolId,
                    grade_level: data.gradeLevel
                }),
                ...(data.role === 'parent' && data.childEmail && {
                    student_email: data.childEmail
                })
            };
            const response = await api.post('/auth/register', payload);

            if (data.role === 'parent' && data.childEmail && !response.data.child_linked) {
                toast('No student account found with that email yet — you can link your child later from your dashboard.', { icon: 'ℹ️' });
            }

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                toast.success('Registration successful!');
                navigate(`/${response.data.user.role}/dashboard`);
            } else {
                toast.success('Registration successful! Please login.');
                navigate('/login');
            }
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container auth-container-wide">
                <div className="auth-card">
                    <div className="auth-brand">
                        <div className="auth-brand-content">
                            <div className="auth-brand-logo">
                                <FaHeart />
                            </div>
                            <h2>Start Your Wellness Journey</h2>
                            <p>
                                A safe, supportive space for students, parents and
                                therapists to connect and grow together.
                            </p>
                            <ul className="auth-brand-points">
                                <li>Confidential mental health assessments</li>
                                <li>Book sessions with licensed therapists</li>
                                <li>Secure messaging and progress tracking</li>
                            </ul>
                        </div>
                    </div>

                    <div className="auth-body">
                        <div className="auth-header">
                            <h1>Create Account</h1>
                            <p>Join our mental wellness community</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
                            <div className="form-group">
                                <label className="form-label">I am a</label>
                                <div className="register-options">
                                    {ROLE_OPTIONS.map(({ value, label, icon }) => (
                                        <div key={value} className="role-option">
                                            <input
                                                type="radio"
                                                id={`role-${value}`}
                                                value={value}
                                                {...register('role')}
                                            />
                                            <label htmlFor={`role-${value}`}>
                                                <span className="role-icon">{icon}</span>
                                                {label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {errors.role && <span className="form-error">{errors.role.message}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label className="form-label">First Name</label>
                                    <div className="input-group">
                                        <FaUser className="input-icon" />
                                        <input
                                            type="text"
                                            className={`form-input ${errors.firstName ? 'error' : ''}`}
                                            placeholder="First name"
                                            {...register('firstName')}
                                        />
                                    </div>
                                    {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
                                </div>
                                <div className="form-group flex-1">
                                    <label className="form-label">Last Name</label>
                                    <div className="input-group">
                                        <FaUser className="input-icon" />
                                        <input
                                            type="text"
                                            className={`form-input ${errors.lastName ? 'error' : ''}`}
                                            placeholder="Last name"
                                            {...register('lastName')}
                                        />
                                    </div>
                                    {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-group">
                                    <FaEnvelope className="input-icon" />
                                    <input
                                        type="email"
                                        className={`form-input ${errors.email ? 'error' : ''}`}
                                        placeholder="you@example.com"
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && <span className="form-error">{errors.email.message}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label className="form-label">Password</label>
                                    <div className="input-group">
                                        <FaLock className="input-icon" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className={`form-input ${errors.password ? 'error' : ''}`}
                                            placeholder="Min 6 characters"
                                            {...register('password')}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {errors.password && <span className="form-error">{errors.password.message}</span>}
                                </div>
                                <div className="form-group flex-1">
                                    <label className="form-label">Confirm Password</label>
                                    <div className="input-group">
                                        <FaLock className="input-icon" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                            placeholder="Confirm password"
                                            {...register('confirmPassword')}
                                        />
                                    </div>
                                    {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
                                </div>
                            </div>

                            {role === 'student' && (
                                <div className="form-row">
                                    <div className="form-group flex-1">
                                        <label className="form-label">School ID</label>
                                        <div className="input-group">
                                            <FaSchool className="input-icon" />
                                            <input
                                                type="text"
                                                className={`form-input ${errors.schoolId ? 'error' : ''}`}
                                                placeholder="School ID"
                                                {...register('schoolId')}
                                            />
                                        </div>
                                        {errors.schoolId && <span className="form-error">{errors.schoolId.message}</span>}
                                    </div>
                                    <div className="form-group flex-1">
                                        <label className="form-label">Grade Level</label>
                                        <select
                                            className={`form-select ${errors.gradeLevel ? 'error' : ''}`}
                                            {...register('gradeLevel')}
                                        >
                                            <option value="">Select grade</option>
                                            {GRADE_LEVELS.map(grade => (
                                                <option key={grade} value={grade}>Grade {grade}</option>
                                            ))}
                                        </select>
                                        {errors.gradeLevel && <span className="form-error">{errors.gradeLevel.message}</span>}
                                    </div>
                                </div>
                            )}

                            {role === 'parent' && (
                                <div className="form-group">
                                    <label className="form-label">Child's Email <span className="form-optional">(optional)</span></label>
                                    <div className="input-group">
                                        <FaEnvelope className="input-icon" />
                                        <input
                                            type="email"
                                            className={`form-input ${errors.childEmail ? 'error' : ''}`}
                                            placeholder="Your child's account email"
                                            {...register('childEmail')}
                                        />
                                    </div>
                                    {errors.childEmail
                                        ? <span className="form-error">{errors.childEmail.message}</span>
                                        : <span className="form-hint">If your child already has an account, we'll link it to yours. You can also do this later.</span>}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary btn-full btn-lg auth-submit"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>Already have an account? <Link to="/login">Sign in</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
