const pool = require('../config/database');

class User {
    static async create(userData) {
        const {
            email, password_hash, first_name, last_name, role,
            phone, date_of_birth, gender, school_id, grade_level,
            emergency_contact_name, emergency_contact_phone
        } = userData;

        const [result] = await pool.query(
            `INSERT INTO users 
            (email, password_hash, first_name, last_name, role, phone, 
             date_of_birth, gender, school_id, grade_level, 
             emergency_contact_name, emergency_contact_phone) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [email, password_hash, first_name, last_name, role, phone,
             date_of_birth, gender, school_id, grade_level,
             emergency_contact_name, emergency_contact_phone]
        );
        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT id, email, first_name, last_name, role, phone, date_of_birth, gender, school_id, grade_level, emergency_contact_name, emergency_contact_phone, is_active, last_login, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async update(id, updateData) {
        const fields = [];
        const values = [];
        const nullableFields = new Set([
            'phone', 'date_of_birth', 'gender', 'school_id', 'grade_level',
            'emergency_contact_name', 'emergency_contact_phone'
        ]);
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                fields.push(`${key} = ?`);
                // Keep database writes safe even if another controller sends
                // an empty HTML form value directly to this model.
                values.push(nullableFields.has(key) && updateData[key] === '' ? null : updateData[key]);
            }
        });
        if (fields.length === 0) {
            return { affectedRows: 0 };
        }
        values.push(id);
        const [result] = await pool.query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result;
    }

    static async delete(id) {
        const [result] = await pool.query(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        return result;
    }

    static async getAllStudents() {
        const [rows] = await pool.query(
            `SELECT id, email, first_name, last_name, grade_level, school_id, 
                    is_active, created_at 
             FROM users 
             WHERE role = 'student' 
             ORDER BY created_at DESC`
        );
        return rows;
    }

    static async getAllTherapists() {
        // Therapists without a profile row still count as available so they
        // remain bookable; COALESCE keeps NULLs from reading as "unavailable".
        const [rows] = await pool.query(
            `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active,
                    tp.specialization, tp.qualifications, tp.experience_years,
                    tp.license_number, tp.bio, tp.consultation_fee,
                    COALESCE(tp.rating, 0) AS rating,
                    COALESCE(tp.total_sessions, 0) AS total_sessions,
                    COALESCE(tp.is_available, TRUE) AS is_available
             FROM users u
             LEFT JOIN therapist_profiles tp ON u.id = tp.user_id
             WHERE u.role = 'therapist' AND u.is_active = TRUE
             ORDER BY rating DESC`
        );
        return rows;
    }

    static async createTherapistProfile(userId) {
        const [result] = await pool.query(
            `INSERT INTO therapist_profiles (user_id, is_available)
             VALUES (?, TRUE)`,
            [userId]
        );
        return result.insertId;
    }

    static async getTherapistById(id) {
        const [rows] = await pool.query(
            `SELECT u.id, u.email, u.first_name, u.last_name, u.phone,
                    tp.*
             FROM users u
             LEFT JOIN therapist_profiles tp ON u.id = tp.user_id
             WHERE u.id = ? AND u.role = 'therapist'`,
            [id]
        );
        return rows[0];
    }

    static async getTherapistProfile(userId) {
        const [rows] = await pool.query(
            `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.phone,
                    u.date_of_birth, u.gender, u.emergency_contact_name,
                    u.emergency_contact_phone, tp.specialization, tp.qualifications,
                    tp.experience_years, tp.license_number, tp.bio,
                    tp.consultation_fee, tp.rating, tp.total_sessions, tp.is_available
             FROM users u
             LEFT JOIN therapist_profiles tp ON tp.user_id = u.id
             WHERE u.id = ? AND u.role = 'therapist'`,
            [userId]
        );
        return rows[0];
    }

    static async updateTherapistProfile(userId, profileData) {
        const [existing] = await pool.query(
            'SELECT id FROM therapist_profiles WHERE user_id = ?',
            [userId]
        );

        if (!existing.length) {
            await this.createTherapistProfile(userId);
        }

        const allowedFields = [
            'specialization', 'qualifications', 'experience_years',
            'license_number', 'bio', 'consultation_fee', 'is_available'
        ];
        const fields = [];
        const values = [];

        allowedFields.forEach((field) => {
            if (profileData[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(profileData[field]);
            }
        });

        if (fields.length) {
            values.push(userId);
            await pool.query(
                `UPDATE therapist_profiles SET ${fields.join(', ')} WHERE user_id = ?`,
                values
            );
        }
    }
}

module.exports = User;
