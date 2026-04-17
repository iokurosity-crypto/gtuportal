import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui";
import { User, Search, MessageCircle, Loader2, MessageSquare } from "lucide-react";
import api from "@/services/axios";
import { useNavigate } from "react-router-dom";

const ChatSidebar = ({ activeChatId, onSelectChat }) => {
  const { alumni: user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [connections, setConnections] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        console.log('📡 [ChatSidebar] Fetching for user:', user?.id, user?._id);
        const [chatsRes, connectionsRes] = await Promise.all([
          api.get('chats'),
          api.get('connections')
        ]);
        console.log('📡 [ChatSidebar] Got chats:', chatsRes.data);
        console.log('📡 [ChatSidebar] Got connections:', connectionsRes.data);
        setChats(chatsRes.data || []);
        setConnections(connectionsRes.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chat sidebar data:', error);
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Get existing chat partners
  const chatPartners = new Set(chats
    .filter(chat => chat.user1?._id && chat.user2?._id)
    .map(chat => 
      chat.user1._id === (user?.id || user?._id) ? chat.user2._id : chat.user1._id
    )
  );

  console.log('📡 [ChatSidebar] User ID:', user?.id, user?._id);
  console.log('📡 [ChatSidebar] Chat partners:', Array.from(chatPartners));
  console.log('📡 [ChatSidebar] Chats count:', chats.length, 'Connections count:', connections.length);

  // Combine chats and connections
  const combined = [
    // Existing chats first
    ...chats
      .filter(chat => chat.user1?._id && chat.user2?._id)
      .map(chat => {
        const otherUser = chat.user1._id === (user?.id || user?._id) ? chat.user2 : chat.user1;
        const photo = otherUser?.profilePhoto || otherUser?.profilePicture || otherUser?.photoURL;
        
        return {
          ...chat,
          otherUser: {
            ...otherUser,
            profilePhoto: photo,
          },
          lastMessageText: chat.lastMessage?.text || "Start a conversation",
          isExistingChat: true
        };
      }),
    // Connections without existing chats
    ...connections
      .filter(conn => !chatPartners.has(conn.user?._id || conn._id))
      .map(conn => {
        const connUser = conn.user || conn;
        return {
          _id: `temp-${connUser._id}`,
          otherUser: {
            ...connUser,
            profilePhoto: connUser?.profilePhoto || connUser?.profilePicture || connUser?.photoURL,
          },
          lastMessageText: "Start a conversation",
          updatedAt: conn.connectedAt,
          isExistingChat: false
        };
      })
  ]
    .filter(item =>
      item.otherUser?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.otherUser?.email?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const handleSelectChat = async (chat) => {
    const otherUser = chat.otherUser;
    
    // If not an existing chat, create one first
    if (!chat.isExistingChat) {
      try {
        const res = await api.post('chats/create', {
          user2Id: otherUser._id
        });
        if (res.data?.chatId) {
          onSelectChat(res.data.chatId, otherUser);
          return;
        }
      } catch (error) {
        console.error('Error creating chat:', error);
      }
    }
    
    // Pass both chatId and otherUser data
    onSelectChat(chat._id, otherUser);
  };

  return (
    <div 
      className="w-full h-full flex flex-col overflow-hidden bg-white border-r border-gray-200"
    >
      {/* Header - Compact */}
      <div 
        className="p-3 md:p-4 border-b border-gray-200 flex-shrink-0"
      >
        <h2 className="font-bold text-base md:text-lg text-slate-900 mb-2">Messages</h2>
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" 
            size={16}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs md:text-sm text-slate-900 placeholder:text-slate-500 transition-all duration-300 focus:outline-none border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center flex flex-col items-center justify-center h-full">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin mb-2" />
            <p className="text-xs md:text-sm text-slate-500">Loading conversations...</p>
          </div>
        ) : combined.length === 0 ? (
          <div className="p-4 text-center flex flex-col items-center justify-center h-full">
            <div 
              className="h-10 w-10 rounded-full flex items-center justify-center mb-2 bg-blue-50"
            >
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs md:text-sm text-slate-600 font-medium">
              {search ? "No conversations found" : "No conversations yet"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {search ? "" : "Connect with alumni to start messaging"}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5 p-2">
            {combined.map((chat) => {
              const otherUser = chat.otherUser;
              const isActive = activeChatId === chat._id;
              
              return (
                <button
                  key={chat._id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectChat(chat);
                  }}
                  className="w-full text-left p-2 md:p-3 rounded-lg transition-all duration-300 flex gap-2 md:gap-3 group focus:outline-none"
                  style={{
                    background: isActive ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
                    borderLeft: isActive ? '3px solid #0D9488' : '3px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0" style={{
                      border: isActive ? '2px solid #0D9488' : '2px solid #e5e7eb',
                      transition: 'all 0.3s ease'
                    }}>
                      <AvatarImage src={otherUser?.profilePhoto || otherUser?.profilePicture || otherUser?.photoURL} alt={otherUser?.name} />
                      <AvatarFallback className="text-white font-bold text-xs md:text-sm bg-teal-600">
                        {otherUser?.name
                          ?.split(' ')
                          .map(word => word[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className="absolute bottom-0 right-0 h-2.5 w-2.5 md:h-3 md:w-3 border-2 border-white rounded-full"
                      style={{
                        background: '#10B981',
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p 
                        className="font-semibold truncate text-xs md:text-sm transition-colors duration-300"
                        style={{
                          color: isActive ? '#0D9488' : '#1f2937'
                        }}
                      >
                        {otherUser?.name || 'Chat'}
                      </p>
                      <span 
                        className="text-xs flex-shrink-0"
                        style={{
                          color: isActive ? '#0D9488' : '#9ca3af'
                        }}
                      >
                        {formatTime(chat.updatedAt)}
                      </span>
                    </div>
                    <p 
                      className="text-xs truncate"
                      style={{
                        color: '#6b7280'
                      }}
                    >
                      {chat.lastMessageText}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
