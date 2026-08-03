const Message = require('../models/Message');
const User = require('../models/User');

const MAX_MESSAGE_LENGTH = 2000;

// Messaging is only meaningful between care-related roles. Admins can reach
// anyone for support, and same-role pairs (student/student) are never allowed.
const canMessage = (senderRole, receiverRole) => {
    if (senderRole === 'admin' || receiverRole === 'admin') return true;
    const allowedPairs = [
        ['student', 'therapist'],
        ['student', 'parent'],
        ['parent', 'therapist']
    ];
    return allowedPairs.some(
        ([a, b]) =>
            (senderRole === a && receiverRole === b) ||
            (senderRole === b && receiverRole === a)
    );
};

const parseUserId = (value) => {
    const id = Number.parseInt(value, 10);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const parseLimit = (value, fallback, max) => {
    const limit = Number.parseInt(value, 10);
    if (!Number.isInteger(limit) || limit < 1) return fallback;
    return Math.min(limit, max);
};

exports.sendMessage = async (req, res) => {
    try {
        const { receiver_id, content, parent_visible } = req.body;
        const sender_id = req.user.id;

        const receiverId = parseUserId(receiver_id);
        const trimmedContent = typeof content === 'string' ? content.trim() : '';

        if (!trimmedContent || !receiverId) {
            return res.status(400).json({ message: 'Content and receiver are required' });
        }

        if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({
                message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`
            });
        }

        if (receiverId === sender_id) {
            return res.status(400).json({ message: 'You cannot message yourself' });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver || !receiver.is_active) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        if (!canMessage(req.user.role, receiver.role)) {
            return res.status(403).json({ message: 'You cannot message this user' });
        }

        const messageId = await Message.create({
            sender_id,
            receiver_id: receiverId,
            content: trimmedContent,
            parent_visible: parent_visible !== undefined ? parent_visible : true
        });

        const message = await Message.findById(messageId);
        res.status(201).json({
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getConversation = async (req, res) => {
    try {
        const otherUserId = parseUserId(req.params.userId);
        if (!otherUserId) {
            return res.status(400).json({ message: 'Invalid user id' });
        }

        const limit = parseLimit(req.query.limit, 50, 200);

        // The conversation is always scoped to the authenticated user
        // (getConversation only returns messages sent to/from req.user.id),
        // so any logged-in user may fetch their own thread with userId.
        const messages = await Message.getConversation(req.user.id, otherUserId, limit);

        // Opening a thread reads it: only this thread's unread messages clear,
        // leaving the badge accurate for every other conversation.
        await Message.markConversationAsRead(req.user.id, otherUserId);

        res.json(messages);
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const conversations = await Message.getConversations(req.user.id);
        res.json(conversations);
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Minimal contact card so the UI can open a brand-new thread (no messages yet)
// with the right name and role in the header.
exports.getContact = async (req, res) => {
    try {
        const contactId = parseUserId(req.params.userId);
        if (!contactId) {
            return res.status(400).json({ message: 'Invalid user id' });
        }

        const contact = await User.findById(contactId);
        if (!contact || !contact.is_active) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (contactId !== req.user.id && !canMessage(req.user.role, contact.role)) {
            return res.status(403).json({ message: 'You cannot message this user' });
        }

        res.json({
            id: contact.id,
            first_name: contact.first_name,
            last_name: contact.last_name,
            role: contact.role
        });
    } catch (error) {
        console.error('Get contact error:', error);
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
        const messageId = parseUserId(req.params.messageId);
        if (!messageId) {
            return res.status(400).json({ message: 'Invalid message id' });
        }

        // Restricted to the receiver so one user cannot clear another's inbox.
        const result = await Message.markAsRead(messageId, req.user.id);
        if (!result.affectedRows) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.json({ message: 'Message marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markConversationAsRead = async (req, res) => {
    try {
        const otherUserId = parseUserId(req.params.userId);
        if (!otherUserId) {
            return res.status(400).json({ message: 'Invalid user id' });
        }

        await Message.markConversationAsRead(req.user.id, otherUserId);
        res.json({ message: 'Conversation marked as read' });
    } catch (error) {
        console.error('Mark conversation as read error:', error);
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
        const limit = parseLimit(req.query.limit, 10, 100);
        const messages = await Message.getRecentMessages(req.user.id, limit);
        res.json(messages);
    } catch (error) {
        console.error('Get recent messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
