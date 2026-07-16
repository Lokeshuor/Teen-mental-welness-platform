const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const ParentStudent = require('../models/ParentStudent');
const { JWT_SECRET, JWT_EXPIRE, BCRYPT_ROUNDS } = require('../config/auth');

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            email, password, first_name, last_name, role,
            phone, date_of_birth, gender, school_id, grade_level,
            student_email
        } = req.body;

        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const userId = await User.create({
            email,
            password_hash,
            first_name,
            last_name,
            role,
            phone,
            date_of_birth,
            gender,
            school_id,
            grade_level
        });

        // Link parent to their child if a student email was provided
        let child_linked = false;
        if (role === 'parent' && student_email) {
            const student = await User.findByEmail(student_email);
            if (student && student.role === 'student') {
                await ParentStudent.link(userId, student.id);
                child_linked = true;
            }
        }

        // Generate JWT
        const token = jwt.sign(
            { id: userId, email, role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRE }
        );

        res.status(201).json({
            message: 'User registered successfully',
            child_linked,
            token,
            user: {
                id: userId,
                email,
                first_name,
                last_name,
                role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        await User.update(user.id, { last_login: new Date() });

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRE }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                phone: user.phone,
                school_id: user.school_id,
                grade_level: user.grade_level
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};