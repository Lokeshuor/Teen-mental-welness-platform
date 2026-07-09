import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaPaperPlane, FaUser, FaUserMd } from 'react-icons/fa';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import './TherapistMessages.css';

const TherapistMessages = () => {
    const { userId } = useParams();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);
    const user = getUser();

    useEffect(() => {
        fetchRecentMessages();
        fetchUnreadCount();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchConversation(parseInt(userId));
        }
    }, [userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchRecentMessages = async () => {
        try {
            const response = await api.get('/messages/recent');
            setConversations(response.data || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Fetch recent messages error:', error);
            setIsLoading(false);
        }
    };

    const fetchConversation = async (userId) => {
        try {
            const response = await api.get(`/messages/conversation/${userId}`);
            setMessages(response.data || []);
            const userInfo = response.data[0]?.sender_id === userId ? 
                { id: userId, first_name: response.data[0]?.sender_first, last_name: response.data[0]?.sender_last } :
                { id: userId, first_name: response.data[0]?.receiver_first, last_name: response.data[0]?.receiver_last };
            setSelectedUser(userInfo);
            
            // Mark messages as read
            await api.put(`/messages/read-all`);
            setUnreadCount(0);
        } catch (error) {
            console.error('Fetch conversation error:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/messages/unread');
            setUnreadCount(response.data.unread || 0);
        } catch (error) {
            console.error('Fetch unread count error:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        if (!selectedUser) {
            toast.error('Please select a conversation');
            return;
        }

        setIsSending(true);
        try {
            const response = await api.post('/messages/send', {
                receiver_id: selectedUser.id,
                content: message.trim()
            });

            setMessages([...messages, response.data.data]);
            setMessage('');
            scrollToBottom();
            fetchRecentMessages();
        } catch (error) {
            console.error('Send message error:', error);
        } finally {
            setIsSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSelectConversation = (msg) => {
        const targetUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        fetchConversation(targetUserId);
    };

    const getConversationUser = (msg) => {
        if (msg.sender_id === user.id) {
            return {
                id: msg.receiver_id,
                first_name: msg.receiver_first,
                last_name: msg.receiver_last
            };
        }
        return {
            id: msg.sender_id,
            first_name: msg.sender_first,
            last_name: msg.sender_last
        };
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return (
            <div className="tm-loading">
                <div className="spinner"></div>
                <p>Loading messages...</p>
            </div>
        );
    }

    return (
        <div className="therapist-messages">
            <div className="container">
                <div className="tm-header">
                    <h1>Messages</h1>
                    {unreadCount > 0 && (
                        <span className="badge badge-primary">{unreadCount} unread</span>
                    )}
                </div>

                <div className="tm-container card">
                    <div className="tm-conversations">
                        <h3>Students</h3>
                        {conversations.length === 0 ? (
                            <p className="no-conversations">No conversations yet</p>
                        ) : (
                            conversations.map((msg, index) => {
                                const conversationUser = getConversationUser(msg);
                                const isUnread = !msg.is_read && msg.receiver_id === user.id;
                                return (
                                    <div
                                        key={index}
                                        className={`tm-conversation-item ${isUnread ? 'unread' : ''}`}
                                        onClick={() => handleSelectConversation(msg)}
                                    >
                                        <div className="tm-conversation-avatar">
                                            <FaUser />
                                        </div>
                                        <div className="tm-conversation-info">
                                            <span className="tm-conversation-name">
                                                {conversationUser.first_name} {conversationUser.last_name}
                                            </span>
                                            <span className="tm-conversation-preview">
                                                {msg.content.substring(0, 40)}...
                                            </span>
                                        </div>
                                        {isUnread && <span className="unread-dot"></span>}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="tm-messages-area">
                        {selectedUser ? (
                            <>
                                <div className="tm-messages-header">
                                    <div className="tm-user-avatar">
                                        <FaUser />
                                    </div>
                                    <div>
                                        <h4>{selectedUser.first_name} {selectedUser.last_name}</h4>
                                        <span className="user-role">Student</span>
                                    </div>
                                </div>

                                <div className="tm-messages-list">
                                    {messages.length === 0 ? (
                                        <p className="no-messages">No messages yet</p>
                                    ) : (
                                        messages.map((msg, index) => {
                                            const isOwn = msg.sender_id === user.id;
                                            return (
                                                <div
                                                    key={index}
                                                    className={`tm-message-item ${isOwn ? 'own' : 'other'}`}
                                                >
                                                    <div className="tm-message-bubble">
                                                        <p>{msg.content}</p>
                                                        <span className="tm-message-time">
                                                            {formatTime(msg.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={handleSendMessage} className="tm-input-form">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="form-input"
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSending || !message.trim()}
                                    >
                                        <FaPaperPlane />
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="no-conversation-selected">
                                <p>Select a student to start messaging</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TherapistMessages;