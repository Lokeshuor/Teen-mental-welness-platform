const express = require('express');
const { body } = require('express-validator');
const { register, login, getCurrentUser } = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const router = express.Router();

router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('first_name').notEmpty(),
    body('last_name').notEmpty(),
    body('role').isIn(['student', 'therapist', 'parent'])
], register);

router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], login);

router.get('/me', authenticate, getCurrentUser);

module.exports = router;