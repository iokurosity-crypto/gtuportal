import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useRealTime } from '@/contexts/RealTimeContext.jsx';
import api from '@/services/axios';
import { 
    Send, 
    ArrowLeft,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback, Button } from "@/components/ui";
import { motion, AnimatePresence } from 'framer-motion';
import ChatSidebar from './ChatSidebar';
import { toast } from 'sonner';

const ChatRoom = () => {
    const { id: chatId } = useParams();
    const { alumni } = useAuth();
    const { socket } = useRealTime();
    const navigate = useNavigate();
    
    // Helper to get profile photo from user object (checks all possible fields)
    const getProfilePhoto = (user) => (
        user?.profilePhoto ||
        user?.profilePicture ||
        user?.photoURL ||
        user?.avatar ||
        user?.imageLink ||
        null
    );
    
    // Debug: Log the alumni object to understand its structure
    console.log('AUTH ALUMNI OBJECT:', JSON.stringify(alumni));
    console.log('MY ID FIELDS:', alumni?._id, alumni?.id);
    
    // Robust myId resolution handling all possible field names
    const myId = (
        alumni?._id?.toString() ||
        alumni?.id?.toString() ||
        alumni?.userId?.toString() ||
        alumni?.user?._id?.toString() ||
        ''
    );
    console.log('myId resolved to:', myId);
    
    const isMe = (msg) => {
        if (!myId) return false;
        
        const possibleSenderIds = [
            msg.sender?._id?.toString(),
            msg.sender?.toString(),
            msg.senderId?._id?.toString(),
            msg.senderId?.toString(),
            msg.userId?.toString(),
        ].filter(Boolean);
        
        console.log('Message sender IDs:', possibleSenderIds, 'myId:', myId);
        
        return possibleSenderIds.includes(myId);
    };
    
    // State
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatPartner, setChatPartner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Group messages by sender for LinkedIn-style display
    const groupMessages = (msgs) => {
        if (!msgs || msgs.length === 0) return [];
        
        const groups = [];
        let currentGroup = null;
        
        msgs.forEach((msg, idx) => {
            const mine = isMe(msg);
            const senderId = msg.senderId?._id || msg.senderId?.id || msg.senderId || msg.sender?._id || msg.sender?.id;
            
            if (currentGroup && currentGroup.mine === mine && currentGroup.senderId === senderId) {
                // Same sender as previous, add to current group
                currentGroup.messages.push(msg);
            } else {
                // New sender, start new group
                if (currentGroup) {
                    groups.push(currentGroup);
                }
                currentGroup = {
                    mine,
                    senderId,
                    messages: [msg]
                };
            }
        });
        
        if (currentGroup) {
            groups.push(currentGroup);
        }
        
        return groups;
    };

    const groupedMessages = groupMessages(messages);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch messages and setup socket listener
    useEffect(() => {
        if (!chatId || !alumni) return;

        const fetchMessages = async () => {
            try {
                setLoading(true);
                const res = await api.get(`chats/${chatId}/messages`);
                setMessages(res.data || []);
                
                // Extract chat partner info from first message or fetch separately
                if (res.data && res.data.length > 0) {
                    const firstMsg = res.data[0];
                    const senderId = firstMsg?.senderId?._id || firstMsg?.senderId;
                    const partner = senderId === (alumni?.id || alumni?._id) 
                        ? null 
                        : firstMsg.senderId;
                    if (partner) setChatPartner(partner);
                }
                
                // If no messages, try to infer from chat list
                if (!chatPartner && res.data?.length === 0) {
                    const chatsRes = await api.get('chats');
                    const chat = chatsRes.data?.find(c => c._id === chatId);
                    if (chat && chat.user1?._id && chat.user2?._id) {
                        const partner = chat.user1._id === (alumni?.id || alumni?._id) ? chat.user2 : chat.user1;
                        setChatPartner(partner);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch messages:", error);
                toast.error("Could not load conversation");
            } finally {
                setLoading(false);
                setTimeout(scrollToBottom, 100);
            }
        };

        fetchMessages();

        // Join socket room for real-time updates
        if (socket) {
            socket.emit('join-chat', chatId);
            
            // Get current user ID
            const mySocketId = alumni?._id || alumni?.id;
            
            // Listen for new messages from backend - only add if NOT from me
            const handleNewMessage = (data) => {
                // Extract message and ensure we have the right structure
                const msg = data.message || data;
                
                if (!msg?._id) return; // Skip if no ID
                
                // Get sender ID from message
                const senderId = msg.senderId?._id || msg.senderId?.id || msg.senderId;
                
                // CRITICAL: Don't add message if it's from me (already added optimistically)
                if (senderId === mySocketId || senderId === (alumni?.id || alumni?._id)) {
                    console.log('✅ Ignoring own message:', msg._id);
                    return;
                }
                
                // Only add messages from other participants
                console.log('📨 Adding message from other user:', senderId);
                setMessages(prev => {
                    const exists = prev.some(m => m._id === msg._id);
                    return exists ? prev : [...prev, msg];
                });
                setTimeout(scrollToBottom, 50);
            };

            socket.on('new-message', handleNewMessage);
            socket.on('getMessage', handleNewMessage); // Also listen for getMessage event
            
            // Listen for profile picture updates
            const handleProfilePictureUpdate = (event) => {
                console.log('📸 [ChatRoom] Profile picture updated:', event);
                // Update chat partner's profile picture if it's them
                if (chatPartner && (event.userId === chatPartner._id || event.userId === chatPartner.id)) {
                    setChatPartner(prev => ({
                        ...prev,
                        profilePhoto: event.profilePhoto || event.profilePicture,
                        profilePicture: event.profilePhoto || event.profilePicture
                    }));
                }
            };

            socket.on('profile-picture-updated', handleProfilePictureUpdate);
            
            return () => {
                socket.off('new-message', handleNewMessage);
                socket.off('getMessage', handleNewMessage);
                socket.off('profile-picture-updated', handleProfilePictureUpdate);
                socket.emit('leave-chat', chatId);
            };
        }
    }, [chatId, alumni, socket]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !alumni || sending || !chatId) return;

        const messageText = newMessage.trim();
        setSending(true);
        setNewMessage('');

        try {
            const res = await api.post(`chats/${chatId}/messages`, {
                text: messageText,
            });

            // Add to local state immediately (optimistic update)
            if (res.data?.data) {
                setMessages(prev => [...prev, res.data.data]);
            }
            
            setTimeout(scrollToBottom, 50);
        } catch (error) {
            console.error("Failed to send message:", error);
            setNewMessage(messageText); // Restore input on error
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    return (
        <div 
            className="fixed top-20 left-0 right-0 bottom-0 flex overflow-hidden bg-white z-40"
        >
            {/* LEFT SIDEBAR - Chat list */}
            <div 
                className={`${chatId ? 'hidden md:flex' : 'flex'} w-80 flex-shrink-0 border-r border-slate-200 flex flex-col overflow-hidden h-full`}
            >
                <ChatSidebar activeChatId={chatId} onSelectChat={(id, userData) => {
                    setChatPartner(userData);
                    navigate(`/chat/${id}`);
                }} />
            </div>

            {/* RIGHT PANEL - Main chat area */}
            <div 
                className={`flex-1 flex flex-col overflow-hidden bg-white h-full ${!chatId ? 'hidden md:flex' : 'flex'}`}
            >
                {!chatId ? (
                    // Empty state
                    <div className="flex-1 flex items-center justify-center bg-white">
                        <div className="text-center space-y-4">
                            <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto bg-blue-50">
                                <span style={{ fontSize: '40px' }}>💬</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Select a conversation</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">Choose a chat to start messaging</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* HEADER - Professional with correct user info */}
                        <div className="h-14 px-4 md:px-6 flex items-center justify-between flex-shrink-0 border-b border-gray-200 bg-white">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="md:hidden text-slate-700 hover:bg-gray-100 h-8 w-8 flex-shrink-0"
                                    onClick={() => navigate('/chat')}
                                >
                                    <ArrowLeft size={18} />
                                </Button>
                                
                                {/* Avatar section */}
                                {chatPartner && getProfilePhoto(chatPartner) ? (
                                    <img 
                                        src={getProfilePhoto(chatPartner)} 
                                        className="w-10 h-10 rounded-full object-cover border-2 border-teal-500 flex-shrink-0"
                                        alt={chatPartner.name}
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {chatPartner?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                
                                {/* User info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900 text-base truncate">
                                        {chatPartner?.name || 'Loading...'}
                                    </h3>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-xs text-slate-500">Online</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MESSAGES AREA - Professional Spacing */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white" style={{ overscrollBehavior: 'contain' }}>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div 
                                        className="h-8 w-8 border-3 rounded-full animate-spin"
                                        style={{
                                            borderColor: '#e5e7eb',
                                            borderTopColor: '#3b82f6'
                                        }}
                                    />
                                    <p className="text-xs text-slate-500 mt-2 font-medium">Loading messages...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <span style={{ fontSize: '40px' }} className="mb-2">👋</span>
                                    <p className="text-sm text-slate-600 font-medium">Start a conversation</p>
                                    <p className="text-xs text-slate-500 mt-1">Send your first message!</p>
                                </div>
                            ) : (
                                <>
                                <AnimatePresence>
                                    {groupedMessages.map((group, groupIdx) => (
                                        <motion.div
                                            key={`group-${groupIdx}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex w-full mb-3 ${group.mine ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {!group.mine && (
                                                <img
                                                    src={getProfilePhoto(chatPartner) || ''}
                                                    onError={e => e.target.style.display='none'}
                                                    className="w-8 h-8 rounded-full mr-2 self-end flex-shrink-0 object-cover"
                                                />
                                            )}
                                            <div className={`flex flex-col ${group.mine ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
                                                {group.messages.map((msg, msgIdx) => {
                                                    const isFirstInGroup = msgIdx === 0;
                                                    const isLastInGroup = msgIdx === group.messages.length - 1;
                                                    
                                                    return (
                                                        <div key={msg._id || msgIdx} className={`flex flex-col ${group.mine ? 'items-end' : 'items-start'} mb-1`}>
                                                            <div
                                                                className={`px-4 py-2 text-sm ${
                                                                    group.mine
                                                                        ? 'bg-blue-600 text-white ' + (isFirstInGroup ? 'rounded-tr-2xl ' : 'rounded-tr-sm ') + (isLastInGroup ? 'rounded-br-2xl ' : 'rounded-br-sm ') + 'rounded-tl-2xl rounded-bl-2xl'
                                                                        : 'bg-white text-slate-800 border border-slate-200 ' + (isFirstInGroup ? 'rounded-tl-2xl ' : 'rounded-tl-sm ') + (isLastInGroup ? 'rounded-bl-2xl ' : 'rounded-bl-sm ') + 'rounded-tr-2xl rounded-br-2xl'
                                                                }`}
                                                            >
                                                                {msg.text || msg.content}
                                                            </div>
                                                            {isLastInGroup && (
                                                                <span className="text-xs text-slate-400 mt-1 px-1">
                                                                    {msg.createdAt
                                                                        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                        : ''}
                                                                    {group.mine && ' ✓✓'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {group.mine && (
                                                <img
                                                    src={getProfilePhoto(alumni) || ''}
                                                    onError={e => e.target.style.display='none'}
                                                    className="w-8 h-8 rounded-full ml-2 self-end flex-shrink-0 object-cover"
                                                />
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                </>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* INPUT AREA - Professional Spacing at Bottom */}
                        <div className="px-4 md:px-6 py-4 md:py-5 flex-shrink-0 border-t border-gray-200 bg-white">
                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Message..."
                                    disabled={sending}
                                    className="flex-1 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 transition-all duration-300 focus:outline-none border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-full"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
                                    style={{
                                        background: newMessage.trim() && !sending ? '#3b82f6' : '#e5e7eb',
                                        color: newMessage.trim() && !sending ? 'white' : '#9ca3af',
                                    }}
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatRoom;