const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
    try {
        const { receiver_id, content, parent_visible } = req.body;
        const sender_id = req.user.id;

        if (!content || !receiver_id) {
            return res.status(400).json({ message: 'Content and receiver are required' });
        }

        const messageId = await Message.create({
            sender_id,
            receiver_id,
            content,
            parent_visible: parent_visible !== undefined ? parent_visible : true
        });

        const message = await Message.getConversation(sender_id, receiver_id, 1);
        res.status(201).json({
            message: 'Message sent successfully',
            data: message[message.length - 1]
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        // Check authorization - users can only view their own conversations
        if (req.user.role !== 'admin' && 
            req.user.id !== parseInt(userId) && 
            req.user.id !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const messages = await Message.getConversation(req.user.id, userId, limit);
        res.json(messages);
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Message.getUnreadCount(req.user.id);
        res.json({ unread: count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        await Message.markAsRead(messageId);
        res.json({ message: 'Message marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Message.markAllAsRead(req.user.id);
        res.json({ message: 'All messages marked as read' });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRecentMessages = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const messages = await Message.getRecentMessages(req.user.id, limit);
        res.json(messages);
    } catch (error) {
        console.error('Get recent messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};