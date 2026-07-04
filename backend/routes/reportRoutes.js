const express = require('express');
const { 
    generateReport, 
    getReports, 
    getReportById,
    deleteReport 
} = require('../controllers/reportController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.post('/generate', authenticate, generateReport);
router.get('/', authenticate, getReports);
router.get('/:id', authenticate, getReportById);
router.delete('/:id', authenticate, deleteReport);

module.exports = router;