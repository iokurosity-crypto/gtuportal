import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { io } from 'socket.io-client';
import { useLinkedInNotifications } from '@/components/LinkedInNotifications';

const RealTimeContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

export const RealTimeProvider = ({ children }) => {
  const { user, updateAlumni } = useAuth();
  const { addNotification } = useLinkedInNotifications();
  const [isConnected, setIsConnected] = useState(true);
  const [lastActivity, setLastActivity] = useState(new Date());
  const [socket, setSocket] = useState(null);

  const socketBaseUrl = useMemo(() => {
    // VITE_API_URL is like http://localhost:4000/api; socket needs the origin only.
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    return apiUrl.replace(/\/api\/?$/, '');
  }, []);

  // Socket.IO connection (real-time events, startups, profile photo updates, notifications rooms)
  useEffect(() => {
    if (!user?.uid) return;

    const s = io(socketBaseUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: false,
    });

    setSocket(s);

    s.on('connect', () => {
      setIsConnected(true);
      setLastActivity(new Date());
      s.emit('join-user', user.uid);
      s.emit('subscribe-notifications', user.uid);
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle profile photo updates - update AuthContext so all components refresh
    const onProfilePic = (event) => {
      console.log('🔔 [RealTime] Profile picture updated:', event);
      setLastActivity(new Date());
      
      // Update the current user's profile picture in AuthContext
      if (event.userId && event.profilePhoto) {
        if (event.userId === user?.uid || event.userId === user?._id || event.userId === user?.id) {
          console.log('📸 [RealTime] Updating current user profile picture');
          updateAlumni({
            profilePhoto: event.profilePhoto,
            profilePicture: event.profilePhoto
          });
        }
      }
    };

    const onCoverPic = (event) => {
      console.log('🔔 [RealTime] Cover photo updated:', event);
      setLastActivity(new Date());
      
      if (event.userId && event.coverPhoto) {
        if (event.userId === user?.uid || event.userId === user?._id || event.userId === user?.id) {
          console.log('🖼️ [RealTime] Updating current user cover photo');
          updateAlumni({
            coverPhoto: event.coverPhoto
          });
        }
      }
    };

    s.on('profile-picture-updated', onProfilePic);
    s.on('cover-photo-updated', onCoverPic);

    // Listen for connection accepted events
    const onConnectionAccepted = (event) => {
      console.log('🔔 [RealTime] Connection accepted:', event);
      setLastActivity(new Date());
      
      if (event.acceptedBy && event.acceptedByName) {
        addNotification({
          type: 'connection_accepted',
          title: `${event.acceptedByName} accepted your request`,
          message: 'You are now connected',
          link: '/my-connections',
          time: 'Just now'
        });
      }
    };

    s.on('connection-accepted', onConnectionAccepted);

    return () => {
      s.off('profile-picture-updated', onProfilePic);
      s.off('cover-photo-updated', onCoverPic);
      s.off('connection-accepted', onConnectionAccepted);
      s.disconnect();
      setSocket(null);
    };
  }, [user?.uid, user?._id, user?.id, socketBaseUrl, updateAlumni, addNotification]);

  // Poll for new posts (fallback from real-time)
  useEffect(() => {
    if (!user) return;

    const getAuthHeader = () => ({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json'
    });

    // Poll every 30 seconds for new posts (reduced from 10s for better performance)
    const interval = setInterval(() => {
      fetch(`${API_URL}/posts`, { headers: getAuthHeader() })
        .then(res => res.json())
        .then(posts => {
          if (posts && posts.length > 0) {
            setLastActivity(new Date());
          }
        })
        .catch(error => {
          console.error('Error fetching posts:', error);
          setIsConnected(false);
        });
    }, 30000);

    // Check connection status
    const navigationTiming = window.Performance ? window.performance : null;
    if (navigationTiming) {
      setIsConnected(true);
    }

    return () => clearInterval(interval);
  }, [user]);

  return (
    <RealTimeContext.Provider
      value={{
        isConnected,
        lastActivity,
        setLastActivity,
        socket,
      }}
    >
      {children}
    </RealTimeContext.Provider>
  );
};