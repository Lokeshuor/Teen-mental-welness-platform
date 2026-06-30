const express = require('express');
const { getProfile, updateProfile, getStudents, getStudentDetail, getTherapists, updateUserStatus, deleteUser } = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/students', authenticate, roleCheck('admin', 'therapist'), getStudents);
router.get('/students/:id', authenticate, roleCheck('admin', 'therapist'), getStudentDetail);
router.get('/therapists', authenticate, roleCheck('admin'), getTherapists);
router.put('/:id/status', authenticate, roleCheck('admin'), updateUserStatus);
router.delete('/:id', authenticate, roleCheck('admin'), deleteUser);

module.exports = router;