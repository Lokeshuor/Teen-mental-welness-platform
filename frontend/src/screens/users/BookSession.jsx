import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaClock, FaVideo, FaUserMd } from 'react-icons/fa';
import { format, addDays, isWeekend } from 'date-fns';
import api from '../../utils/api';
import { sessionBookingSchema, TIME_SLOTS } from '../../utils/validation';
import './BookSession.css';

const BookSession = () => {
    const { therapistId } = useParams();
    const navigate = useNavigate();
    const [therapists, setTherapists] = useState([]);
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch } = useForm({
        resolver: yupResolver(sessionBookingSchema),
        defaultValues: {
            therapistId: therapistId ? parseInt(therapistId) : '',
            sessionType: 'online'
        }
    });

    const watchTherapistId = watch('therapistId');

    useEffect(() => {
        fetchTherapists();
    }, []);

    useEffect(() => {
        if (watchTherapistId) {
            const therapist = therapists.find(t => t.id === parseInt(watchTherapistId));
            setSelectedTherapist(therapist);
        }
    }, [watchTherapistId, therapists]);

    useEffect(() => {
        if (selectedTherapist && selectedDate) {
            fetchAvailability();
        }
    }, [selectedTherapist, selectedDate]);

    const fetchTherapists = async () => {
        try {
            const response = await api.get('/sessions/therapists');
            setTherapists(response.data || []);
            if (therapistId) {
                const found = response.data.find(t => t.id === parseInt(therapistId));
                if (found) setSelectedTherapist(found);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Fetch therapists error:', error);
            setIsLoading(false);
        }
    };

    const fetchAvailability = async () => {
        try {
            const response = await api.get(`/sessions/availability/${selectedTherapist.id}`, {
                params: { date: selectedDate }
            });
            setAvailableSlots(response.data || []);
        } catch (error) {
            console.error('Fetch availability error:', error);
            setAvailableSlots([]);
        }
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        setSelectedTime('');
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
    };

    const generateDateOptions = () => {
        const options = [];
        const today = new Date();
        for (let i = 1; i <= 14; i++) {
            const date = addDays(today, i);
            if (isWeekend(date)) continue;
            options.push({
                value: format(date, 'yyyy-MM-dd'),
                label: format(date, 'EEE, MMM dd')
            });
        }
        return options;
    };

    const onSubmit = async (data) => {
        if (!selectedDate || !selectedTime) {
            toast.error('Please select a date and time');
            return;
        }

        setIsBooking(true);
        try {
            const bookingData = {
                therapist_id: parseInt(data.therapistId),
                session_date: selectedDate,
                start_time: selectedTime,
                end_time: formatTime(selectedTime, 60),
                session_type: data.sessionType
            };

            const response = await api.post('/sessions/book', bookingData);
            toast.success('Session booked successfully!');
            navigate('/student/sessions');
        } catch (error) {
            console.error('Book session error:', error);
            if (error.response?.status === 409) {
                toast.error('This time slot is already booked. Please select another time.');
                fetchAvailability();
            }
        } finally {
            setIsBooking(false);
        }
    };

    const formatTime = (time, minutes) => {
        const [hours, mins] = time.split(':').map(Number);
        const totalMinutes = hours * 60 + mins + minutes;
        const newHours = Math.floor(totalMinutes / 60);
        const newMins = totalMinutes % 60;
        return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="booking-loading">
                <div className="spinner"></div>
                <p>Loading available therapists...</p>
            </div>
        );
    }

    return (
        <div className="book-session-page">
            <div className="container">
                <div className="booking-header">
                    <h1>Book a Therapy Session</h1>
                    <p>Connect with a qualified therapist for professional support</p>
                </div>

                <div className="booking-card card">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Step 1: Select Therapist */}
                        <div className="booking-step">
                            <h3>
                                <span className="step-number">1</span>
                                Select a Therapist
                            </h3>
                            <div className="form-group">
                                <select
                                    className={`form-select ${errors.therapistId ? 'error' : ''}`}
                                    {...register('therapistId')}
                                >
                                    <option value="">Choose a therapist...</option>
                                    {therapists.map(therapist => (
                                        <option key={therapist.id} value={therapist.id}>
                                            {therapist.first_name} {therapist.last_name} - {therapist.specialization || 'General'}
                                        </option>
                                    ))}
                                </select>
                                {errors.therapistId && <span className="form-error">{errors.therapistId.message}</span>}
                            </div>

                            {selectedTherapist && (
                                <div className="therapist-preview">
                                    <div className="therapist-info">
                                        <h4>{selectedTherapist.first_name} {selectedTherapist.last_name}</h4>
                                        <p>{selectedTherapist.specialization || 'General Therapist'}</p>
                                        <div className="therapist-details">
                                            <span>⭐ {selectedTherapist.rating || 0} / 5</span>
                                            <span>🎓 {selectedTherapist.experience_years || 0} years</span>
                                            <span>💰 ${selectedTherapist.consultation_fee || 0}/session</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Step 2: Select Date and Time */}
                        <div className="booking-step">
                            <h3>
                                <span className="step-number">2</span>
                                Choose Date & Time
                            </h3>
                            
                            <div className="form-group">
                                <label className="form-label">Select Date</label>
                                <select
                                    className="form-select"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    disabled={!selectedTherapist}
                                >
                                    <option value="">Choose a date...</option>
                                    {generateDateOptions().map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedDate && (
                                <div className="time-slots">
                                    <label className="form-label">Available Times</label>
                                    {availableSlots.length > 0 ? (
                                        <div className="time-grid">
                                            {availableSlots.map((slot, index) => {
                                                const time = slot.start_time;
                                                const isSelected = selectedTime === time;
                                                return (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        className={`time-slot ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => handleTimeSelect(time)}
                                                    >
                                                        <FaClock /> {time}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="no-slots">No available slots for this date</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Step 3: Session Type */}
                        <div className="booking-step">
                            <h3>
                                <span className="step-number">3</span>
                                Session Preferences
                            </h3>
                            <div className="form-group">
                                <label className="form-label">Session Type</label>
                                <div className="session-type-options">
                                    <label className="session-type-label">
                                        <input
                                            type="radio"
                                            value="online"
                                            {...register('sessionType')}
                                        />
                                        <FaVideo /> Online
                                    </label>
                                    <label className="session-type-label">
                                        <input
                                            type="radio"
                                            value="in-person"
                                            {...register('sessionType')}
                                        />
                                        In Person
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="booking-actions">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => navigate('/student/therapists')}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={isBooking || !selectedTherapist || !selectedDate || !selectedTime}
                            >
                                {isBooking ? 'Booking...' : 'Book Session'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookSession;