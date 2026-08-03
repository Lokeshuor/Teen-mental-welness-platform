const User = require('../models/User');
const Assessment = require('../models/Assessment');
const ParentStudent = require('../models/ParentStudent');

exports.getMyChildren = async (req, res) => {
    try {
        const children = await ParentStudent.getChildren(req.user.id);
        res.json(children);
    } catch (error) {
        console.error('Get my children error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getChildrenSessions = async (req, res) => {
    try {
        const rawChildId = req.query.childId;
        let childId = null;
        if (rawChildId) {
            const parsed = Number.parseInt(rawChildId, 10);
            if (!Number.isInteger(parsed) || parsed < 1) {
                return res.status(400).json({ message: 'Invalid child id' });
            }
            // Only children actually linked to this parent are readable.
            if (!(await ParentStudent.exists(req.user.id, parsed))) {
                return res.status(403).json({ message: 'This child is not linked to your account' });
            }
            childId = parsed;
        }

        const parsedLimit = Number.parseInt(req.query.limit, 10);
        const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
            ? Math.min(parsedLimit, 100)
            : 50;

        const sessions = await ParentStudent.getChildrenSessions(req.user.id, { childId, limit });
        res.json(sessions);
    } catch (error) {
        console.error('Get children sessions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.linkChild = async (req, res) => {
    try {
        const { student_email } = req.body;
        if (!student_email) {
            return res.status(400).json({ message: "Please provide your child's email address" });
        }

        const student = await User.findByEmail(student_email);
        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: 'No student account found with that email' });
        }

        if (await ParentStudent.exists(req.user.id, student.id)) {
            return res.status(400).json({ message: 'This child is already linked to your account' });
        }

        await ParentStudent.link(req.user.id, student.id);
        res.status(201).json({
            message: `${student.first_name} ${student.last_name} linked to your account`,
            child: {
                id: student.id,
                first_name: student.first_name,
                last_name: student.last_name,
                grade_level: student.grade_level,
                school_id: student.school_id
            }
        });
    } catch (error) {
        console.error('Link child error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.unlinkChild = async (req, res) => {
    try {
        const removed = await ParentStudent.unlink(req.user.id, req.params.studentId);
        if (!removed) {
            return res.status(404).json({ message: 'This child is not linked to your account' });
        }
        res.json({ message: 'Child unlinked from your account' });
    } catch (error) {
        console.error('Unlink child error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = req.user.role === 'therapist'
            ? await User.getTherapistProfile(req.user.id)
            : await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const {
            first_name, last_name, phone, date_of_birth, gender, school_id, grade_level,
            emergency_contact_name, emergency_contact_phone, specialization,
            qualifications, experience_years, license_number, bio, consultation_fee,
            is_available
        } = req.body;
        // HTML forms submit unfilled optional inputs as empty strings. MySQL
        // accepts NULL for these columns, but rejects '' for DATE and ENUMs.
        const nullIfBlank = (value) => (
            typeof value === 'string' && value.trim() === '' ? null : value
        );

        if (!first_name?.trim() || !last_name?.trim()) {
            return res.status(400).json({ message: 'First name and last name are required' });
        }

        if (req.user.role === 'therapist') {
            const requiredProfessionalFields = {
                specialization: 'Specialization',
                qualifications: 'Qualifications',
                experience_years: 'Years of experience',
                license_number: 'License number',
                bio: 'Professional bio',
                consultation_fee: 'Consultation fee'
            };
            const missingField = Object.entries(requiredProfessionalFields)
                .find(([field]) => req.body[field] === undefined || req.body[field] === null || String(req.body[field]).trim() === '');

            if (missingField) {
                return res.status(400).json({ message: `${missingField[1]} is required for a therapist profile` });
            }

            if (Number(experience_years) < 0 || Number(consultation_fee) < 0) {
                return res.status(400).json({ message: 'Experience and consultation fee cannot be negative' });
            }
        }
        
        await User.update(req.user.id, {
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            phone: nullIfBlank(phone),
            date_of_birth: nullIfBlank(date_of_birth),
            gender: nullIfBlank(gender),
            school_id: nullIfBlank(school_id),
            grade_level: nullIfBlank(grade_level),
            emergency_contact_name: nullIfBlank(emergency_contact_name),
            emergency_contact_phone: nullIfBlank(emergency_contact_phone)
        });

        if (req.user.role === 'therapist') {
            await User.updateTherapistProfile(req.user.id, {
                specialization: specialization?.trim(),
                qualifications: qualifications?.trim(),
                experience_years: Number(experience_years),
                license_number: license_number?.trim(),
                bio: bio?.trim(),
                consultation_fee: Number(consultation_fee),
                is_available: is_available ? 1 : 0
            });
        }

        const user = req.user.role === 'therapist'
            ? await User.getTherapistProfile(req.user.id)
            : await User.findById(req.user.id);
        res.json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStudents = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'therapist') {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const students = await User.getAllStudents();
        res.json(students);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStudentDetail = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'therapist') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const { id } = req.params;
        const student = await User.findById(id);
        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: 'Student not found' });
        }

        const assessments = await Assessment.getByStudentId(id);
        res.json({
            student,
            assessments
        });
    } catch (error) {
        console.error('Get student detail error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTherapists = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const therapists = await User.getAllTherapists();
        res.json(therapists);
    } catch (error) {
        console.error('Get therapists error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.update(id, { is_active: is_active ? 1 : 0 });
        res.json({ message: `User ${is_active ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.delete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
