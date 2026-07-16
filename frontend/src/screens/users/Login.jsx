import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaHeart } from 'react-icons/fa';
import api from '../../utils/api';
import { loginSchema } from '../../utils/validation';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema)
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', data);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            toast.success('Login successful!');

            // Redirect based on role
            switch (user.role) {
                case 'student':
                    navigate('/student/dashboard');
                    break;
                case 'therapist':
                    navigate('/therapist/dashboard');
                    break;
                case 'parent':
                    navigate('/parent/dashboard');
                    break;
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                default:
                    navigate('/');
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
                <div className="auth-card">
                    <div className="auth-brand">
                        <div className="auth-brand-content">
                            <div className="auth-brand-logo">
                                <FaHeart />
                            </div>
                            <h2>Your Mind Matters</h2>
                            <p>
                                Welcome back to your safe space for support,
                                growth and wellbeing.
                            </p>
                            <ul className="auth-brand-points">
                                <li>Track your wellness journey</li>
                                <li>Connect with your therapist</li>
                                <li>Private and confidential</li>
                            </ul>
                        </div>
                    </div>

                    <div className="auth-body">
                        <div className="auth-header">
                            <h1>Welcome Back</h1>
                            <p>Sign in to access your mental wellness dashboard</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
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

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input-group">
                                    <FaLock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className={`form-input ${errors.password ? 'error' : ''}`}
                                        placeholder="Enter your password"
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

                            <button
                                type="submit"
                                className="btn btn-primary btn-full btn-lg auth-submit"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>Don't have an account? <Link to="/register">Sign up</Link></p>
                            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
