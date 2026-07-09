import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaSchool } from 'react-icons/fa';
import api from '../../utils/api';
import { registerSchema } from '../../utils/validation';
import { GENDER_OPTIONS, GRADE_LEVELS } from '../../utils/constants';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('student');
    
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
            const { confirmPassword, ...userData } = data;
            const response = await api.post('/auth/register', userData);
            
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
            <div className="auth-container">
                <div className="auth-card card">
                    <div className="auth-header">
                        <h1>Create Account</h1>
                        <p>Join our mental wellness community</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <div className="register-options">
                                {['student', 'therapist', 'parent'].map((roleOption) => (
                                    <div key={roleOption} className="role-option">
                                        <input
                                            type="radio"
                                            id={`role-${roleOption}`}
                                            value={roleOption}
                                            {...register('role')}
                                            onChange={() => setSelectedRole(roleOption)}
                                        />
                                        <label htmlFor={`role-${roleOption}`}>
                                            {roleOption}
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
                                    placeholder="Enter your email"
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
                                        type="password"
                                        className={`form-input ${errors.password ? 'error' : ''}`}
                                        placeholder="Min 6 characters"
                                        {...register('password')}
                                    />
                                </div>
                                {errors.password && <span className="form-error">{errors.password.message}</span>}
                            </div>
                            <div className="form-group flex-1">
                                <label className="form-label">Confirm Password</label>
                                <div className="input-group">
                                    <FaLock className="input-icon" />
                                    <input
                                        type="password"
                                        className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                        placeholder="Confirm password"
                                        {...register('confirmPassword')}
                                    />
                                </div>
                                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
                            </div>
                        </div>

                        {role === 'student' && (
                            <>
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
                                                <option key={grade} value={grade}>{grade}</option>
                                            ))}
                                        </select>
                                        {errors.gradeLevel && <span className="form-error">{errors.gradeLevel.message}</span>}
                                    </div>
                                </div>
                            </>
                        )}

                        <button 
                            type="submit" 
                            className="btn btn-primary btn-full btn-lg"
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
    );
};

export default Register;