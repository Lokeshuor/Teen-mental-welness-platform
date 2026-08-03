const pool = require('../config/database');

class Message {
    static async create(messageData) {
        const {
            sender_id, receiver_id, content, parent_visible
        } = messageData;

        const [result] = await pool.query(
            `INSERT INTO messages 
            (sender_id, receiver_id, content, parent_visible) 
            VALUES (?, ?, ?, ?)`,
            [sender_id, receiver_id, content, parent_visible === undefined ? true : parent_visible]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT m.*,
                    u1.first_name as sender_first, u1.last_name as sender_last,
                    u2.first_name as receiver_first, u2.last_name as receiver_last
             FROM messages m
             JOIN users u1 ON m.sender_id = u1.id
             JOIN users u2 ON m.receiver_id = u2.id
             WHERE m.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async getConversation(user1Id, user2Id, limit = 50) {
        const [rows] = await pool.query(
            `SELECT m.*, 
                    u1.first_name as sender_first, u1.last_name as sender_last,
                    u2.first_name as receiver_first, u2.last_name as receiver_last
             FROM messages m
             JOIN users u1 ON m.sender_id = u1.id
             JOIN users u2 ON m.receiver_id = u2.id
             WHERE (m.sender_id = ? AND m.receiver_id = ?) 
                OR (m.sender_id = ? AND m.receiver_id = ?)
             ORDER BY m.created_at DESC, m.id DESC
             LIMIT ?`,
            [user1Id, user2Id, user2Id, user1Id, limit]
        );
        return rows.reverse();
    }

    // One row per conversation partner (latest message + unread tally), so the
    // sidebar shows threads rather than a flat list of repeated messages.
    static async getConversations(userId) {
        const [rows] = await pool.query(
            `SELECT partner.id AS user_id,
                    partner.first_name,
                    partner.last_name,
                    partner.role,
                    partner.is_active,
                    m.id AS last_message_id,
                    m.content AS last_message,
                    m.sender_id AS last_sender_id,
                    m.is_read AS last_message_read,
                    m.created_at AS last_message_at,
                    COALESCE(unread.total, 0) AS unread_count
             FROM (
                 SELECT IF(sender_id = ?, receiver_id, sender_id) AS partner_id,
                        MAX(id) AS last_id
                 FROM messages
                 WHERE sender_id = ? OR receiver_id = ?
                 GROUP BY partner_id
             ) threads
             JOIN messages m ON m.id = threads.last_id
             JOIN users partner ON partner.id = threads.partner_id
             LEFT JOIN (
                 SELECT sender_id, COUNT(*) AS total
                 FROM messages
                 WHERE receiver_id = ? AND is_read = FALSE
                 GROUP BY sender_id
             ) unread ON unread.sender_id = threads.partner_id
             ORDER BY m.created_at DESC, m.id DESC`,
            [userId, userId, userId, userId]
        );
        return rows;
    }

    static async getUnreadCount(userId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE',
            [userId]
        );
        return rows[0].count;
    }

    // Scoped to the receiver so a user can only mark their own inbox read.
    static async markAsRead(messageId, receiverId) {
        const [result] = await pool.query(
            'UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE id = ? AND receiver_id = ?',
            [messageId, receiverId]
        );
        return result;
    }

    static async markConversationAsRead(userId, otherUserId) {
        const [result] = await pool.query(
            `UPDATE messages SET is_read = TRUE, read_at = NOW()
             WHERE receiver_id = ? AND sender_id = ? AND is_read = FALSE`,
            [userId, otherUserId]
        );
        return result;
    }

    static async markAllAsRead(userId) {
        const [result] = await pool.query(
            'UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE receiver_id = ? AND is_read = FALSE',
            [userId]
        );
        return result;
    }

    static async getRecentMessages(userId, limit = 10) {
        const [rows] = await pool.query(
            `SELECT m.*, 
                    u1.first_name as sender_first, u1.last_name as sender_last,
                    u2.first_name as receiver_first, u2.last_name as receiver_last
             FROM messages m
             JOIN users u1 ON m.sender_id = u1.id
             JOIN users u2 ON m.receiver_id = u2.id
             WHERE m.sender_id = ? OR m.receiver_id = ?
             ORDER BY m.created_at DESC, m.id DESC
             LIMIT ?`,
            [userId, userId, limit]
        );
        return rows;
    }
}

module.exports = Message;
