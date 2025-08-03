import React from 'react';
import styles from './ChatSidebar.module.css';

const ChatSidebar = ({ chatRooms, selectedRoom, onRoomSelect, onCreateChat, loading }) => {
    const getRoomDisplayName = (room) => {
        if (room.room_type === 'group') {
            return room.name;
        } else {
            // For direct messages, show the other person's email
            // This would need to be enhanced to show actual user names
            return `Direct Message`;
        }
    };

    const getRoomIcon = (room) => {
        return room.room_type === 'group' ? '👥' : '👤';
    };

    if (loading) {
        return (
            <div className={styles['chat-sidebar']}>
                <div className={styles['sidebar-header']}>
                    <h3>Chats</h3>
                    <button 
                        className={styles['new-chat-btn']}
                        onClick={onCreateChat}
                        disabled
                    >
                        +
                    </button>
                </div>
                <div className={styles.loading}>Loading chats...</div>
            </div>
        );
    }

    return (
        <div className={styles['chat-sidebar']}>
            <div className={styles['sidebar-header']}>
                <h3>Chats</h3>
                <button 
                    className={styles['new-chat-btn']}
                    onClick={onCreateChat}
                    title="New Chat"
                >
                    +
                </button>
            </div>
            
            <div className={styles['chat-rooms-list']}>
                {chatRooms.length === 0 ? (
                    <div className={styles['no-chats']}>
                        <p>No chats yet</p>
                        <button 
                            className={styles['start-chat-btn']}
                            onClick={onCreateChat}
                        >
                            Start a conversation
                        </button>
                    </div>
                ) : (
                    chatRooms.map(room => (
                        <div
                            key={room.id}
                            className={`${styles['chat-room-item']} ${selectedRoom?.id === room.id ? styles.selected : ''}`}
                            onClick={() => onRoomSelect(room)}
                        >
                            <div className={styles['room-icon']}>{getRoomIcon(room)}</div>
                            <div className={styles['room-info']}>
                                <div className={styles['room-name']}>{getRoomDisplayName(room)}</div>
                                <div className={styles['room-type']}>
                                    {room.room_type === 'group' ? 'Group' : 'Direct'}
                                </div>
                            </div>
                            {room.message_count > 0 && (
                                <div className={styles['message-count']}>{room.message_count}</div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatSidebar; 