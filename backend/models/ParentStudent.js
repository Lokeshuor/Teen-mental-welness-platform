const pool = require('../config/database');

class ParentStudent {
    static async link(parentId, studentId) {
        const [result] = await pool.query(
            'INSERT INTO parent_students (parent_id, student_id) VALUES (?, ?)',
            [parentId, studentId]
        );
        return result.insertId;
    }

    static async unlink(parentId, studentId) {
        const [result] = await pool.query(
            'DELETE FROM parent_students WHERE parent_id = ? AND student_id = ?',
            [parentId, studentId]
        );
        return result.affectedRows;
    }

    static async exists(parentId, studentId) {
        const [rows] = await pool.query(
            'SELECT id FROM parent_students WHERE parent_id = ? AND student_id = ?',
            [parentId, studentId]
        );
        return rows.length > 0;
    }

    static async getChildren(parentId) {
        const [rows] = await pool.query(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.grade_level, u.school_id,
                    (SELECT COUNT(*) FROM sessions s
                     WHERE s.student_id = u.id
                       AND s.status = 'scheduled'
                       AND s.session_date >= CURDATE()) AS upcoming_sessions,
                    la.risk_level AS latest_risk_level,
                    la.total_score AS latest_assessment_score,
                    la.recommendation AS latest_recommendation,
                    la.completed_at AS latest_assessment_at,
                    (SELECT s.session_date FROM sessions s
                     WHERE s.student_id = u.id
                       AND s.status = 'scheduled'
                       AND s.session_date >= CURDATE()
                     ORDER BY s.session_date, s.start_time
                     LIMIT 1) AS next_session_date,
                    (SELECT s.start_time FROM sessions s
                     WHERE s.student_id = u.id
                       AND s.status = 'scheduled'
                       AND s.session_date >= CURDATE()
                     ORDER BY s.session_date, s.start_time
                     LIMIT 1) AS next_session_time
             FROM parent_students ps
             JOIN users u ON u.id = ps.student_id
             LEFT JOIN assessments la ON la.id = (
                 SELECT a.id FROM assessments a
                 WHERE a.student_id = u.id
                 ORDER BY a.completed_at DESC
                 LIMIT 1
             )
             WHERE ps.parent_id = ?
             ORDER BY u.first_name`,
            [parentId]
        );
        return rows;
    }

    // Session history for every child linked to this parent. Clinical `notes`
    // are deliberately excluded: parents see the schedule, not the therapist's
    // record of what was discussed.
    static async getChildrenSessions(parentId, { childId = null, limit = 50 } = {}) {
        const params = [parentId];
        let childFilter = '';
        if (childId) {
            childFilter = 'AND ps.student_id = ?';
            params.push(childId);
        }
        params.push(limit);

        const [rows] = await pool.query(
            `SELECT s.id, s.session_date, s.start_time, s.end_time, s.status,
                    s.session_type, s.cancellation_reason,
                    child.id AS student_id,
                    child.first_name AS student_first, child.last_name AS student_last,
                    therapist.id AS therapist_id,
                    therapist.first_name AS therapist_first, therapist.last_name AS therapist_last,
                    tp.specialization AS therapist_specialization
             FROM parent_students ps
             JOIN sessions s ON s.student_id = ps.student_id
             JOIN users child ON child.id = ps.student_id
             JOIN users therapist ON therapist.id = s.therapist_id
             LEFT JOIN therapist_profiles tp ON tp.user_id = therapist.id
             WHERE ps.parent_id = ?
               ${childFilter}
               AND (s.session_date < CURDATE() OR s.status IN ('completed', 'cancelled', 'no-show'))
             ORDER BY s.session_date DESC, s.start_time DESC
             LIMIT ?`,
            params
        );
        return rows;
    }

    static async getParents(studentId) {
        const [rows] = await pool.query(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.phone
             FROM parent_students ps
             JOIN users u ON u.id = ps.parent_id
             WHERE ps.student_id = ?`,
            [studentId]
        );
        return rows;
    }
}

module.exports = ParentStudent;
