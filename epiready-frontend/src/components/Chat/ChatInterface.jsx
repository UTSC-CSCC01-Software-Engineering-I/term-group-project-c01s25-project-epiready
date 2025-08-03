import React, { useState, useEffect, useRef } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import CreateChatModal from './CreateChatModal';
import { useGlobal } from '../../LoggedIn';
import styles from './ChatInterface.module.css';

const ChatInterface = () => {
    const [chatRooms, setChatRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const { loggedIn } = useGlobal();
    const socketRef = useRef(null);

    useEffect(() => {
        if (loggedIn) {
            fetchChatRooms();
            initializeSocket();
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [loggedIn]);

    const initializeSocket = () => {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        // Import socket.io-client dynamically
        import('socket.io-client').then(({ default: io }) => {
            socketRef.current = io(`${import.meta.env.VITE_BACKEND_URL}`, {
                auth: { token: `${token}` }
            });

            socketRef.current.on('connect', () => {
                console.log('Connected to chat server');
            });

            socketRef.current.on('new_message', (message) => {
                setMessages(prev => [...prev, message]);
            });

            socketRef.current.on('disconnect', () => {
                console.log('Disconnected from chat server');
            });
        });
    };

    const fetchChatRooms = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/rooms`, {
                headers: {
                    "Authorization": `${token}`
                }
            });

            if (response.ok) {
                const rooms = await response.json();
                setChatRooms(rooms);
            }
        } catch (error) {
            console.error('Error fetching chat rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoomSelect = async (room) => {
        setSelectedRoom(room);
        await fetchMessages(room.id);
        
        // Join the chat room via socket
        if (socketRef.current) {
            socketRef.current.emit('join_chat_room', {
                room_id: room.id,
                token: `${sessionStorage.getItem("token")}`
            });
        }
    };

    const fetchMessages = async (roomId) => {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/messages?room_id=${roomId}`, {
                headers: {
                    "Authorization": `${token}`
                }
            });

            if (response.ok) {
                const messagesData = await response.json();
                setMessages(messagesData.reverse());
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async (content) => {
        if (!selectedRoom || !content.trim()) return;

        const token = sessionStorage.getItem("token");
        if (!token) return;

        try {
            // Send via socket for real-time
            if (socketRef.current) {
                socketRef.current.emit('send_message', {
                    room_id: selectedRoom.id,
                    content: content.trim(),
                    message_type: 'text',
                    token: `${token}`
                });
            }

            // Also send via REST API for persistence
            // const response = await fetch("http://127.0.0.1:5000/api/chat/messages", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //         "Authorization": `${token}`
            //     },
            //     body: JSON.stringify({
            //         room_id: selectedRoom.id,
            //         content: content.trim(),
            //         message_type: 'text'
            //     })
            // });

            // if (!response.ok) {
            //     console.error('Failed to send message via REST API');
            // }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleCreateChat = () => {
        setShowCreateModal(true);
    };

    const handleChatCreated = (newRoom) => {
        setChatRooms(prev => [...prev, newRoom]);
        setShowCreateModal(false);
        handleRoomSelect(newRoom);
    };

    if (!loggedIn) {
        return <div className="chat-container">Please log in to access chat.</div>;
    }

    return (
        <div className={styles['chat-container']}>
            <ChatSidebar
                chatRooms={chatRooms}
                selectedRoom={selectedRoom}
                onRoomSelect={handleRoomSelect}
                onCreateChat={handleCreateChat}
                loading={loading}
            />
            <ChatWindow
                selectedRoom={selectedRoom}
                messages={messages}
                onSendMessage={sendMessage}
            />
            {showCreateModal && (
                <CreateChatModal
                    onClose={() => setShowCreateModal(false)}
                    onChatCreated={handleChatCreated}
                />
            )}
        </div>
    );
};

export default ChatInterface; 