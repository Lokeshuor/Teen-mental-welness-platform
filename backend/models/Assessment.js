const pool = require('../config/database');

class Assessment {
    static async create(assessmentData) {
        const {
            student_id, assessment_type, responses, total_score,
            risk_level, recommendation
        } = assessmentData;

        const [result] = await pool.query(
            `INSERT INTO assessments 
            (student_id, assessment_type, responses, total_score, risk_level, recommendation) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [student_id, assessment_type, JSON.stringify(responses), total_score, risk_level, recommendation]
        );
        return result.insertId;
    }

    static async getByStudentId(studentId) {
        const [rows] = await pool.query(
            `SELECT * FROM assessments 
             WHERE student_id = ?
             ORDER BY completed_at DESC, id DESC`,
            [studentId]
        );
        return rows;
    }

    static async getLatestByStudentId(studentId) {
        const [rows] = await pool.query(
            `SELECT * FROM assessments 
             WHERE student_id = ?
             ORDER BY completed_at DESC, id DESC
             LIMIT 1`,
            [studentId]
        );
        return rows[0];
    }

    static async getById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM assessments WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async getRiskStatistics() {
        const [rows] = await pool.query(
            `SELECT risk_level, COUNT(*) as count 
             FROM assessments 
             GROUP BY risk_level`
        );
        return rows;
    }

    static async getRecentAssessments(limit = 10) {
        const [rows] = await pool.query(
            `SELECT a.*, u.first_name, u.last_name, u.email 
             FROM assessments a
             JOIN users u ON a.student_id = u.id
             ORDER BY a.completed_at DESC 
             LIMIT ?`,
            [limit]
        );
        return rows;
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
            `UPDATE assessments SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result;
    }
}

module.exports = Assessment;