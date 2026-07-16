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
                    la.completed_at AS latest_assessment_at
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
