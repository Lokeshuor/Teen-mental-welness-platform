const express = require('express');
const { body } = require('express-validator');
const {
    getAvailableTherapists,
    getTherapistAvailability,
    getMyAvailability,
    addAvailability,
    deleteAvailability,
    bookSession,
    getStudentSessions,
    getTherapistSessions,
    getUpcomingSessions,
    updateSessionStatus,
    cancelSession
} = require('../controllers/sessionController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.get('/therapists', authenticate, getAvailableTherapists);
router.get('/availability/current', authenticate, roleCheck('therapist'), getMyAvailability);
router.post('/availability', authenticate, roleCheck('therapist'), addAvailability);
router.delete('/availability/:id', authenticate, roleCheck('therapist', 'admin'), deleteAvailability);
router.get('/availability/:therapistId', authenticate, getTherapistAvailability);
router.post('/book', authenticate, [
    body('therapist_id').isInt(),
    body('session_date').isDate(),
    body('start_time').notEmpty(),
    body('end_time').notEmpty()
], bookSession);
router.get('/student', authenticate, getStudentSessions);
router.get('/therapist', authenticate, roleCheck('therapist'), getTherapistSessions);
router.get('/upcoming', authenticate, getUpcomingSessions);
router.put('/:id/status', authenticate, updateSessionStatus);
router.put('/:id/cancel', authenticate, cancelSession);

module.exports = router;