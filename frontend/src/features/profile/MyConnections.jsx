import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/axios';
import { Avatar, AvatarImage, AvatarFallback, Button } from '@/components/ui';
import { UserPlus, Check, X, Users, MessageSquare, Eye, Search, Filter, MapPin, Briefcase } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const getAvatarSrc = (person) => (
  person?.profilePicture ||
  person?.profilePhoto ||
  person?.photoURL ||
  person?.imageLink ||
  person?.avatar ||
  null
);

export default function MyConnections() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [connections, setConnections] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('connections'); // connections, incoming, outgoing
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchConnections();
  }, []);

  // Allow navigation to open a specific tab (e.g., from notifications)
  useEffect(() => {
    const requestedTab = location.state?.tab;
    if (requestedTab && ["connections", "incoming", "outgoing"].includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const [connRes, incomingRes, outgoingRes] = await Promise.all([
        api.get('/connections'),
        api.get('/connections/incoming'),
        api.get('/connections/outgoing')
      ]);

      setConnections(connRes.data || []);
      setIncomingRequests(incomingRes.data || []);
      setOutgoingRequests(outgoingRes.data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId, fromUserId) => {
    try {
      await api.post(`/connections/${requestId}/accept`);
      setIncomingRequests(prev => prev.filter(r => r._id !== requestId));
      toast.success('Connection request accepted!');
      fetchConnections();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.delete(`/connections/${requestId}/reject`);
      setIncomingRequests(prev => prev.filter(r => r._id !== requestId));
      toast.success('Connection request declined');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to decline request');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await api.post(`/connections/cancel/${requestId}`);
      setOutgoingRequests(prev => prev.filter(r => r._id !== requestId));
      toast.success('Connection request cancelled');
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Failed to cancel request');
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleChat = async (connUser) => {
    try {
      // Create or get chat with this user
      const res = await api.post('chats/create', {
        user2Id: connUser._id
      });
      if (res.data?.chatId) {
        navigate(`/chat/${res.data.chatId}`);
      } else {
        toast.error('Failed to open chat');
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error('Failed to open chat');
    }
  };

  const normalizedConnections = useMemo(() => {
    const list = Array.isArray(connections) ? connections : [];
    return list
      .map((c) => c.user || c)
      .filter(Boolean);
  }, [connections]);

  const filterByQuery = (list) => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => {
      const name = String(p.name || "").toLowerCase();
      const title = String(p.currentJobTitle || p.title || "").toLowerCase();
      const company = String(p.currentCompany || p.company || "").toLowerCase();
      const location = String(p.currentLocation || p.location || "").toLowerCase();
      return (
        name.includes(q) ||
        title.includes(q) ||
        company.includes(q) ||
        location.includes(q)
      );
    });
  };

  const filteredConnections = useMemo(() => filterByQuery(normalizedConnections), [normalizedConnections, query]);
  const filteredIncoming = useMemo(() => filterByQuery(incomingRequests.map(r => r.fromUser || {})), [incomingRequests, query]);
  const filteredOutgoing = useMemo(() => filterByQuery(outgoingRequests.map(r => r.toUser || {})), [outgoingRequests, query]);

  return (
    <div className="w-full bg-[#f3f2ef] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 px-6 py-8">
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Users className="w-8 h-8" />
              My Connections
            </h1>
            <p className="text-blue-100 mt-2">Manage your professional network</p>
          </div>

          {/* Search */}
          <div className="p-5 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search connections by name, title, company, location…"
                className="h-11 w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setActiveTab('connections')}
              className={`flex-1 px-6 py-4 font-bold transition-all ${
                activeTab === 'connections'
                  ? 'border-b-4 border-blue-600 text-blue-600 bg-white'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Connected ({connections.length})
            </button>
            <button
              onClick={() => setActiveTab('incoming')}
              className={`flex-1 px-6 py-4 font-bold transition-all ${
                activeTab === 'incoming'
                  ? 'border-b-4 border-blue-600 text-blue-600 bg-white'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Requests ({incomingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('outgoing')}
              className={`flex-1 px-6 py-4 font-bold transition-all ${
                activeTab === 'outgoing'
                  ? 'border-b-4 border-blue-600 text-blue-600 bg-white'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Pending ({outgoingRequests.length})
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-500 font-bold">Loading...</p>
              </div>
            ) : (
              <>
                {/* Connected Connections */}
                {activeTab === 'connections' && (
                  <div className="space-y-4">
                    {filteredConnections.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">No connections yet</p>
                        <p className="text-slate-400 text-sm">Start building your network!</p>
                      </div>
                    ) : (
                      filteredConnections.map((connUser) => {
                        return (
                          <div key={connUser._id} className="p-5 border border-slate-200 rounded-2xl hover:shadow-md transition-all bg-white">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={getAvatarSrc(connUser)} alt={connUser.name} />
                                <AvatarFallback className="bg-blue-600 text-white font-bold">
                                  {connUser.name?.[0] || 'A'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-black text-slate-900 truncate">{connUser.name}</p>
                                <p className="text-sm font-bold text-slate-600 truncate">
                                  {connUser.currentJobTitle || connUser.title || 'Alumni'}
                                  {connUser.currentCompany ? ` • ${connUser.currentCompany}` : ''}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold text-slate-500">
                                  {(connUser.currentLocation || connUser.location) ? (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                      {connUser.currentLocation || connUser.location}
                                    </span>
                                  ) : null}
                                  {connUser.department ? (
                                    <span className="inline-flex items-center gap-1">
                                      <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                      {connUser.department}{connUser.batch ? ` • Batch ${connUser.batch}` : ''}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              </div>

                              <div className="flex gap-2 items-center shrink-0">
                              <Button
                                onClick={() => handleViewProfile(connUser._id)}
                                className="bg-sky-600 hover:bg-sky-700 text-white font-black px-4 py-2 rounded-xl flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" /> View Profile
                              </Button>
                              <Button
                                onClick={() => handleChat(connUser)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2 rounded-xl flex items-center gap-2"
                              >
                                <MessageSquare className="w-4 h-4" /> Chat
                              </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Incoming Requests */}
                {activeTab === 'incoming' && (
                  <div className="space-y-4">
                    {incomingRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">No requests</p>
                        <p className="text-slate-400 text-sm">Check back soon!</p>
                      </div>
                    ) : (
                      incomingRequests
                        .filter((r) => {
                          if (!query.trim()) return true;
                          const u = r.fromUser || {};
                          return String(u.name || "").toLowerCase().includes(query.trim().toLowerCase());
                        })
                        .map((request) => {
                        const fromUser = request.fromUser || {};
                        return (
                          <div key={request._id} className="flex items-center justify-between p-5 border border-slate-200 rounded-2xl hover:shadow-md transition-all bg-white">
                            <Link to={`/profile/${fromUser._id}`} className="flex items-center gap-4 flex-1">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={getAvatarSrc(fromUser)} alt={fromUser.name} />
                                <AvatarFallback className="bg-blue-600 text-white font-bold">
                                  {fromUser.name?.[0] || 'A'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-slate-900">{fromUser.name}</p>
                                <p className="text-sm text-slate-500">{fromUser.currentJobTitle || fromUser.title || 'Alumni'}</p>
                              </div>
                            </Link>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAcceptRequest(request._id, fromUser._id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl"
                              >
                                <Check className="w-4 h-4 mr-1" /> Accept
                              </Button>
                              <Button
                                onClick={() => handleRejectRequest(request._id)}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-black px-4 py-2 rounded-xl"
                              >
                                <X className="w-4 h-4 mr-1" /> Decline
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Outgoing Requests */}
                {activeTab === 'outgoing' && (
                  <div className="space-y-4">
                    {outgoingRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">No pending requests</p>
                        <p className="text-slate-400 text-sm">Send connection requests</p>
                      </div>
                    ) : (
                      outgoingRequests.map((request) => {
                        const toUser = request.toUser || {};
                        return (
                          <div key={request._id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all">
                            <Link to={`/profile/${toUser._id}`} className="flex items-center gap-4 flex-1">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={getAvatarSrc(toUser)} alt={toUser.name} />
                                <AvatarFallback className="bg-blue-600 text-white font-bold">
                                  {toUser.name?.[0] || 'A'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-slate-900">{toUser.name}</p>
                                <p className="text-sm text-slate-500">{toUser.currentJobTitle || toUser.title || 'Alumni'}</p>
                              </div>
                            </Link>
                            <Button
                              onClick={() => handleCancelRequest(request._id)}
                              className="bg-slate-300 hover:bg-slate-400 text-slate-900 font-bold px-4 py-2 rounded-lg"
                            >
                              <X className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
