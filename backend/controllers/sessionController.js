const Session = require('../models/Session');
const Availability = require('../models/Availability');
const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.getAvailableTherapists = async (req, res) => {
    try {
        const therapists = await User.getAllTherapists();
        res.json(therapists);
    } catch (error) {
        console.error('Get therapists error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTherapistAvailability = async (req, res) => {
    try {
        const { therapistId } = req.params;
        const { date } = req.query;

        const slots = await Availability.getAvailableSlots(therapistId, date);
        res.json(slots);
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyAvailability = async (req, res) => {
    try {
        const slots = await Availability.getByTherapistId(req.user.id);
        res.json(slots);
    } catch (error) {
        console.error('Get my availability error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addAvailability = async (req, res) => {
    try {
        const { day_of_week, start_time, end_time, is_recurring, specific_date } = req.body;

        if (day_of_week === undefined || !start_time || !end_time) {
            return res.status(400).json({ message: 'Day, start time and end time are required' });
        }

        const existing = await Availability.getByTherapistId(req.user.id);
        const duplicate = existing.some(slot =>
            slot.day_of_week === parseInt(day_of_week) &&
            slot.start_time.slice(0, 5) === start_time.slice(0, 5) &&
            String(slot.specific_date || '') === String(specific_date || '')
        );
        if (duplicate) {
            return res.status(409).json({ message: 'This availability slot already exists' });
        }

        const availabilityId = await Availability.create({
            therapist_id: req.user.id,
            day_of_week: parseInt(day_of_week),
            start_time,
            end_time,
            is_recurring: is_recurring !== undefined ? is_recurring : true,
            specific_date: specific_date || null
        });

        res.status(201).json({
            message: 'Availability added successfully',
            id: availabilityId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'This availability slot already exists' });
        }
        console.error('Add availability error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const slot = await Availability.getById(id);

        if (!slot) {
            return res.status(404).json({ message: 'Availability not found' });
        }
        if (req.user.role !== 'admin' && slot.therapist_id !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Availability.delete(id);
        res.json({ message: 'Availability removed successfully' });
    } catch (error) {
        console.error('Delete availability error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.bookSession = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            therapist_id, session_date, start_time, end_time, session_type
        } = req.body;
        const student_id = req.user.id;

        // Check if therapist exists
        const therapist = await User.getTherapistById(therapist_id);
        if (!therapist) {
            return res.status(404).json({ message: 'Therapist not found' });
        }

        // Check availability
        const isAvailable = await Session.checkAvailability(therapist_id, session_date, start_time);
        if (!isAvailable) {
            return res.status(409).json({ message: 'This time slot is already booked' });
        }

        // Create session
        const sessionId = await Session.create({
            student_id,
            therapist_id,
            session_date,
            start_time,
            end_time,
            session_type: session_type || 'online',
            meeting_link: session_type === 'online' ? `https://meet.teenwellness.com/${Date.now()}` : null
        });

        const session = await Session.getById(sessionId);
        res.status(201).json({
            message: 'Session booked successfully',
            session
        });
    } catch (error) {
        console.error('Book session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStudentSessions = async (req, res) => {
    try {
        const sessions = await Session.getByStudentId(req.user.id);
        res.json(sessions);
    } catch (error) {
        console.error('Get student sessions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTherapistSessions = async (req, res) => {
    try {
        if (req.user.role !== 'therapist') {
            return res.status(403).json({ message: 'Only therapists can access this' });
        }
        const sessions = await Session.getByTherapistId(req.user.id);
        res.json(sessions);
    } catch (error) {
        console.error('Get therapist sessions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUpcomingSessions = async (req, res) => {
    try {
        let sessions;
        if (req.user.role === 'therapist') {
            sessions = await Session.getUpcomingByTherapistId(req.user.id);
        } else {
            sessions = await Session.getUpcomingByStudentId(req.user.id);
        }
        res.json(sessions);
    } catch (error) {
        console.error('Get upcoming sessions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateSessionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const session = await Session.getById(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && 
            req.user.id !== session.student_id && 
            req.user.id !== session.therapist_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Session.updateStatus(id, status, notes);
        const updatedSession = await Session.getById(id);
        res.json({
            message: 'Session updated successfully',
            session: updatedSession
        });
    } catch (error) {
        console.error('Update session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.cancelSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const session = await Session.getById(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && 
            req.user.id !== session.student_id && 
            req.user.id !== session.therapist_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Session.cancelSession(id, reason || 'Cancelled by user');
        const updatedSession = await Session.getById(id);
        res.json({
            message: 'Session cancelled successfully',
            session: updatedSession
        });
    } catch (error) {
        console.error('Cancel session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};