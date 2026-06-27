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
            [sender_id, receiver_id, content, parent_visible || true]
        );
        return result.insertId;
    }

    static async getConversation(user1Id, user2Id, limit = 50) {
        const [rows] = await pool.query(
            `SELECT m.*, 
                    u1.first_name as sender_first, u1.last_name as sender_last,
                    u2.first_name as receiver_first, u2.last_name as receiver_last
             FROM messages m
             JOIN users u1 ON m.sender_id = u1.id
             JOIN users u2 ON m.receiver_id = u2.id
             WHERE (sender_id = ? AND receiver_id = ?) 
                OR (sender_id = ? AND receiver_id = ?)
             ORDER BY m.created_at DESC 
             LIMIT ?`,
            [user1Id, user2Id, user2Id, user1Id, limit]
        );
        return rows.reverse();
    }

    static async getUnreadCount(userId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE',
            [userId]
        );
        return rows[0].count;
    }

    static async markAsRead(messageId) {
        const [result] = await pool.query(
            'UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE id = ?',
            [messageId]
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
             WHERE sender_id = ? OR receiver_id = ?
             ORDER BY m.created_at DESC 
             LIMIT ?`,
            [userId, userId, limit]
        );
        return rows;
    }
}

module.exports = Message;