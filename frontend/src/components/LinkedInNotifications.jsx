import { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, UserPlus, Check, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationContext = createContext();

export const useLinkedInNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useLinkedInNotifications must be used within LinkedInNotificationsProvider');
  }
  return context;
};

export const LinkedInNotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = { ...notification, id };
    setNotifications(prev => [newNotification, ...prev].slice(0, 5)); // Keep max 5 notifications
    
    // Auto-remove after 8 seconds (longer for detailed messages)
    setTimeout(() => {
      removeNotification(id);
    }, 8000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'connection_request':
        return <UserPlus className="h-5 w-5 text-cyan-500" />;
      case 'connection_accepted':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'request_sent':
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      case 'request_accepted':
        return <Check className="h-5 w-5 text-emerald-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message':
        return 'bg-blue-50 border-blue-200';
      case 'connection_request':
        return 'bg-cyan-50 border-cyan-200';
      case 'connection_accepted':
        return 'bg-green-50 border-green-200';
      case 'request_sent':
        return 'bg-purple-50 border-purple-200';
      case 'request_accepted':
        return 'bg-emerald-50 border-emerald-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative p-4 rounded-lg shadow-lg border ${getNotificationColor(notification.type)} backdrop-blur-sm`}
            >
              <button
                onClick={() => removeNotification(notification.id)}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {/* Sender Photo or Icon */}
                  {notification.senderPhoto ? (
                    <img 
                      src={notification.senderPhoto} 
                      alt={notification.senderName}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    getNotificationIcon(notification.type)
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  {notification.link ? (
                    <Link 
                      to={notification.link}
                      onClick={() => removeNotification(notification.id)}
                      className="block"
                    >
                      <p className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                        {notification.title}
                      </p>
                      {/* Sender Name - show as username */}
                      {notification.senderName && (
                        <p className="text-xs font-medium text-slate-700 mt-0.5">
                          👤 {notification.senderName}
                        </p>
                      )}
                      {/* Alumni Name - for alumni connections */}
                      {notification.alumniName && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          🎓 {notification.alumniName}
                        </p>
                      )}
                      {/* Message content */}
                      {notification.message && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notification.message}</p>
                      )}
                      {/* Request Status */}
                      {notification.requestStatus && (
                        <div className="mt-1.5 space-y-0.5">
                          {notification.sentBy && (
                            <p className="text-xs text-slate-600">
                              📤 <span className="font-medium">Request by:</span> {notification.sentBy}
                            </p>
                          )}
                          {notification.acceptedBy && (
                            <p className="text-xs text-green-700 font-medium">
                              ✓ <span>Accepted by:</span> {notification.acceptedBy}
                            </p>
                          )}
                          <p className="text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded inline-block mt-1 font-medium">
                            Status: {notification.requestStatus}
                          </p>
                        </div>
                      )}
                    </Link>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-slate-900">
                        {notification.title}
                      </p>
                      {/* Sender Name */}
                      {notification.senderName && (
                        <p className="text-xs font-medium text-slate-700 mt-0.5">
                          👤 {notification.senderName}
                        </p>
                      )}
                      {/* Alumni Name */}
                      {notification.alumniName && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          🎓 {notification.alumniName}
                        </p>
                      )}
                      {/* Message content */}
                      {notification.message && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notification.message}</p>
                      )}
                      {/* Request Status */}
                      {notification.requestStatus && (
                        <div className="mt-1.5 space-y-0.5">
                          {notification.sentBy && (
                            <p className="text-xs text-slate-600">
                              📤 <span className="font-medium">Request by:</span> {notification.sentBy}
                            </p>
                          )}
                          {notification.acceptedBy && (
                            <p className="text-xs text-green-700 font-medium">
                              ✓ <span>Accepted by:</span> {notification.acceptedBy}
                            </p>
                          )}
                          <p className="text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded inline-block mt-1 font-medium">
                            Status: {notification.requestStatus}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  
                  <p className="text-xs text-slate-400 mt-2">
                    {notification.time || 'Just now'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export default LinkedInNotificationsProvider;
