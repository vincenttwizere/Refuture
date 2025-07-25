import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Mail, MessageCircle } from 'lucide-react';
import { messagesAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MessageCenter = ({ isOpen, onClose, preSelectedRecipient = null }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newMessageRecipientEmail, setNewMessageRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      if (preSelectedRecipient) {
        setNewMessageRecipientEmail(preSelectedRecipient.email || '');
      }
    }
  }, [isOpen, preSelectedRecipient]);

  // Poll for new messages every 5 seconds when message center is open
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      fetchConversations();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all users for autocomplete
  useEffect(() => {
    if (isOpen) {
      usersAPI.getAll({ limit: 1000 })
        .then(res => {
          if (res.data.success) setAllUsers(res.data.users.filter(u => u._id !== user._id));
        })
        .catch(() => {});
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (userSearch) {
      setFilteredUsers(
        allUsers.filter(u =>
          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
          (u.firstName + ' ' + u.lastName).toLowerCase().includes(userSearch.toLowerCase())
        )
      );
      // Auto-select user if exact email match
      const exactMatch = allUsers.find(u => u.email.toLowerCase() === userSearch.toLowerCase());
      if (exactMatch) {
        setSelectedUser(exactMatch);
      } else {
        setSelectedUser(null);
      }
    } else {
      setFilteredUsers([]);
      setSelectedUser(null);
    }
  }, [userSearch, allUsers]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getAll();
      if (response.data.success) {
        const conversations = groupMessagesBySender(response.data.messages);
        setConversations(conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const groupMessagesBySender = (messages) => {
    const currentUserId = user?._id;
    
    // Filter messages to only include conversations where current user is involved
    const userMessages = messages.filter(message => {
      const senderId = message.sender?._id || message.sender;
      const recipientId = message.recipient?._id || message.recipient;
      return senderId === currentUserId || recipientId === currentUserId;
    });
    
    // Group messages by conversation (unique pairs of users)
    const conversations = {};
    
    userMessages.forEach(message => {
      const senderId = message.sender?._id || message.sender;
      const recipientId = message.recipient?._id || message.recipient;
      
      // Determine the other user in the conversation
      const otherUserId = senderId === currentUserId ? recipientId : senderId;
      const otherUserName = senderId === currentUserId 
        ? `${message.recipient?.firstName || ''} ${message.recipient?.lastName || ''}`.trim()
        : `${message.sender?.firstName || ''} ${message.sender?.lastName || ''}`.trim();
      const otherUserEmail = senderId === currentUserId 
        ? message.recipient?.email 
        : message.sender?.email;
      
      // Create a unique key for the conversation
      const conversationKey = [currentUserId, otherUserId].sort().join('-');
      
      if (!conversations[conversationKey]) {
        conversations[conversationKey] = {
          conversationKey,
          otherUserId,
          otherUserName: otherUserName || otherUserEmail || 'Unknown User',
          otherUserEmail,
          messages: [],
          unreadCount: 0,
          lastMessage: null
        };
      }
      
      conversations[conversationKey].messages.push(message);
      
      // Update last message
      if (!conversations[conversationKey].lastMessage || 
          new Date(message.createdAt) > new Date(conversations[conversationKey].lastMessage.createdAt)) {
        conversations[conversationKey].lastMessage = message;
      }
      
      // Count unread messages (messages sent to current user that are not read)
      if (recipientId === currentUserId && !message.isRead) {
        conversations[conversationKey].unreadCount++;
      }
    });
    
    // Convert to array and sort by last message date
    return Object.values(conversations).sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setMessages(conversation.messages || []);
    setError(null);
    
    // Mark unread messages as read
    if (conversation.unreadCount > 0) {
      try {
        const unreadMessages = conversation.messages.filter(message => {
          const recipientId = message.recipient?._id || message.recipient;
          return recipientId === user._id && !message.isRead;
        });
        
        // Mark each unread message as read
        for (const message of unreadMessages) {
          await messagesAPI.markAsRead(message._id);
        }
        
        // Refresh conversations to update unread counts
        await fetchConversations();
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  };

  const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id);
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    if (!selectedConversation?.otherUserId) {
      setError('No recipient selected. Please select a conversation.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const messageData = {
        content: newMessage.trim(),
        recipient: selectedConversation.otherUserId
      };
      
      const response = await messagesAPI.send(messageData);
      
      if (response.data.success) {
        setNewMessage('');
        // Refresh conversations to show the new message
        await fetchConversations();
        // Update the current conversation messages
        if (selectedConversation) {
          const updatedConversations = await messagesAPI.getAll();
          if (updatedConversations.data.success) {
            const conversations = groupMessagesBySender(updatedConversations.data.messages);
            const updatedConversation = conversations.find(c => c.conversationKey === selectedConversation.conversationKey);
            if (updatedConversation) {
              setSelectedConversation(updatedConversation);
              setMessages(updatedConversation.messages || []);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const sendNewMessage = async () => {
    if (!newMessage.trim()) return;
    setError('');
    
    let recipientValue = '';
    
    if (preSelectedRecipient && preSelectedRecipient._id) {
      recipientValue = preSelectedRecipient._id;
    } else if (selectedUser?._id) {
      recipientValue = selectedUser._id;
    } else if (newMessageRecipientEmail) {
      // Find user by email
      const userByEmail = allUsers.find(u => u.email.toLowerCase() === newMessageRecipientEmail.trim().toLowerCase());
      if (userByEmail) {
        recipientValue = userByEmail._id;
      } else {
        setError('User not found with this email address.');
        return;
      }
    }
    
    if (!recipientValue) {
      setError('Please select a recipient.');
      return;
    }
    
    if (!isValidObjectId(recipientValue)) {
      setError('Please select a valid user.');
      return;
    }
    
    try {
      setLoading(true);
      
      const messageData = {
        content: newMessage.trim(),
        recipient: recipientValue
      };
      
      const response = await messagesAPI.send(messageData);
      
      if (response.data.success) {
        setNewMessage('');
        setNewMessageRecipientEmail('');
        setSelectedUser(null);
        setUserSearch('');
        await fetchConversations();
      }
    } catch (error) {
      console.error('Error sending new message:', error);
      setError('Failed to send message: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Message Center</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversations Sidebar */}
          <div className="w-1/3 border-r border-gray-200 bg-gray-50">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Conversations</h3>
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.conversationKey}
                    onClick={() => selectConversation(conversation)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.conversationKey === conversation.conversationKey
                        ? 'bg-blue-100 border-blue-300'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.otherUserName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {selectedConversation.otherUserName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.otherUserEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const currentUserId = user?._id;
                    const messageSenderId = message.sender?._id || message.sender;
                    const isFromCurrentUser = messageSenderId === currentUserId;
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${
                          isFromCurrentUser ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isFromCurrentUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || !newMessage.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* New Message Form */
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-sm space-y-4">
                  <div className="text-center">
                    <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="text-base font-medium text-gray-900 mb-1">
                      Start a New Conversation
                    </h3>
                    <p className="text-sm text-gray-500">
                      Send a message to connect with someone
                    </p>
                  </div>

                  {!selectedConversation && (
                    <div className="space-y-3">
                      {preSelectedRecipient ? (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">To:</label>
                          <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 mb-1 text-sm">
                            {preSelectedRecipient.firstName} {preSelectedRecipient.lastName} ({preSelectedRecipient.email})
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">To:</label>
                          <input
                            type="text"
                            value={userSearch}
                            onChange={e => {
                              setUserSearch(e.target.value);
                              setSelectedUser(null);
                            }}
                            placeholder="Search by name or email..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            autoComplete="off"
                          />
                          {filteredUsers.length > 0 && (
                            <div className="border border-gray-200 rounded-lg bg-white shadow-lg mt-1 max-h-40 overflow-y-auto z-50">
                              {filteredUsers.map(u => (
                                <div
                                  key={u._id}
                                  className={`px-3 py-2 cursor-pointer hover:bg-blue-100 ${selectedUser?._id === u._id ? 'bg-blue-50' : ''}`}
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setUserSearch(u.firstName + ' ' + u.lastName + ' (' + u.email + ')');
                                    setFilteredUsers([]);
                                  }}
                                >
                                  {u.firstName} {u.lastName} ({u.email})
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Message:</label>
                        <textarea
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          placeholder="Type your message here..."
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          style={{ minHeight: '80px', maxHeight: '120px' }}
                        />
                      </div>
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                          <p className="text-red-800 text-xs">{error}</p>
                        </div>
                      )}
                      <button
                        onClick={sendNewMessage}
                        disabled={loading || !newMessage.trim()}
                        className={`w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2${(loading || !newMessage.trim() ? ' opacity-50 cursor-not-allowed' : '')}`}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Send</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCenter;