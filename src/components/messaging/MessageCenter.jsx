import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Mail, MessageCircle } from 'lucide-react';
import { messagesAPI } from '../../services/api';

const MessageCenter = ({ isOpen, onClose, preSelectedRecipient = null }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newMessageRecipientEmail, setNewMessageRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    const grouped = messages.reduce((acc, message) => {
      const senderId = message.senderId?._id || message.senderId;
      const recipientId = message.recipientId?._id || message.recipientId;
      
      // Normalize IDs for comparison
      const normalizedSenderId = typeof senderId === 'string' ? senderId : senderId?.toString();
      const normalizedRecipientId = typeof recipientId === 'string' ? recipientId : recipientId?.toString();
      
      if (!acc[senderId]) {
        acc[senderId] = {
          senderId: senderId,
          senderName: message.senderId?.firstName && message.senderId?.lastName 
            ? `${message.senderId.firstName} ${message.senderId.lastName}`
            : message.senderId?.email || 'Unknown User',
          senderEmail: message.senderId?.email || '',
          messages: [],
          unreadCount: 0,
          lastMessage: null
        };
      }
      
      if (!acc[recipientId]) {
        acc[recipientId] = {
          senderId: recipientId,
          senderName: message.recipientId?.firstName && message.recipientId?.lastName 
            ? `${message.recipientId.firstName} ${message.recipientId.lastName}`
            : message.recipientId?.email || 'Unknown User',
          senderEmail: message.recipientId?.email || '',
          messages: [],
          unreadCount: 0,
          lastMessage: null
        };
      }
      
      acc[senderId].messages.push(message);
      acc[senderId].lastMessage = message;
      if (!message.isRead) acc[senderId].unreadCount++;
      
      acc[recipientId].messages.push(message);
      acc[recipientId].lastMessage = message;
      if (!message.isRead) acc[recipientId].unreadCount++;
      
      return acc;
    }, {});
    
    return Object.values(grouped).sort((a, b) => 
      new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)
    );
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages(conversation.messages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      const messageData = {
        content: newMessage,
        recipient: selectedConversation.senderId
      };

      const response = await messagesAPI.send(messageData);
      if (response.data.success) {
        setNewMessage('');
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const sendNewMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      const messageData = {
        content: newMessage
      };

      // If we have a preSelectedRecipient, use their ID
      if (preSelectedRecipient?._id) {
        messageData.recipient = preSelectedRecipient._id;
      } else if (newMessageRecipientEmail) {
        messageData.recipient = newMessageRecipientEmail;
      }

      const response = await messagesAPI.send(messageData);
      if (response.data.success) {
        setNewMessage('');
        setNewMessageRecipientEmail('');
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
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
                    key={conversation.senderId}
                    onClick={() => selectConversation(conversation)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.senderId === conversation.senderId
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
                          {conversation.senderName}
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
                        {selectedConversation.senderName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.senderEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.senderId?._id === selectedConversation.senderId
                          ? 'justify-start'
                          : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId?._id === selectedConversation.senderId
                            ? 'bg-gray-200 text-gray-900'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
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
                      <Send className="h-4 w-4" />
                      <span>Send</span>
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

                  <div className="space-y-3">
                    {preSelectedRecipient ? (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            To:
                          </label>
                          <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 mb-1 text-sm">
                            {preSelectedRecipient.firstName} {preSelectedRecipient.lastName} ({preSelectedRecipient.email})
                          </div>
                          <input
                            type="email"
                            value={newMessageRecipientEmail || preSelectedRecipient.email}
                            onChange={(e) => setNewMessageRecipientEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          To:
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="email"
                            value={newMessageRecipientEmail}
                            onChange={(e) => setNewMessageRecipientEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Message:
                      </label>
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
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
                      disabled={loading || (!newMessage.trim() && !newMessageRecipientEmail.trim())}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span>{loading ? 'Sending...' : 'Send Message'}</span>
                    </button>
                  </div>
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