import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaClock } from 'react-icons/fa';
import api from '../../utils/api';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../../utils/constants';
import './AvailabilityManager.css';

const AvailabilityManager = () => {
    const [availability, setAvailability] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const response = await api.get('/sessions/availability/current');
            setAvailability(response.data || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Fetch availability error:', error);
            setIsLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            await api.post('/sessions/availability', data);
            toast.success('Availability added successfully');
            reset();
            setIsAdding(false);
            fetchAvailability();
        } catch (error) {
            console.error('Add availability error:', error);
            toast.error('Failed to add availability');
        }
    };

    const deleteAvailability = async (id) => {
        if (!window.confirm('Are you sure you want to remove this availability?')) return;
        
        try {
            await api.delete(`/sessions/availability/${id}`);
            toast.success('Availability removed');
            fetchAvailability();
        } catch (error) {
            console.error('Delete availability error:', error);
            toast.error('Failed to remove availability');
        }
    };

    const getDayName = (day) => {
        return DAYS_OF_WEEK[day] || 'Unknown';
    };

    if (isLoading) {
        return (
            <div className="am-loading">
                <div className="spinner"></div>
                <p>Loading availability...</p>
            </div>
        );
    }

    return (
        <div className="availability-manager">
            <div className="container">
                <div className="am-header">
                    <h1>Manage Availability</h1>
                    <p>Set your working hours for students to book sessions</p>
                </div>

                <div className="am-actions">
                    <button 
                        className="btn btn-primary"
                        onClick={() => setIsAdding(!isAdding)}
                    >
                        <FaPlus /> {isAdding ? 'Cancel' : 'Add Availability'}
                    </button>
                </div>

                {isAdding && (
                    <div className="am-form card">
                        <h3>Add New Availability Slot</h3>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Day</label>
                                    <select
                                        className={`form-select ${errors.day_of_week ? 'error' : ''}`}
                                        {...register('day_of_week', { required: 'Day is required' })}
                                    >
                                        <option value="">Select day</option>
                                        {DAYS_OF_WEEK.map((day, index) => (
                                            <option key={index} value={index}>{day}</option>
                                        ))}
                                    </select>
                                    {errors.day_of_week && <span className="form-error">{errors.day_of_week.message}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Start Time</label>
                                    <select
                                        className={`form-select ${errors.start_time ? 'error' : ''}`}
                                        {...register('start_time', { required: 'Start time is required' })}
                                    >
                                        <option value="">Select time</option>
                                        {TIME_SLOTS.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                    {errors.start_time && <span className="form-error">{errors.start_time.message}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Time</label>
                                    <select
                                        className={`form-select ${errors.end_time ? 'error' : ''}`}
                                        {...register('end_time', { required: 'End time is required' })}
                                    >
                                        <option value="">Select time</option>
                                        {TIME_SLOTS.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                    {errors.end_time && <span className="form-error">{errors.end_time.message}</span>}
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-success">
                                    <FaPlus /> Add Slot
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {availability.length === 0 ? (
                    <div className="am-empty card">
                        <p>No availability set. Add your working hours above.</p>
                    </div>
                ) : (
                    <div className="am-list">
                        {availability.map((slot) => (
                            <div key={slot.id} className="am-item card">
                                <div className="am-item-info">
                                    <span className="am-day">{getDayName(slot.day_of_week)}</span>
                                    <span className="am-time">
                                        <FaClock /> {slot.start_time} - {slot.end_time}
                                    </span>
                                    <span className={`am-status ${slot.is_booked ? 'booked' : 'available'}`}>
                                        {slot.is_booked ? 'Booked' : 'Available'}
                                    </span>
                                </div>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => deleteAvailability(slot.id)}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvailabilityManager;