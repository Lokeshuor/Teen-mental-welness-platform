const pool = require('../config/database');
const Assessment = require('../models/Assessment');
const Session = require('../models/Session');
const User = require('../models/User');

exports.generateReport = async (req, res) => {
    try {
        const { reportType, startDate, endDate } = req.body;
        const userId = req.user.id;

        let reportData = {};
        let reportTitle = '';

        switch (reportType) {
            case 'student-progress':
                reportData = await generateStudentProgressReport(userId, startDate, endDate);
                reportTitle = 'Student Progress Report';
                break;
            case 'therapist-performance':
                if (req.user.role !== 'admin' && req.user.role !== 'therapist') {
                    return res.status(403).json({ message: 'Unauthorized' });
                }
                reportData = await generateTherapistPerformanceReport(userId, startDate, endDate);
                reportTitle = 'Therapist Performance Report';
                break;
            case 'organizational':
                if (req.user.role !== 'admin') {
                    return res.status(403).json({ message: 'Unauthorized' });
                }
                reportData = await generateOrganizationalReport(startDate, endDate);
                reportTitle = 'Organizational Report';
                break;
            case 'assessment-summary':
                if (req.user.role !== 'admin' && req.user.role !== 'therapist') {
                    return res.status(403).json({ message: 'Unauthorized' });
                }
                reportData = await generateAssessmentSummaryReport(startDate, endDate);
                reportTitle = 'Assessment Summary Report';
                break;
            default:
                return res.status(400).json({ message: 'Invalid report type' });
        }

        // Save report to database
        const [result] = await pool.query(
            `INSERT INTO reports (generated_by, report_type, data, start_date, end_date) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, reportType, JSON.stringify(reportData), startDate || null, endDate || null]
        );

        res.json({
            message: 'Report generated successfully',
            reportId: result.insertId,
            title: reportTitle,
            data: reportData,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getReports = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT r.*, u.first_name, u.last_name 
             FROM reports r
             JOIN users u ON r.generated_by = u.id
             WHERE r.generated_by = ? OR ? IN ('admin', 'therapist')
             ORDER BY r.created_at DESC`,
            [req.user.id, req.user.role]
        );
        res.json(rows);
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            `SELECT r.*, u.first_name, u.last_name 
             FROM reports r
             JOIN users u ON r.generated_by = u.id
             WHERE r.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const report = rows[0];
        // mysql2 returns JSON columns as parsed objects; only parse strings
        if (typeof report.data === 'string') {
            report.data = JSON.parse(report.data);
        }
        res.json(report);
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query(
            'DELETE FROM reports WHERE id = ? AND generated_by = ?',
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Report not found or unauthorized' });
        }

        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Normalize report date bounds: MySQL cannot compare ISO strings with a
// trailing 'Z' against local DATETIMEs, and a date-only end bound must
// cover the whole day.
const rangeStart = (startDate) => startDate || '1970-01-01';
const rangeEnd = (endDate) => {
    if (!endDate) return '9999-12-31 23:59:59';
    return /^\d{4}-\d{2}-\d{2}$/.test(endDate) ? `${endDate} 23:59:59` : endDate;
};

// Helper functions for report generation
async function generateStudentProgressReport(userId, startDate, endDate) {
    const [assessments] = await pool.query(
        `SELECT * FROM assessments 
         WHERE student_id = ? 
         AND completed_at BETWEEN ? AND ?
         ORDER BY completed_at ASC`,
        [userId, rangeStart(startDate), rangeEnd(endDate)]
    );

    const [sessions] = await pool.query(
        `SELECT * FROM sessions 
         WHERE student_id = ? 
         AND session_date BETWEEN ? AND ?
         ORDER BY session_date ASC`,
        [userId, rangeStart(startDate), rangeEnd(endDate)]
    );

    const riskTrend = assessments.map(a => ({
        date: a.completed_at,
        score: a.total_score,
        riskLevel: a.risk_level
    }));

    return {
        studentId: userId,
        totalAssessments: assessments.length,
        totalSessions: sessions.length,
        riskTrend,
        latestAssessment: assessments[assessments.length - 1] || null,
        sessionSummary: {
            completed: sessions.filter(s => s.status === 'completed').length,
            scheduled: sessions.filter(s => s.status === 'scheduled').length,
            cancelled: sessions.filter(s => s.status === 'cancelled').length
        }
    };
}

async function generateTherapistPerformanceReport(userId, startDate, endDate) {
    const [sessions] = await pool.query(
        `SELECT * FROM sessions 
         WHERE therapist_id = ? 
         AND session_date BETWEEN ? AND ?`,
        [userId, rangeStart(startDate), rangeEnd(endDate)]
    );

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const cancelledSessions = sessions.filter(s => s.status === 'cancelled').length;

    // Get unique students
    const studentIds = new Set(sessions.map(s => s.student_id));

    // Average session rating (if rating exists)
    const [ratings] = await pool.query(
        `SELECT AVG(rating) as avg_rating FROM therapist_profiles WHERE user_id = ?`,
        [userId]
    );

    return {
        therapistId: userId,
        totalSessions,
        completedSessions,
        cancelledSessions,
        completionRate: totalSessions > 0 ? (completedSessions / totalSessions * 100).toFixed(1) : 0,
        uniqueStudents: studentIds.size,
        averageRating: ratings[0]?.avg_rating || 0,
        period: { startDate, endDate }
    };
}

async function generateOrganizationalReport(startDate, endDate) {
    const [totalStudents] = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE role = "student"'
    );
    const [totalTherapists] = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE role = "therapist"'
    );
    const [totalAssessments] = await pool.query(
        `SELECT COUNT(*) as count, risk_level 
         FROM assessments 
         WHERE completed_at BETWEEN ? AND ?
         GROUP BY risk_level`,
        [rangeStart(startDate), rangeEnd(endDate)]
    );
    const [totalSessions] = await pool.query(
        `SELECT COUNT(*) as count, status 
         FROM sessions 
         WHERE session_date BETWEEN ? AND ?
         GROUP BY status`,
        [rangeStart(startDate), rangeEnd(endDate)]
    );

    // Risk distribution
    const riskDistribution = {
        low: 0,
        moderate: 0,
        high: 0
    };
    totalAssessments.forEach(a => {
        riskDistribution[a.risk_level] = a.count;
    });

    // Session status distribution
    const sessionDistribution = {};
    totalSessions.forEach(s => {
        sessionDistribution[s.status] = s.count;
    });

    return {
        totalStudents: totalStudents[0]?.count || 0,
        totalTherapists: totalTherapists[0]?.count || 0,
        totalAssessments: totalAssessments.reduce((sum, a) => sum + a.count, 0),
        riskDistribution,
        sessionDistribution,
        period: { startDate, endDate }
    };
}

async function generateAssessmentSummaryReport(startDate, endDate) {
    const [assessments] = await pool.query(
        `SELECT a.*, u.first_name, u.last_name, u.school_id, u.grade_level
         FROM assessments a
         JOIN users u ON a.student_id = u.id
         WHERE a.completed_at BETWEEN ? AND ?
         ORDER BY a.completed_at DESC`,
        [rangeStart(startDate), rangeEnd(endDate)]
    );

    const riskLevels = {
        low: 0,
        moderate: 0,
        high: 0
    };

    assessments.forEach(a => {
        riskLevels[a.risk_level] = (riskLevels[a.risk_level] || 0) + 1;
    });

    return {
        totalAssessments: assessments.length,
        riskDistribution: riskLevels,
        recentAssessments: assessments.slice(0, 20),
        period: { startDate, endDate }
    };
}