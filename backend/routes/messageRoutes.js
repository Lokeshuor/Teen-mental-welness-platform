const express = require('express');
const { 
    sendMessage, 
    getConversation, 
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    getRecentMessages
} = require('../controllers/messageController');
const authenticate = require('../middleware/auth');
const router = express.Router();

router.post('/send', authenticate, sendMessage);
router.get('/conversation/:userId', authenticate, getConversation);
router.get('/unread', authenticate, getUnreadCount);
router.put('/:messageId/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
router.get('/recent', authenticate, getRecentMessages);

module.exports = router;