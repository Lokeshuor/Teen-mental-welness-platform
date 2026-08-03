import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaComments, FaPaperPlane, FaSearch, FaUser, FaUserMd } from 'react-icons/fa';
import api from '../utils/api';
import { getUser } from '../utils/auth';
import './MessageCenter.css';

const POLL_INTERVAL_MS = 10000;
const MAX_MESSAGE_LENGTH = 2000;

const ROLE_LABELS = {
    student: 'Student',
    therapist: 'Therapist',
    parent: 'Parent',
    admin: 'Admin'
};

const getInitials = (person) =>
    `${person?.first_name?.[0] || ''}${person?.last_name?.[0] || ''}`.toUpperCase() || '?';

const getFullName = (person) =>
    [person?.first_name, person?.last_name].filter(Boolean).join(' ') || 'Unknown user';

const formatTime = (value) =>
    new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDayLabel = (value) => {
    const date = new Date(value);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
};

const formatListTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    const isToday = date.toDateString() === new Date().toDateString();
    return isToday ? formatTime(value) : date.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

const truncate = (text, length = 48) => {
    const value = String(text || '').replace(/\s+/g, ' ').trim();
    return value.length > length ? `${value.slice(0, length)}…` : value;
};

/**
 * Shared inbox for every role. The student and therapist screens differ only in
 * their labels, so both render this component instead of keeping two copies of
 * the same (previously divergent) messaging logic.
 */
const MessageCenter = ({ basePath, contactsLabel = 'Conversations', emptyHint }) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const currentUser = getUser();

    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [draft, setDraft] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isThreadLoading, setIsThreadLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [search, setSearch] = useState('');

    const messagesEndRef = useRef(null);
    // Read inside the thread effect without making it re-run on every poll.
    const conversationsRef = useRef([]);
    const activeUserId = userId ? Number.parseInt(userId, 10) : null;

    const loadConversations = useCallback(async () => {
        try {
            const response = await api.get('/messages/conversations');
            conversationsRef.current = response.data || [];
            setConversations(conversationsRef.current);
            return conversationsRef.current;
        } catch (error) {
            console.error('Fetch conversations error:', error);
            return [];
        }
    }, []);

    const loadThread = useCallback(async (contactId) => {
        try {
            const response = await api.get(`/messages/conversation/${contactId}`);
            setMessages(response.data || []);
        } catch (error) {
            console.error('Fetch conversation error:', error);
        }
    }, []);

    useEffect(() => {
        loadConversations().finally(() => setIsLoading(false));
    }, [loadConversations]);

    // Resolve the open thread from the URL so a "Message" button elsewhere in
    // the app can deep-link straight into a conversation that may not exist yet.
    useEffect(() => {
        let cancelled = false;

        if (!activeUserId) {
            setActiveContact(null);
            setMessages([]);
            return undefined;
        }

        const openThread = async () => {
            setIsThreadLoading(true);
            const known = conversationsRef.current.find((item) => item.user_id === activeUserId);

            if (known) {
                if (!cancelled) setActiveContact(known);
            } else {
                try {
                    const response = await api.get(`/messages/contact/${activeUserId}`);
                    if (!cancelled) setActiveContact({ user_id: response.data.id, ...response.data });
                } catch (error) {
                    console.error('Fetch contact error:', error);
                    if (!cancelled) navigate(basePath, { replace: true });
                    return;
                }
            }

            await loadThread(activeUserId);
            if (!cancelled) setIsThreadLoading(false);
        };

        openThread();
        return () => { cancelled = true; };
    }, [activeUserId, basePath, loadThread, navigate]);

    // Poll for incoming messages; skipped while the tab is hidden.
    useEffect(() => {
        const tick = () => {
            if (document.hidden) return;
            loadConversations();
            if (activeUserId) loadThread(activeUserId);
        };

        const timer = setInterval(tick, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [activeUserId, loadConversations, loadThread]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const totalUnread = useMemo(
        () => conversations.reduce((sum, item) => sum + Number(item.unread_count || 0), 0),
        [conversations]
    );

    const filteredConversations = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return conversations;
        return conversations.filter((item) =>
            getFullName(item).toLowerCase().includes(query) ||
            String(item.last_message || '').toLowerCase().includes(query)
        );
    }, [conversations, search]);

    // Group consecutive messages by calendar day for the date separators.
    const groupedMessages = useMemo(() => {
        const groups = [];
        messages.forEach((msg) => {
            const label = formatDayLabel(msg.created_at);
            const lastGroup = groups[groups.length - 1];
            if (lastGroup && lastGroup.label === label) {
                lastGroup.items.push(msg);
            } else {
                groups.push({ label, items: [msg] });
            }
        });
        return groups;
    }, [messages]);

    const openConversation = (contactId) => {
        if (contactId === activeUserId) return;
        navigate(`${basePath}/${contactId}`);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const content = draft.trim();
        if (!content || isSending) return;

        if (!activeContact) {
            toast.error('Select a conversation first');
            return;
        }

        setIsSending(true);
        try {
            const response = await api.post('/messages/send', {
                receiver_id: activeContact.user_id,
                content
            });

            setMessages((previous) => [...previous, response.data.data]);
            setDraft('');
            loadConversations();
        } catch (error) {
            console.error('Send message error:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const renderAvatarIcon = (role) => (role === 'therapist' ? <FaUserMd /> : <FaUser />);

    if (isLoading) {
        return (
            <div className="mc-loading">
                <div className="spinner"></div>
                <p>Loading messages...</p>
            </div>
        );
    }

    return (
        <div className="message-center">
            <div className="container">
                <div className="mc-header">
                    <h1>Messages</h1>
                    {totalUnread > 0 && (
                        <span className="mc-unread-badge">{totalUnread} unread</span>
                    )}
                </div>

                <div className={`mc-layout card ${activeContact ? 'thread-open' : ''}`}>
                    <aside className="mc-sidebar">
                        <div className="mc-sidebar-head">
                            <h3>{contactsLabel}</h3>
                            <div className="mc-search">
                                <FaSearch className="mc-search-icon" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search conversations"
                                    aria-label="Search conversations"
                                />
                            </div>
                        </div>

                        <div className="mc-conversation-list">
                            {filteredConversations.length === 0 ? (
                                <div className="mc-sidebar-empty">
                                    <FaComments />
                                    <p>{conversations.length === 0 ? 'No conversations yet' : 'No matches'}</p>
                                    {conversations.length === 0 && emptyHint && <span>{emptyHint}</span>}
                                </div>
                            ) : (
                                filteredConversations.map((item) => {
                                    const unread = Number(item.unread_count || 0);
                                    const isSelected = item.user_id === activeUserId;
                                    const prefix = item.last_sender_id === currentUser.id ? 'You: ' : '';
                                    return (
                                        <button
                                            type="button"
                                            key={item.user_id}
                                            className={`mc-conversation ${isSelected ? 'is-selected' : ''} ${unread ? 'is-unread' : ''}`}
                                            onClick={() => openConversation(item.user_id)}
                                        >
                                            <span className="mc-avatar">{getInitials(item)}</span>
                                            <span className="mc-conversation-body">
                                                <span className="mc-conversation-top">
                                                    <span className="mc-conversation-name">{getFullName(item)}</span>
                                                    <span className="mc-conversation-time">
                                                        {formatListTime(item.last_message_at)}
                                                    </span>
                                                </span>
                                                <span className="mc-conversation-preview">
                                                    {prefix}{truncate(item.last_message)}
                                                </span>
                                            </span>
                                            {unread > 0 && <span className="mc-unread-count">{unread}</span>}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </aside>

                    <section className="mc-thread">
                        {activeContact ? (
                            <>
                                <header className="mc-thread-head">
                                    <button
                                        type="button"
                                        className="mc-back"
                                        onClick={() => navigate(basePath)}
                                        aria-label="Back to conversations"
                                    >
                                        <FaArrowLeft />
                                    </button>
                                    <span className="mc-avatar mc-avatar-lg">
                                        {renderAvatarIcon(activeContact.role)}
                                    </span>
                                    <div className="mc-thread-identity">
                                        <h4>{getFullName(activeContact)}</h4>
                                        <span className="mc-thread-role">
                                            {ROLE_LABELS[activeContact.role] || 'User'}
                                        </span>
                                    </div>
                                </header>

                                <div className="mc-thread-body">
                                    {isThreadLoading ? (
                                        <div className="mc-thread-loading">
                                            <div className="spinner spinner-sm"></div>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <p className="mc-thread-empty">
                                            No messages yet. Say hello to start the conversation.
                                        </p>
                                    ) : (
                                        groupedMessages.map((group) => (
                                            <div key={group.label} className="mc-day-group">
                                                <div className="mc-day-label"><span>{group.label}</span></div>
                                                {group.items.map((msg) => {
                                                    const isOwn = msg.sender_id === currentUser.id;
                                                    return (
                                                        <div
                                                            key={msg.id}
                                                            className={`mc-message ${isOwn ? 'is-own' : 'is-other'}`}
                                                        >
                                                            <div className="mc-bubble">
                                                                <p>{msg.content}</p>
                                                                <span className="mc-bubble-meta">
                                                                    {formatTime(msg.created_at)}
                                                                    {isOwn && (
                                                                        <span className="mc-receipt">
                                                                            {msg.is_read ? 'Read' : 'Sent'}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={handleSendMessage} className="mc-composer">
                                    <textarea
                                        value={draft}
                                        onChange={(e) => setDraft(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type a message... (Enter to send, Shift + Enter for a new line)"
                                        rows={1}
                                        aria-label="Message"
                                    />
                                    <div className="mc-composer-actions">
                                        {draft.length > MAX_MESSAGE_LENGTH - 200 && (
                                            <span className="mc-char-count">
                                                {MAX_MESSAGE_LENGTH - draft.length} left
                                            </span>
                                        )}
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={isSending || !draft.trim()}
                                        >
                                            <FaPaperPlane /> {isSending ? 'Sending...' : 'Send'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="mc-placeholder">
                                <FaComments className="mc-placeholder-icon" />
                                <h3>Select a conversation</h3>
                                <p>{emptyHint || 'Choose someone from the list to start messaging.'}</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default MessageCenter;
