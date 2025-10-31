import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { 
  MessageCircle, Mic, Video, Phone, Image, FileText, MapPin, UserPlus, 
  Settings, Search, MoreVertical, ThumbsUp, Heart, Send, Paperclip,
  Smile, Pin, Star, Edit2, Trash2, Users, Plus, Hash, ChevronLeft, Home
} from 'lucide-react';
import './chat.css';

const socket = io('http://localhost:5000');

const ChatApp = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat-list');
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showReactions, setShowReactions] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [callState, setCallState] = useState('idle');
  const [createGroupModal, setCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [showAddUserOverlay, setShowAddUserOverlay] = useState(false);
  const [usersToAdd, setUsersToAdd] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem('token');
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  // Home button handler
  const handleHomeClick = () => {
    navigate('/blogfeature');
  };

  // Add user overlay handlers
  const handleAddUserClick = () => {
    setShowAddUserOverlay(true);
  };

  const handleUserSelect = (user) => {
    setUsersToAdd(prev => {
      const isSelected = prev.some(u => u._id === user._id);
      if (isSelected) {
        return prev.filter(u => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleStartChatWithSelectedUsers = () => {
    if (usersToAdd.length === 1) {
      // Start individual chat with one person
      startChat({ ...usersToAdd[0], isGroup: false });
    } else if (usersToAdd.length > 1) {
      // Create group chat with multiple people
      setGroupName('');
      setSelectedGroupMembers(usersToAdd.map(user => user._id));
      setCreateGroupModal(true);
    }
    setShowAddUserOverlay(false);
    setUsersToAdd([]);
  };

  // Fetch data on mount
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [usersRes, groupsRes] = await Promise.all([
          axios.get('/api/users'),
          axios.get('/api/groups')
        ]);
        
        // Add isGroup flag to distinguish chat types
        const usersWithType = usersRes.data.map(user => ({
          ...user,
          isGroup: false,
          type: 'individual'
        }));
        
        const groupsWithType = groupsRes.data.map(group => ({
          ...group,
          isGroup: true,
          type: 'group'
        }));

        setUsers(usersWithType);
        setGroups(groupsWithType);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();

    // Socket events
    socket.on('connect', () => socket.emit('join', { token }));
    socket.on('message', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('typing', (data) => setTypingUsers(prev => [...new Set([...prev, data.userId])]));
    socket.on('stopTyping', (data) => setTypingUsers(prev => prev.filter(id => id !== data.userId)));

    return () => socket.off();
  }, []);

  // Load messages
  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          const endpoint = selectedChat.isGroup 
            ? `/api/messages/group/${selectedChat.id}` 
            : `/api/messages/${selectedChat.id}`;
          const res = await axios.get(endpoint);
          setMessages(res.data);
        } catch (err) {
          console.error('Error fetching messages:', err);
        }
      };
      fetchMessages();
    }
  }, [selectedChat]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing indicator
  useEffect(() => {
    let timeout;
    if (newMessage && selectedChat) {
      socket.emit('typing', { chatId: selectedChat.id, isGroup: selectedChat.isGroup });
      timeout = setTimeout(() => socket.emit('stopTyping', { chatId: selectedChat.id, isGroup: selectedChat.isGroup }), 2000);
    }
    return () => clearTimeout(timeout);
  }, [newMessage, selectedChat]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const msg = { 
      text: newMessage, 
      receiverId: selectedChat.id,
      isGroup: selectedChat.isGroup 
    };
    socket.emit('message', msg);
    setNewMessage('');
    setShowEmojis(false);
  };

  // Start chat
  const startChat = (chat) => {
    setSelectedChat(chat);
    setActiveTab('chat');
  };

  // Create group
  const createGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/groups', { 
        name: groupName, 
        members: selectedGroupMembers 
      });
      
      const newGroup = {
        ...res.data,
        isGroup: true,
        type: 'group'
      };
      
      setGroups(prev => [...prev, newGroup]);
      setCreateGroupModal(false);
      setGroupName('');
      setSelectedGroupMembers([]);
      
      // Start chat with the newly created group
      startChat(newGroup);
    } catch (err) {
      console.error('Error creating group:', err);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  // Get group members count text
  const getGroupMembersText = (group) => {
    const memberCount = group.members ? group.members.length : group.memberCount || 0;
    return `${memberCount} ${memberCount === 1 ? 'member' : 'members'}`;
  };

  // Get last message preview
  const getLastMessagePreview = (chat) => {
    if (chat.lastMessage) {
      return chat.lastMessage.text || 'Media message';
    }
    return chat.isGroup ? 'Group created' : 'Say hello!';
  };

  // Get online status for individual chats
  const getStatusText = (chat) => {
    if (chat.isGroup) {
      return getGroupMembersText(chat);
    }
    return chat.isOnline ? 'Online' : 'Last seen recently';
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        socket.emit('message', { 
          audio: audioUrl, 
          receiverId: selectedChat.id, 
          isGroup: selectedChat.isGroup 
        });
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  // File upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;

    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('message', { 
        file: { name: file.name, url: reader.result, type: file.type }, 
        receiverId: selectedChat.id, 
        isGroup: selectedChat.isGroup 
      });
    };
    reader.readAsDataURL(file);
    fileInputRef.current.value = '';
  };

  // Message actions
  const reactToMessage = (messageId, emoji) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, reactions: [...(msg.reactions || []), { emoji, user: 'me' }] }
        : msg
    ));
    setShowReactions(null);
  };

  const toggleStar = (messageId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, starred: !msg.starred } : msg
    ));
  };

  const deleteMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const editMessage = (message) => {
    setEditingMessage(message);
    setNewMessage(message.text);
  };

  // Render message bubble
  const renderMessage = (msg) => (
    <div key={msg._id || msg.id} className={`message ${msg.sender?._id === localStorage.getItem('userId') ? 'sent' : 'received'}`}>
      <div className="message-bubble">
        {msg.audio ? (
          <div className="voice-message">
            <div className="waveform">
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ height: `${Math.random() * 20 + 10}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <audio controls src={msg.audio} />
          </div>
        ) : msg.file ? (
          <div className="media-message">
            {msg.file.type.startsWith('image/') ? (
              <img src={msg.file.url} alt="Media" />
            ) : (
              <a href={msg.file.url} download={msg.file.name} className="file-link">
                <FileText size={20} /> {msg.file.name}
              </a>
            )}
          </div>
        ) : (
          <div className="message-text">
            {msg.edited && <span className="edited">(edited)</span>}
            {msg.text}
          </div>
        )}
        
        <span className="message-time">
          {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        
        {/* Read Receipts - Only for individual chats */}
        {!selectedChat?.isGroup && msg.sender?._id === localStorage.getItem('userId') && (
          <div className="read-receipt" />
        )}
        
        {/* Reactions */}
        {msg.reactions?.length > 0 && (
          <div className="message-reactions">
            {[...new Set(msg.reactions.map(r => r.emoji))].map(emoji => 
              <span key={emoji}>
                {emoji} {msg.reactions.filter(r => r.emoji === emoji).length}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Message Actions */}
      <div className="message-actions">
        <button onClick={() => setShowReactions(msg._id || msg.id)}>
          <MoreVertical size={16} />
        </button>
        <button onClick={() => toggleStar(msg._id || msg.id)}>
          <Star size={16} fill={msg.starred ? "currentColor" : "none"} />
        </button>
        {msg.sender?._id === localStorage.getItem('userId') && (
          <>
            <button onClick={() => editMessage(msg)}>
              <Edit2 size={16} />
            </button>
            <button onClick={() => deleteMessage(msg._id || msg.id)}>
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>

      {showReactions === (msg._id || msg.id) && (
        <div className="reaction-picker">
          <button onClick={() => reactToMessage(msg._id || msg.id, '👍')}>
            <ThumbsUp size={20} />
          </button>
          <button onClick={() => reactToMessage(msg._id || msg.id, '❤️')}>
            <Heart size={20} />
          </button>
          <button onClick={() => reactToMessage(msg._id || msg.id, '😂')}>😂</button>
          <button onClick={() => reactToMessage(msg._id || msg.id, '😮')}>😮</button>
          <button onClick={() => reactToMessage(msg._id || msg.id, '😢')}>😢</button>
          <button onClick={() => reactToMessage(msg._id || msg.id, '😠')}>😠</button>
        </div>
      )}
    </div>
  );

  // Render chat list item
  const renderChatItem = (chat) => (
    <div 
      key={chat._id || chat.id} 
      className="chat-item" 
      onClick={() => startChat(chat)}
    >
      <div className={`chat-avatar ${chat.isGroup ? 'group-avatar' : ''}`}>
        {chat.isGroup ? '👥' : getUserInitials(chat.username || chat.name)}
      </div>
      <div className="chat-info">
        <h5>{chat.isGroup ? chat.name : chat.username}</h5>
        <p>{getLastMessagePreview(chat)}</p>
      </div>
      <div className="chat-meta">
        <span>{new Date(chat.lastMessage?.timestamp || chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        {chat.unreadCount > 0 && (
          <span className="unread">{chat.unreadCount}</span>
        )}
      </div>
    </div>
  );

  // Render chat list
  const renderChatList = () => (
    <div className={`chat-list ${activeTab === 'chat' ? '' : 'open'}`}>
      <div className="chat-header">
        <button className="home-btn" onClick={handleHomeClick}>
          <Home size={24} />
          <span>Home</span>
        </button>
        <div className="header-actions">
          <button onClick={handleAddUserClick} className="add-user-btn">
            <UserPlus size={20} />
          </button>
        </div>
      </div>

      <div className="chat-search">
        <Search size={20} />
        <input 
          type="text" 
          placeholder="Search users or groups..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <button className="create-group-btn animated-1" onClick={() => setCreateGroupModal(true)}>
        <Plus size={16} /> New Group
      </button>

      {/* Combined Chats List - Both Groups and Individual Chats */}
      <div className="chats-section">
        <h4>All Chats</h4>
        
        {/* Groups Section */}
        {groups
          .filter(group => group.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(renderChatItem)}
        
        {/* Individual Chats Section */}
        {users
          .filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(renderChatItem)}
          
        {/* Empty State */}
        {groups.length === 0 && users.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h5>No chats yet</h5>
            <p>Start a conversation by adding users or creating a group</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render messages
  const renderMessages = () => (
    <div className="messages-container">
      <div className="chat-header">
        <button className="back-btn" onClick={() => setActiveTab('chat-list')}>
          <ChevronLeft size={24} />
        </button>
        <div className="contact-info">
          <div className={`avatar ${selectedChat?.isGroup ? 'group-avatar' : ''}`}>
            {selectedChat?.isGroup ? '👥' : getUserInitials(selectedChat?.username)}
          </div>
          <div>
            <h3>{selectedChat?.isGroup ? selectedChat.name : selectedChat?.username}</h3>
            <span className="status">
              {selectedChat?.isGroup 
                ? getGroupMembersText(selectedChat)
                : 'Online'
              }
            </span>
          </div>
        </div>
        <div className="header-actions">
          {selectedChat?.isGroup && (
            <button title="Group Info">
              <Users size={20} />
            </button>
          )}
          <button title="Video Call">
            <Video size={20} />
          </button>
          <button title="Voice Call">
            <Phone size={20} />
          </button>
          <button title="More Options">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
      
      <div className="messages">
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <div className="typing-dots"></div>
            <span>
              {selectedChat?.isGroup 
                ? `${typingUsers.length} people are typing...`
                : 'Typing...'
              }
            </span>
          </div>
        )}
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-input">
        <button type="button" onClick={() => fileInputRef.current.click()}>
          <Paperclip size={20} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          accept="image/*,video/*,.pdf,.doc,.docx"
        />
        
        <div className="message-input-container">
          <button 
            type="button" 
            className="emoji-btn"
            onClick={() => setShowEmojis(!showEmojis)}
          >
            <Smile size={20} />
          </button>
          {showEmojis && (
            <div className="emoji-picker">
              {['😊', '😂', '❤️', '👍', '🎉', '🔥', '👏'].map(emoji => (
                <button 
                  key={emoji} 
                  type="button"
                  onClick={() => setNewMessage(prev => prev + emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${selectedChat?.isGroup ? selectedChat.name : selectedChat?.username}`}
          />
        </div>
        
        {recording ? (
          <button type="button" onClick={stopRecording} className="record-btn stop">
            ⏹️
          </button>
        ) : (
          <button type="button" onClick={startRecording} className="record-btn">
            <Mic size={20} />
          </button>
        )}
        
        <button type="submit">
          <Send size={20} />
        </button>
      </form>
    </div>
  );

  // Create Group Modal
  const renderCreateGroupModal = () => (
    <div className="modal-overlay" onClick={() => setCreateGroupModal(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Create New Group</h3>
        <form onSubmit={createGroup}>
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
          <h4>Add Members ({selectedGroupMembers.length} selected)</h4>
          <div className="members-list">
            {users.map(user => (
              <label key={user._id} className="member-checkbox">
                <input
                  type="checkbox"
                  value={user._id}
                  checked={selectedGroupMembers.includes(user._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedGroupMembers(prev => [...prev, user._id]);
                    } else {
                      setSelectedGroupMembers(prev => prev.filter(id => id !== user._id));
                    }
                  }}
                />
                <span className="user-avatar-small">
                  {getUserInitials(user.username)}
                </span>
                {user.username}
              </label>
            ))}
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => setCreateGroupModal(false)}>
              Cancel
            </button>
            <button type="submit" disabled={selectedGroupMembers.length < 2}>
              Create Group ({selectedGroupMembers.length} members)
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Add User Overlay
  const renderAddUserOverlay = () => (
    <div className="modal-overlay" onClick={() => setShowAddUserOverlay(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Start New Chat</h3>
        <p className="modal-subtitle">Select people to chat with</p>
        <div className="users-list">
          {users.map(user => (
            <div 
              key={user._id} 
              className={`user-item ${usersToAdd.some(u => u._id === user._id) ? 'selected' : ''}`}
              onClick={() => handleUserSelect(user)}
            >
              <div className="user-avatar">
                {getUserInitials(user.username)}
              </div>
              <div className="user-info">
                <h5>{user.username}</h5>
                <p>Available</p>
              </div>
              <div className="user-checkbox">
                <input
                  type="checkbox"
                  checked={usersToAdd.some(u => u._id === user._id)}
                  onChange={() => {}}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button type="button" onClick={() => setShowAddUserOverlay(false)}>
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleStartChatWithSelectedUsers}
            disabled={usersToAdd.length === 0}
          >
            {usersToAdd.length === 1 
              ? `Chat with ${usersToAdd[0]?.username}`
              : `Create Group (${usersToAdd.length})`
            }
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="chat-app">
      {renderChatList()}
      {activeTab === 'chat' && renderMessages()}
      {createGroupModal && renderCreateGroupModal()}
      {showAddUserOverlay && renderAddUserOverlay()}
      
      <footer className="footer-nav">
        <button className={activeTab === 'chat-list' || activeTab === 'chat' ? 'active' : ''}>
          <MessageCircle size={20} />
          <span>Chats</span>
        </button>
        <button onClick={handleAddUserClick}>
          <UserPlus size={20} />
          <span>New Chat</span>
        </button>
        <button>
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </footer>
    </div>
  );
};

export default ChatApp;