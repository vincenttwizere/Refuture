import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Search, 
  User, 
  Clock, 
  Check, 
  CheckCheck,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Mail,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { messagesAPI } from '../../services/api';
import { useUsers } from '../../hooks/useUsers';
import { interviewsAPI } from '../../services/api';

const MessageCenter = ({ isOpen, onClose, selectedUser = null, preSelectedRecipient = null }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const { users, loading: usersLoading } = useUsers();

  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [newMessageTitle, setNewMessageTitle] = useState('');
  const [newMessageRecipientEmail, setNewMessageRecipientEmail] = useState('');

  // Interview booking modal state for refugees
  const [showBookInterviewModal, setShowBookInterviewModal] = useState(false);
  const [bookInterviewProvider, setBookInterviewProvider] = useState(null);
  const [bookInterviewDate, setBookInterviewDate] = useState('');
  const [bookInterviewTime, setBookInterviewTime] = useState('');
  const [bookInterviewMessage, setBookInterviewMessage] = useState('');
  const [bookInterviewLoading, setBookInterviewLoading] = useState(false);
  const [bookInterviewError, setBookInterviewError] = useState(null);
  const [bookInterviewSuccess, setBookInterviewSuccess] = useState('');

  // Fetch conversations and messages
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // If a user is selected (e.g., from profile), start conversation
  useEffect(() => {
    if (selectedUser && isOpen) {
      startConversation(selectedUser);
    }
  }, [selectedUser, isOpen]);

  // If a recipient is pre-selected (e.g., from profile), open new message form
  useEffect(() => {
    if (preSelectedRecipient && isOpen) {
      setNewMessageRecipient(preSelectedRecipient._id);
      setShowNewMessageForm(true);
    }
  }, [preSelectedRecipient, isOpen]);

  // Poll for new messages every 5 seconds when open
  useEffect(() => {
    if (!isOpen) return;
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getAll();
      const allMessages = response.data.messages || [];
      
      // Group messages by conversation (other user)
      const conversationMap = new Map();
      
      allMessages.forEach(message => {
        const otherUserId = message.sender === user._id ? message.recipient : message.sender;
        const otherUserName = message.sender === user._id ? message.recipientName : message.senderName;
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            userId: otherUserId,
            userName: otherUserName,
            lastMessage: message.content,
            lastMessageTime: message.createdAt,
            unreadCount: 0,
            messages: []
          });
        }
        
        const conversation = conversationMap.get(otherUserId);
        conversation.messages.push(message);
        
        // Update unread count
        if (!message.isRead && message.recipient === user._id) {
          conversation.unreadCount++;
        }
        
        // Update last message
        if (new Date(message.createdAt) > new Date(conversation.lastMessageTime)) {
          conversation.lastMessage = message.content;
          conversation.lastMessageTime = message.createdAt;
        }
      });
      
      // Convert to array and sort by last message time
      const conversationsArray = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      
      setConversations(conversationsArray);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = (otherUser) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(conv => conv.userId === otherUser._id);
    
    if (existingConversation) {
      setSelectedConversation(existingConversation);
      setMessages(existingConversation.messages);
    } else {
      // Create new conversation
      const newConversation = {
        userId: otherUser._id,
        userName: `${otherUser.firstName} ${otherUser.lastName}`,
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: 0,
        messages: []
      };
      setSelectedConversation(newConversation);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const messageData = {
        recipient: selectedConversation.userId,
        content: newMessage.trim(),
        metadata: {
          type: 'direct_message'
        }
      };

      const response = await messagesAPI.send(messageData);
      const sentMessage = response.data.message;
      
      // Add to messages
      setMessages(prev => [...prev, sentMessage]);
      
      // Update conversation
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.userId === selectedConversation.userId 
            ? { ...conv, lastMessage: newMessage.trim(), lastMessageTime: new Date() }
            : conv
        );
        return updated;
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendNewMessage = async () => {
    if (!newMessageContent.trim() || (!newMessageRecipient && !newMessageRecipientEmail)) {
      console.error('Missing required fields:', {
        content: newMessageContent.trim(),
        recipient: newMessageRecipient,
        recipientEmail: newMessageRecipientEmail
      });
      return;
    }

    try {
      let recipientToSend = newMessageRecipient;
      let recipientUser = null;
      if (newMessageRecipientEmail) {
        recipientToSend = newMessageRecipientEmail.trim();
      } else {
        recipientUser = users.find(u => u._id === newMessageRecipient);
        if (!recipientUser) {
          console.error('Recipient user not found in users list:', newMessageRecipient);
          alert('Recipient not found. Please try again.');
          return;
        }
      }

      const messageData = {
        recipient: recipientToSend,
        content: newMessageContent.trim(),
        metadata: {
          type: 'direct_message',
          title: newMessageTitle.trim() || 'New Message'
        }
      };

      console.log('Sending message data:', messageData);
      const response = await messagesAPI.send(messageData);
      console.log('Message sent successfully:', response.data);
      const sentMessage = response.data.message;

      // Create new conversation
      const newConversation = {
        userId: recipientToSend,
        userName: recipientUser ? `${recipientUser.firstName} ${recipientUser.lastName}` : recipientToSend,
        lastMessage: newMessageContent.trim(),
        lastMessageTime: new Date(),
        unreadCount: 0,
        messages: [sentMessage]
      };

      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      setMessages([sentMessage]);
      setShowNewMessageForm(false);
      setNewMessageRecipient('');
      setNewMessageRecipientEmail('');
      setNewMessageContent('');
      setNewMessageTitle('');
    } catch (error) {
      console.error('Error sending new message:', error);
      alert('Failed to send message. Please check the email address or try again.');
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await messagesAPI.markAsRead(messageId);
      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // When a conversation is opened, mark all unread messages as read
  const openConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages(conversation.messages);
    // Mark unread messages as read
    conversation.messages
      .filter(msg => !msg.isRead && msg.recipient === user._id)
      .forEach(msg => markAsRead(msg._id));
  };

  const openBookInterviewModal = (provider) => {
    setBookInterviewProvider(provider);
    setBookInterviewDate('');
    setBookInterviewTime('');
    setBookInterviewMessage('');
    setBookInterviewError(null);
    setBookInterviewSuccess('');
    setShowBookInterviewModal(true);
  };
  const closeBookInterviewModal = () => {
    setShowBookInterviewModal(false);
    setBookInterviewProvider(null);
    setBookInterviewDate('');
    setBookInterviewTime('');
    setBookInterviewMessage('');
    setBookInterviewError(null);
    setBookInterviewSuccess('');
  };
  const handleBookInterview = async (e) => {
    e.preventDefault();
    if (!bookInterviewDate || !bookInterviewTime) {
      setBookInterviewError('Please select date and time.');
      return;
    }
    setBookInterviewLoading(true);
    setBookInterviewError(null);
    setBookInterviewSuccess('');
    try {
      const dateTime = new Date(`${bookInterviewDate}T${bookInterviewTime}`);
      await interviewsAPI.create({
        provider: bookInterviewProvider._id,
        refugee: user._id,
        date: dateTime,
        message: bookInterviewMessage
      });
      setBookInterviewSuccess('Interview booked successfully!');
      setTimeout(() => closeBookInterviewModal(), 2000);
    } catch (err) {
      setBookInterviewError(err.response?.data?.message || 'Failed to book interview');
    } finally {
      setBookInterviewLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            {(selectedConversation || showNewMessageForm) && (
              <button
                onClick={() => {
                  if (selectedConversation) {
                    setSelectedConversation(null);
                    setMessages([]);
                  } else {
                    setShowNewMessageForm(false);
                    setNewMessageRecipient('');
                    setNewMessageContent('');
                    setNewMessageTitle('');
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold">
              {selectedConversation ? `Chat with ${selectedConversation.userName}` : 
               showNewMessageForm ? 'New Message' : 'Messages'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex">
          {/* Conversations List */}
          {!selectedConversation && !showNewMessageForm && (
            <div className="w-1/3 border-r flex flex-col">
              {/* Search and New Conversation */}
              <div className="p-4 border-b space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowNewMessageForm(true)}
                  className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Conversation
                </button>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.userId}
                      onClick={() => openConversation(conversation)}
                      className="p-4 hover:bg-gray-50 cursor-pointer border-b"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {conversation.userName}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">
                            {new Date(conversation.lastMessageTime).toLocaleDateString()}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="inline-block bg-blue-500 text-white text-xs rounded-full px-2 py-1 mt-1">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? 'No conversations found' : 'No messages yet'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Area */}
          {selectedConversation && !showNewMessageForm && (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {selectedConversation.userName}
                      </h3>
                      <p className="text-sm text-gray-500">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-200 rounded">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded">
                      <Video className="h-4 w-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded">
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.sender === user._id;
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-between mt-1 text-xs ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {isOwnMessage && (
                            <span>
                              {message.isRead ? (
                                <CheckCheck className="h-3 w-3 inline" />
                              ) : (
                                <Check className="h-3 w-3 inline" />
                              )}
                            </span>
                          )}
                        </div>
                        {message.metadata && message.metadata.type === 'preselection' && message.recipient === user._id && (
                          <button onClick={() => openBookInterviewModal(message.sender)} className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Book Interview</button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="1"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* New Message Form */}
          {showNewMessageForm && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-medium text-gray-900">Send a new message</h3>
              </div>
              
              <div className="flex-1 p-4 space-y-4">
                {/* Recipient Selection or Title */}
                {preSelectedRecipient ? (
                  // Show recipient name and title field when recipient is pre-selected
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To:
                      </label>
                      <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700">
                        {preSelectedRecipient.firstName} {preSelectedRecipient.lastName} ({preSelectedRecipient.email})
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason/Title:
                      </label>
                      <input
                        type="text"
                        value={newMessageTitle}
                        onChange={(e) => setNewMessageTitle(e.target.value)}
                        placeholder="Enter reason or title for this message..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                ) : (
                  // Show recipient selection when no recipient is pre-selected
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To (select user or enter email):
                      </label>
                      <select
                        value={newMessageRecipient}
                        onChange={(e) => setNewMessageRecipient(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                        disabled={!!newMessageRecipientEmail}
                      >
                        <option value="">Select a recipient...</option>
                        {users
                          .filter(u => u._id !== user._id && u.role === 'refugee')
                          .map((userItem) => (
                            <option key={userItem._id} value={userItem._id}>
                              {userItem.firstName} {userItem.lastName} ({userItem.email})
                            </option>
                          ))}
                      </select>
                      <div className="text-center text-xs text-gray-400 mb-2">or</div>
                      <input
                        type="email"
                        value={newMessageRecipientEmail}
                        onChange={e => setNewMessageRecipientEmail(e.target.value)}
                        placeholder="Enter recipient's email address"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!!newMessageRecipient}
                      />
                      <div className="text-xs text-gray-500 mt-1">If you enter an email, the dropdown will be disabled and vice versa.</div>
                    </div>
                  </>
                )}

                {/* Message Content */}
                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message:
                  </label>
                  <textarea
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="8"
                  />
                </div>

                {/* Send Button */}
                <div className="flex justify-end">
                  <button
                    onClick={sendNewMessage}
                    disabled={!newMessageContent.trim() || (!newMessageRecipient && !newMessageRecipientEmail)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showBookInterviewModal && bookInterviewProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Book Interview with {bookInterviewProvider.firstName} {bookInterviewProvider.lastName}</h2>
            <form onSubmit={handleBookInterview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" value={bookInterviewDate} onChange={e => setBookInterviewDate(e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input type="time" value={bookInterviewTime} onChange={e => setBookInterviewTime(e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message (optional)</label>
                <textarea value={bookInterviewMessage} onChange={e => setBookInterviewMessage(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} />
              </div>
              {bookInterviewError && <div className="text-red-600 text-sm">{bookInterviewError}</div>}
              {bookInterviewSuccess && <div className="text-green-600 text-sm">{bookInterviewSuccess}</div>}
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={closeBookInterviewModal} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" disabled={bookInterviewLoading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">{bookInterviewLoading ? 'Booking...' : 'Book Interview'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageCenter; 