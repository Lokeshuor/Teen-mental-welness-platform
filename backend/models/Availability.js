const pool = require('../config/database');

class Availability {
    static async create(availabilityData) {
        const {
            therapist_id, day_of_week, start_time, end_time,
            is_recurring, specific_date
        } = availabilityData;

        const [result] = await pool.query(
            `INSERT INTO therapist_availability 
            (therapist_id, day_of_week, start_time, end_time, is_recurring, specific_date) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [therapist_id, day_of_week, start_time, end_time, is_recurring, specific_date]
        );
        return result.insertId;
    }

    static async getByTherapistId(therapistId) {
        const [rows] = await pool.query(
            `SELECT * FROM therapist_availability 
             WHERE therapist_id = ? 
             ORDER BY day_of_week, start_time`,
            [therapistId]
        );
        return rows;
    }

    static async getAvailableSlots(therapistId, date) {
        const dayOfWeek = new Date(date).getDay();
        const [rows] = await pool.query(
            `SELECT * FROM therapist_availability 
             WHERE therapist_id = ? 
               AND ((is_recurring = TRUE AND day_of_week = ?) 
                    OR (is_recurring = FALSE AND specific_date = ?))
               AND is_booked = FALSE`,
            [therapistId, dayOfWeek, date]
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM therapist_availability WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async delete(id) {
        const [result] = await pool.query(
            'DELETE FROM therapist_availability WHERE id = ?',
            [id]
        );
        return result;
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
            `UPDATE therapist_availability SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result;
    }
}

module.exports = Availability;