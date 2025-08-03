import React, { useState, useEffect } from 'react';
import styles from './CreateChatModal.module.css';

const CreateChatModal = ({ onClose, onChatCreated }) => {
    const [chatType, setChatType] = useState('direct');
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/users`, {
                headers: {
                    "Authorization": `${token}`
                }
            });

            if (response.ok) {
                const usersData = await response.json();
                setUsers(usersData);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleUserToggle = (userId) => {
        if (chatType === 'direct') {
            setSelectedUsers([userId]);
        } else {
            setSelectedUsers(prev => 
                prev.includes(userId) 
                    ? prev.filter(id => id !== userId)
                    : [...prev, userId]
            );
        }
    };

    const handleCreateChat = async () => {
        if (chatType === 'direct' && selectedUsers.length !== 1) {
            alert('Please select exactly one user for direct chat');
            return;
        }

        if (chatType === 'group' && (!groupName.trim() || selectedUsers.length === 0)) {
            alert('Please provide a group name and select at least one participant');
            return;
        }

        setLoading(true);
        const token = sessionStorage.getItem("token");
        if (!token) return;

        try {
            const endpoint = chatType === 'direct' ? '/direct' : '/group';
            const body = chatType === 'direct' 
                ? { other_user_id: selectedUsers[0] }
                : { name: groupName, participant_ids: selectedUsers };

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const newRoom = await response.json();
                onChatCreated(newRoom);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to create chat');
            }
        } catch (error) {
            console.error('Error creating chat:', error);
            alert('Failed to create chat');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles['modal-overlay']} onClick={onClose}>
            <div className={styles['modal-content']} onClick={e => e.stopPropagation()}>
                <div className={styles['modal-header']}>
                    <h2>Create New Chat</h2>
                    <button className={styles['close-button']} onClick={onClose}>×</button>
                </div>

                <div className={styles['modal-body']}>
                    <div className={styles['chat-type-selector']}>
                        <label>
                            <input
                                type="radio"
                                value="direct"
                                checked={chatType === 'direct'}
                                onChange={(e) => setChatType(e.target.value)}
                            />
                            Direct Message
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="group"
                                checked={chatType === 'group'}
                                onChange={(e) => setChatType(e.target.value)}
                            />
                            Group Chat
                        </label>
                    </div>

                    {chatType === 'group' && (
                        <div className={styles['group-name-input']}>
                            <label>Group Name:</label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Enter group name"
                                maxLength={100}
                            />
                        </div>
                    )}

                    <div className={styles['users-selection']}>
                        <h3>Select {chatType === 'direct' ? 'User' : 'Participants'}:</h3>
                        <div className={styles['users-list']}>
                            {users.map(user => (
                                <div
                                    key={user.id}
                                    className={`${styles['user-item']} ${selectedUsers.includes(user.id) ? styles.selected : ''}`}
                                    onClick={() => handleUserToggle(user.id)}
                                >
                                    <input
                                        type={chatType === 'direct' ? 'radio' : 'checkbox'}
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => handleUserToggle(user.id)}
                                    />
                                    <div className={styles['user-info']}>
                                        <span className={styles['user-email']}>{user.email}</span>
                                        <span className={styles['user-role']}>{user.role}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles['modal-footer']}>
                    <button 
                        className={styles['cancel-button']} 
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        className={styles['create-button']} 
                        onClick={handleCreateChat}
                        disabled={loading || 
                            (chatType === 'direct' && selectedUsers.length !== 1) ||
                            (chatType === 'group' && (!groupName.trim() || selectedUsers.length === 0))
                        }
                    >
                        {loading ? 'Creating...' : 'Create Chat'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateChatModal; 