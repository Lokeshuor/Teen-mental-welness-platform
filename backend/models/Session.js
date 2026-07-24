const pool = require('../config/database');

class Session {
    static async ensureRatingsTable() {
        await pool.query(
            `CREATE TABLE IF NOT EXISTS session_ratings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_id INT NOT NULL,
                student_id INT NOT NULL,
                therapist_id INT NOT NULL,
                rating TINYINT NOT NULL,
                feedback TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_session_rating (session_id),
                INDEX idx_rating_therapist (therapist_id)
            )`
        );
    }

    static async create(sessionData) {
        const {
            student_id, therapist_id, session_date, start_time,
            end_time, session_type, meeting_link
        } = sessionData;

        const [result] = await pool.query(
            `INSERT INTO sessions 
            (student_id, therapist_id, session_date, start_time, end_time, session_type, meeting_link) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [student_id, therapist_id, session_date, start_time, end_time, session_type, meeting_link]
        );
        return result.insertId;
    }

    static async getById(id) {
        const [rows] = await pool.query(
            `SELECT s.*, 
                    u1.first_name as student_first, u1.last_name as student_last, u1.email as student_email,
                    u2.first_name as therapist_first, u2.last_name as therapist_last, u2.email as therapist_email
             FROM sessions s
             JOIN users u1 ON s.student_id = u1.id
             JOIN users u2 ON s.therapist_id = u2.id
             WHERE s.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async getByStudentId(studentId) {
        const [rows] = await pool.query(
            `SELECT s.*, 
                    u.first_name as therapist_first, u.last_name as therapist_last, u.email as therapist_email,
                    sr.rating AS student_rating, sr.feedback AS rating_feedback
             FROM sessions s
             JOIN users u ON s.therapist_id = u.id
             LEFT JOIN session_ratings sr ON sr.session_id = s.id AND sr.student_id = s.student_id
             WHERE s.student_id = ?
             ORDER BY s.session_date DESC, s.start_time DESC`,
            [studentId]
        );
        return rows;
    }

    static async getByTherapistId(therapistId) {
        const [rows] = await pool.query(
            `SELECT s.*, 
                    u.first_name as student_first, u.last_name as student_last, u.email as student_email
             FROM sessions s
             JOIN users u ON s.student_id = u.id
             WHERE s.therapist_id = ?
             ORDER BY s.session_date DESC, s.start_time DESC`,
            [therapistId]
        );
        return rows;
    }

    static async getUpcomingByTherapistId(therapistId) {
        const [rows] = await pool.query(
            `SELECT s.*, 
                    u.first_name as student_first, u.last_name as student_last, u.email as student_email
             FROM sessions s
             JOIN users u ON s.student_id = u.id
             WHERE s.therapist_id = ? 
               AND s.session_date >= CURDATE()
               AND s.status IN ('scheduled', 'in-progress')
             ORDER BY s.session_date ASC, s.start_time ASC`,
            [therapistId]
        );
        return rows;
    }

    static async checkAvailability(therapistId, sessionDate, startTime) {
        const [rows] = await pool.query(
            `SELECT * FROM sessions 
             WHERE therapist_id = ? 
               AND session_date = ? 
               AND start_time = ? 
               AND status != 'cancelled'`,
            [therapistId, sessionDate, startTime]
        );
        return rows.length === 0;
    }

    static async updateStatus(id, status, notes = null) {
        const query = notes ?
            'UPDATE sessions SET status = ?, notes = ? WHERE id = ?' :
            'UPDATE sessions SET status = ? WHERE id = ?';
        const params = notes ? [status, notes, id] : [status, id];
        const [result] = await pool.query(query, params);
        return result;
    }

    static async getUpcomingByStudentId(studentId) {
        const [rows] = await pool.query(
            `SELECT s.*, 
                    u.first_name as therapist_first, u.last_name as therapist_last, u.email as therapist_email
             FROM sessions s
             JOIN users u ON s.therapist_id = u.id
             WHERE s.student_id = ? 
               AND s.session_date >= CURDATE()
               AND s.status IN ('scheduled', 'in-progress')
             ORDER BY s.session_date ASC, s.start_time ASC`,
            [studentId]
        );
        return rows;
    }

    static async cancelSession(id, reason) {
        const [result] = await pool.query(
            'UPDATE sessions SET status = ?, cancellation_reason = ? WHERE id = ?',
            ['cancelled', reason, id]
        );
        return result;
    }

    static async submitRating({ sessionId, studentId, therapistId, rating, feedback }) {
        await pool.query(
            `INSERT INTO session_ratings (session_id, student_id, therapist_id, rating, feedback)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE rating = VALUES(rating), feedback = VALUES(feedback), updated_at = CURRENT_TIMESTAMP`,
            [sessionId, studentId, therapistId, rating, feedback || null]
        );

        await pool.query(
            `UPDATE therapist_profiles
             SET rating = (
                    SELECT COALESCE(AVG(session_ratings.rating), 0)
                    FROM session_ratings
                    WHERE session_ratings.therapist_id = ?
                 ),
                 total_sessions = (
                    SELECT COUNT(*) FROM sessions
                    WHERE sessions.therapist_id = ? AND sessions.status = 'completed'
                 )
             WHERE user_id = ?`,
            [therapistId, therapistId, therapistId]
        );

        const [rows] = await pool.query(
            'SELECT rating, total_sessions FROM therapist_profiles WHERE user_id = ?',
            [therapistId]
        );
        return rows[0];
    }
}

module.exports = Session;
