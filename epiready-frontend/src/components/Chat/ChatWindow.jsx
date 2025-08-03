import React, { useState, useRef, useEffect } from 'react';
import { useGlobal } from '../../LoggedIn';
import styles from './ChatWindow.module.css';

const ChatWindow = ({ selectedRoom, messages, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const { loggedIn } = useGlobal();
    const [currentUser, setCurrentUser] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch current user information when component mounts
    useEffect(() => {
        const fetchCurrentUser = async () => {
            const token = sessionStorage.getItem("token");
            if (!token) return;

            try {
                const response = await fetch("http://127.0.0.1:5000/api/users", {
                    method: "POST",
                    headers: {
                        "Authorization": `${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setCurrentUser(userData);
                }
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };

        if (loggedIn) {
            fetchCurrentUser();
        }
    }, [loggedIn]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && selectedRoom) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const isOwnMessage = (message) => {
        // Compare sender_id with current user's id for reliable identification
        return currentUser && message.sender_id === currentUser.id;
    };

    if (!selectedRoom) {
        return (
            <div className={styles['chat-window']}>
                <div className={styles['no-room-selected']}>
                    <div className={styles['welcome-message']}>
                        <h2>Welcome to EpiReady Chat</h2>
                        <p>Select a chat from the sidebar to start messaging</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles['chat-window']}>
            <div className={styles['chat-header']}>
                <div className={styles['room-info']}>
                    <h3>{selectedRoom.name || 'Direct Message'}</h3>
                    <span className={styles['room-type']}>
                        {selectedRoom.room_type === 'group' ? 'Group Chat' : 'Direct Message'}
                    </span>
                </div>
            </div>

            <div className={styles['messages-container']}>
                {messages.length === 0 ? (
                    <div className={styles['no-messages']}>
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`${styles.message} ${isOwnMessage(message) ? styles['own-message'] : styles['other-message']}`}
                        >
                            <div className={styles['message-content']}>
                                <div className={styles['message-header']}>
                                    <span className={styles['sender-name']}>
                                        {isOwnMessage(message) ? 'You' : message.sender_email}
                                    </span>
                                    <span className={styles['message-time']}>
                                        {formatTime(message.created_at)}
                                    </span>
                                </div>
                                <div className={styles['message-text']}>
                                    {message.is_deleted ? (
                                        <em className={styles['deleted-message']}>This message was deleted</em>
                                    ) : (
                                        <>
                                            {message.content}
                                            {message.is_edited && (
                                                <span className={styles['edited-indicator']}> (edited)</span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className={styles['message-input-container']} onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className={styles['message-input']}
                    disabled={!selectedRoom}
                />
                <button
                    type="submit"
                    className={styles['send-button']}
                    disabled={!newMessage.trim() || !selectedRoom}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatWindow; 