const express = require('express');
const { 
    sendMessage, 
    getConversation, 
    getConversations,
    getContact,
    getUnreadCount,
    markAsRead,
    markConversationAsRead,
    markAllAsRead,
    getRecentMessages
} = require('../controllers/messageController');
const authenticate = require('../middleware/auth');
const router = express.Router();

router.post('/send', authenticate, sendMessage);
router.get('/conversations', authenticate, getConversations);
router.get('/conversation/:userId', authenticate, getConversation);
router.get('/contact/:userId', authenticate, getContact);
router.get('/unread', authenticate, getUnreadCount);
// Static paths are declared before /:messageId/read so "read-all" is never
// swallowed by the parameterised route.
router.put('/read-all', authenticate, markAllAsRead);
router.put('/conversation/:userId/read', authenticate, markConversationAsRead);
router.put('/:messageId/read', authenticate, markAsRead);
router.get('/recent', authenticate, getRecentMessages);

module.exports = router;
