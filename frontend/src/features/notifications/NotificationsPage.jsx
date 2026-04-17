import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback, Button, Badge } from '@/components/ui';
import { Bell, User, Users, MessageCircle, Heart, Trash2, CheckCheck, MessageSquare, Link as LinkIcon, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/services/axios';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, connectionRequests, suggestions, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Combine all notification types
  useEffect(() => {
    const combined = [
      ...notifications.map(n => ({ ...n, type: n.type || 'notification', category: 'notification' })),
      ...connectionRequests.map(r => ({ 
        _id: r._id || r.id,
        type: 'connection-request',
        title: `${r.fromUser?.name || r.fromName || 'Someone'} sent you a connection request`,
        message: '',
        image: r.fromUser?.profilePhoto,
        createdAt: r.createdAt || new Date(),
        category: 'connection',
        data: r
      })),
      ...suggestions.map(s => ({
        _id: s._id || s.id,
        type: 'suggestion',
        title: `${s.name || 'Alumni'} might be a good connection`,
        message: s.currentJobTitle ? `${s.currentJobTitle} at companies` : 'Alumni',
        image: s.profilePhoto,
        createdAt: s.createdAt || new Date(),
        category: 'suggestion',
        data: s
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setAllNotifications(combined);
  }, [notifications, connectionRequests, suggestions]);

  const handleAcceptConnection = async (requestId) => {
    try {
      setProcessingId(requestId);
      const res = await api.post(`/connections/${requestId}/accept`);
      console.log('✅ Connection accepted:', res.data);
      toast.success('Connection accepted!');
      setAllNotifications(prev => prev.filter(n => n._id !== requestId));
      await fetchNotifications();
    } catch (err) {
      console.error('❌ Error accepting connection:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to accept connection');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectConnection = async (requestId) => {
    try {
      setProcessingId(requestId);
      const res = await api.delete(`/connections/${requestId}/reject`);
      console.log('✅ Connection rejected:', res.data);
      toast.success('Connection request declined');
      setAllNotifications(prev => prev.filter(n => n._id !== requestId));
      await fetchNotifications();
    } catch (err) {
      console.error('❌ Error rejecting connection:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to decline connection');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteNotification = async (notifId) => {
    try {
      await api.delete(`/notifications/${notifId}`);
      setAllNotifications(prev => prev.filter(n => n._id !== notifId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getTabCount = (tab) => {
    switch(tab) {
      case 'connection': return connectionRequests.length;
      case 'suggestion': return suggestions.length;
      case 'all': return allNotifications.length;
      default: return 0;
    }
  };

  const filteredNotifications = activeTab === 'all' 
    ? allNotifications 
    : allNotifications.filter(n => n.category === activeTab);

  const getIconForType = (type) => {
    switch(type) {
      case 'connection-request': return <Users className="h-5 w-5 text-blue-600" />;
      case 'message': return <MessageCircle className="h-5 w-5 text-green-600" />;
      case 'like': return <Heart className="h-5 w-5 text-red-600" />;
      case 'comment': return <MessageSquare className="h-5 w-5 text-purple-600" />;
      case 'suggestion': return <TrendingUp className="h-5 w-5 text-amber-600" />;
      default: return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-8 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2">Notifications</h1>
              <p className="text-blue-100">Stay updated with your network</p>
            </div>
            {unreadCount > 0 && (
              <Button 
                onClick={markAllAsRead}
                className="bg-white text-blue-600 hover:bg-slate-100 font-black rounded-lg"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-3 flex-wrap">
            {[
              { id: 'all', label: 'All Notifications', icon: Bell },
              { id: 'connection', label: 'Connection Requests', icon: Users },
              { id: 'suggestion', label: 'Suggestions', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                <Badge className={activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white/40 text-white'}>
                  {getTabCount(tab.id)}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Bell className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-xl font-bold">No notifications yet</p>
            <p className="text-slate-400 mt-2">When someone interacts with you, you'll see it here</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notif, idx) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all border-l-4 border-blue-500"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={notif.image || notif.imageLink} />
                    <AvatarFallback className="bg-blue-600 text-white font-bold">
                      {notif.title?.[0] || 'N'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getIconForType(notif.type)}
                          <p className="font-bold text-slate-900">{notif.title}</p>
                        </div>
                        {notif.message && (
                          <p className="text-slate-600 text-sm">{notif.message}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => handleDeleteNotification(notif._id)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Connection Request Actions */}
                    {notif.type === 'connection-request' && (
                      <div className="flex gap-3 mt-4">
                        <Button
                          onClick={() => handleAcceptConnection(notif.data._id)}
                          disabled={processingId === notif.data._id}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === notif.data._id ? 'Accepting...' : 'Accept'}
                        </Button>
                        <Button
                          onClick={() => handleRejectConnection(notif.data._id)}
                          variant="outline"
                          disabled={processingId === notif.data._id}
                          className="flex-1 border-slate-300 text-slate-700 font-bold rounded-lg py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === notif.data._id ? 'Declining...' : 'Decline'}
                        </Button>
                      </div>
                    )}

                    {/* Suggestion Actions */}
                    {notif.type === 'suggestion' && (
                      <Button
                        onClick={() => navigate(`/profile/${notif.data._id}`)}
                        className="mt-3 w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-lg py-2"
                      >
                        View Profile
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
