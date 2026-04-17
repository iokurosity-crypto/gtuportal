import api from './axios';

// --- CONNECTION REQUESTS ---

export const sendConnectionRequest = async (fromUser, toUserId) => {
  try {
    console.log('🔗 Sending connection request to:', toUserId);
    
    const response = await api.post('/connections/request', { toUserId });
    const data = response.data;

    console.log('✅ Connection request sent successfully:', data);
    return data;
  } catch (error) {
    const errorData = error.response?.data;
    console.error('❌ Connection request failed:', {
      status: error.response?.status,
      message: errorData?.message || errorData?.error,
      data: errorData
    });
    throw new Error(errorData?.message || errorData?.error || 'Failed to send connection request');
  }
};

export const subscribeToIncomingRequests = (userId, callback) => {
  api.get('/connections/incoming')
    .then(res => callback(res.data))
    .catch(error => { console.error('Error:', error); callback([]); });
  return () => {};
};

export const acceptConnection = async (requestId) => {
  const response = await api.post(`/connections/${requestId}/accept`);
  return response.data;
};

export const rejectConnection = async (requestId) => {
  await api.delete(`/connections/${requestId}/reject`);
};

export const subscribeToConnections = (userId, callback) => {
  api.get('/connections')
    .then(res => callback(res.data))
    .catch(error => { console.error('Error:', error); callback([]); });
  return () => {};
};

export const subscribeToOutgoingRequests = (userId, callback) => {
  api.get('/connections/outgoing')
    .then(res => callback(res.data))
    .catch(error => { console.error('Error:', error); callback([]); });
  return () => {};
};

export const subscribeToActivities = (connectionPartnerIds, callback) => {
  if (!connectionPartnerIds || connectionPartnerIds.length === 0) {
    callback([]);
    return () => {};
  }
  
  // Use the correct endpoint with GET
  api.get('/activity/feed')
    .then(res => callback(res.data.activities || []))
    .catch(error => { console.error('Error:', error); callback([]); });
  return () => {};
};

export const sendMessage = async (chatId, senderId, text) => {
  const response = await api.post(`/chats/${chatId}/messages`, { text });
  return response.data;
};

export const subscribeToMessages = (chatId, callback) => {
  // Fetch messages immediately, then set up polling for new messages
  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      const raw = response.data;
      const list = Array.isArray(raw) ? raw : [];
      // Normalize to frontend shape
      const messages = list.map(m => ({
        id: m._id || m.id,
        text: m.text || m.content || '',
        senderId: (m.senderId && (m.senderId._id || m.senderId.id)) || m.senderId,
        sender: m.senderId && typeof m.senderId === 'object' ? {
          id: m.senderId._id || m.senderId.id,
          name: m.senderId.name,
          email: m.senderId.email,
          profilePhoto: m.senderId.profilePhoto || m.senderId.profilePicture || null,
        } : null,
        createdAt: m.createdAt || m.timestamp || null,
      }));
      callback(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      callback([]);
    }
  };

  // Fetch initially
  fetchMessages();

  // Set up polling every 3 seconds
  const intervalId = setInterval(fetchMessages, 3000);

  return () => clearInterval(intervalId);
};

export const getOrCreateChat = async (user1Id, user2Id) => {
  const response = await api.post('/chats/create', { user2Id });
  const data = response.data;
  return data.chatId;
};

export const subscribeToLastMessage = (userId, partnerId, callback) => {
  api.get(`/chats/${userId}/${partnerId}/last-message`)
    .then(res => callback(res.data))
    .catch(error => { console.error('Error:', error); callback(null); });
  return () => {};
};

export const subscribeToIncomingMessages = (userId, callback) => {
  // Poll chats endpoint to get incoming messages
  // Note: Real-time notifications should use WebSocket/Socket.IO in production
  const intervalId = setInterval(async () => {
    try {
      const response = await api.get('/chats');
      let chats = response.data;
      chats = Array.isArray(chats) ? chats : [];
      
      // Collect all messages from all chats
      const allMessages = [];
      for (const chat of chats) {
        try {
          const msgsResponse = await api.get(`/chats/${chat._id}/messages`);
          const messages = msgsResponse.data;
          if (Array.isArray(messages)) {
            allMessages.push(...messages);
          }
        } catch (err) {
          console.warn('Failed to fetch messages for chat:', err);
        }
      }
      
      callback(allMessages);
    } catch (error) { 
      console.error('Error polling messages:', error); 
      callback([]);
    }
  }, 10000); // Poll every 10 seconds
  
  return () => clearInterval(intervalId);
};

export const getSuggestions = async (currentUserId) => {
  try {
    // Use recommendations endpoint instead
    const response = await api.get('/recommendations/alumni');
    return response.data;
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return [];
  }
};
