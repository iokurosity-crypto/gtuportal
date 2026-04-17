import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  subscribeToIncomingRequests,
  subscribeToConnections,
  subscribeToActivities,
  subscribeToIncomingMessages,
  getSuggestions
} from "@/services/socialService";
import api from "@/services/axios";
import { useRealTime } from "@/contexts/RealTimeContext.jsx";
import { useLinkedInNotifications } from "@/components/LinkedInNotifications";

const NotificationContext = createContext(undefined);

// Utility function to validate MongoDB ObjectId format
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{24}$/i.test(id);
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useRealTime();
  const { addNotification } = useLinkedInNotifications();
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastRequestIds, setLastRequestIds] = useState(new Set());
  const [lastMessageIds, setLastMessageIds] = useState(new Set());
  const [senderData, setSenderData] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [failedUserIds, setFailedUserIds] = useState(new Set()); // Cache of users with failed lookups

  // Fetch backend notifications (MongoDB) + keep unread count correct
  const fetchNotifications = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const res = await api.get("/notifications");
      const nextUnread = Number(res.data?.unreadCount || 0);
      setUnreadCount(nextUnread);
    } catch (err) {
      console.warn("Failed to fetch notifications:", err?.message);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;

    let mounted = true;
    const callFetch = async () => {
      if (mounted) await fetchNotifications();
    };

    callFetch();
    const interval = setInterval(callFetch, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user?.uid, fetchNotifications]);

  // Optional: when socket is connected and backend emits new notifications in future, refresh quickly
  useEffect(() => {
    if (!socket || !user?.uid) return;
    const onAnyRealtime = () => {
      // lightweight refresh
      api.get("/notifications").then((res) => {
        setUnreadCount(Number(res.data?.unreadCount || 0));
      }).catch(() => {});
    };
    socket.on("notification-created", onAnyRealtime);
    return () => socket.off("notification-created", onAnyRealtime);
  }, [socket, user?.uid]);

  // Subscribe to incoming connection requests
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToIncomingRequests(user.uid, (requests) => {
      const newRequests = requests.filter(req => !lastRequestIds.has(req.id));

      // Show LinkedIn-style notification for new connection requests with detailed info
      newRequests.forEach(req => {
        addNotification({
          type: 'connection_request',
          title: `Connection request from ${req.fromName}`,
          senderName: req.fromName,
          senderPhoto: req.fromPhoto || '',
          message: `${req.fromName} wants to connect with you`,
          link: '/notifications',
          time: 'Just now',
          requestStatus: 'Pending',
          sentBy: req.fromName,
        });
      });

      // Update last seen request IDs
      const allIds = new Set([...lastRequestIds, ...requests.map(r => r.id)]);
      setLastRequestIds(allIds);

      setConnectionRequests(requests);
      setUnreadCount(prev => prev + newRequests.length);
    });

    return () => unsubscribe();
  }, [user?.uid, lastRequestIds]);

  // Subscribe to messages and fetch sender info (with improved error handling)
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToIncomingMessages(user.uid, (newMessages) => {
      const lastMessages = new Map(messages.map(m => [m.id, m]));
      const incomingNewMessages = newMessages.filter(msg => !lastMessages.has(msg.id));

      // Only fetch sender data for recent messages
      const messagesToEnrich = newMessages.slice(0, 5); // Only fetch for first 5 messages
      
      // Fetch sender information for messages - with robust error handling
      Promise.all(
        messagesToEnrich.map(async (msg) => {
          // Extract actual ID from senderId (handle both string and object)
          const senderId = msg.senderId && typeof msg.senderId === 'object' 
            ? (msg.senderId._id || msg.senderId.id || msg.senderId.uid) 
            : msg.senderId;
          
          // Skip if no senderId, sender data already cached, or user lookup failed before
          if (!senderId || senderData[senderId] || failedUserIds.has(senderId)) {
            return senderId ? [senderId, senderData[senderId]] : null;
          }
          
          // Validate ObjectId format before making request
          if (!isValidObjectId(senderId)) {
            return null;
          }
          
          try {
            const response = await api.get(`/users/${senderId}`, {
              validateStatus: (status) => status < 500 // Don't reject 404s
            });
            
            if (response?.status === 404) {
              // User doesn't exist - add to failed cache
              setFailedUserIds(prev => new Set([...prev, senderId]));
              return null;
            }
            
            if (response?.data) {
              return [senderId, response.data];
            }
          } catch (error) {
            // Silently fail - sender data is optional
            if (error?.response?.status === 404) {
              setFailedUserIds(prev => new Set([...prev, senderId]));
            }
            return null;
          }
          return null;
        })
      ).then(results => {
        const senders = { ...senderData };
        results.forEach(result => {
          if (result) senders[result[0]] = result[1];
        });
        setSenderData(senders);
      }).catch(() => {
        // Silently ignore any batch errors
      });

      // Show LinkedIn-style notification for new messages with detailed info
      incomingNewMessages.forEach(msg => {
        const sender = senderData[msg.senderId];
        const senderName = sender?.name || sender?.displayName || "Someone";
        const messagePreview = msg.text?.substring(0, 100) + (msg.text?.length > 100 ? '...' : '');
        
        addNotification({
          type: 'message',
          title: `New message`,
          senderName: senderName,
          senderPhoto: sender?.photoURL || sender?.profileImage || '',
          message: messagePreview,
          link: '/chat',
          time: 'Just now'
        });
      });

      setMessages(newMessages);
      setUnreadCount(prev => prev + incomingNewMessages.length);
    });

    return () => unsubscribe();
  }, [user?.uid, messages, senderData, failedUserIds]);

  // Subscribe to activities
  useEffect(() => {
    if (!user?.uid) return;

    const handleConnections = (connections) => {
      if (connections.length === 0) return;

      const partnerIds = connections.map(c => c.partnerId);
      const unsubActivities = subscribeToActivities(partnerIds, (newActivities) => {
        setActivities(newActivities);
      });

      return unsubActivities;
    };

    const unsubConnections = subscribeToConnections(user.uid, handleConnections);

    return () => unsubConnections();
  }, [user?.uid]);

  // Fetch suggestions
  useEffect(() => {
    if (!user?.uid) return;
    getSuggestions(user.uid).then(setSuggestions).catch(console.error);
  }, [user?.uid]);

  // Calculate total unread notifications
  const totalNotifications = connectionRequests.length + messages.length;

  // Enrich messages with sender data
  const enrichedMessages = messages.map(msg => {
    const senderId = msg.senderId && typeof msg.senderId === 'object' ? (msg.senderId._id || msg.senderId.id || msg.senderId.uid) : msg.senderId;
    return {
      ...msg,
      senderName: senderData[senderId]?.name || "Unknown",
      senderPhoto: senderData[senderId]?.photoURL || "",
    };
  });

  return (
    <NotificationContext.Provider
      value={{
        notifications: [],
        connectionRequests,
        messages: enrichedMessages,
        activities,
        unreadCount,
        totalNotifications,
        suggestions,
        fetchNotifications,
        markAsRead: () => Promise.resolve(),
        markAllAsRead: () => Promise.resolve()
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};
