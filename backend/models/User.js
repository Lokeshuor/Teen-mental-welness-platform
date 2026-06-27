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
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(updateData[key]);
            }
        });
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
        const [rows] = await pool.query(
            `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active,
                    tp.specialization, tp.qualifications, tp.experience_years,
                    tp.consultation_fee, tp.rating, tp.total_sessions, tp.is_available
             FROM users u
             LEFT JOIN therapist_profiles tp ON u.id = tp.user_id
             WHERE u.role = 'therapist'
             ORDER BY tp.rating DESC`
        );
        return rows;
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
}

module.exports = User;