import { Bell, User, MessageCircle, Clock } from "lucide-react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, Avatar, AvatarImage, AvatarFallback, ScrollArea, DropdownMenuTrigger } from "@/components/ui";
import { useNotifications } from "@/contexts/NotificationContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotificationBell = () => {
    const { connectionRequests, messages, totalNotifications } = useNotifications();

    const notificationItems = [
        ...connectionRequests.map(req => ({
            id: req.id,
            type: "connection",
            title: `${req.fromName} sent a connection request`,
            time: req.timestamp,
            data: req
        })),
        ...messages.map(msg => ({
            id: msg.id || msg.chatId,
            type: "message",
            title: `New message from ${msg.senderName || "Someone"}`,
            preview: msg.text?.substring(0, 40) + "..." || "New message",
            time: msg.timestamp,
            data: msg
        }))
    ].sort((a, b) => (b.time?.toDate?.() || 0) - (a.time?.toDate?.() || 0)).slice(0, 10);

    const formatTime = (timestamp) => {
        if (!timestamp) return "just now";
        const now = new Date();
        const time = timestamp.toDate?.() || timestamp;
        const diff = now - time;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return "1w ago";
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                    <Bell className="h-5 w-5" />
                    {totalNotifications > 0 && (
                        <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white shadow-lg"
                        >
                            {totalNotifications > 99 ? "99+" : totalNotifications}
                        </motion.span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-80 max-h-[500px] p-0">
                    <div className="bg-slate-50 border-b py-3 px-4 sticky top-0">
                        <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
                        <p className="text-xs text-muted-foreground">{totalNotifications} new</p>
                    </div>
                    
                    <ScrollArea className="h-auto max-h-[400px]">
                        {notificationItems.length > 0 ? (
                            <div className="divide-y">
                                {notificationItems.map((notif) => (
                                    <DropdownMenuItem 
                                        key={notif.id} 
                                        asChild
                                        className="p-4 cursor-pointer hover:bg-slate-100 focus:bg-slate-100 rounded-none"
                                    >
                                        <Link 
                                            to={notif.type === "connection" ? "/notifications" : "/chat"}
                                            className="flex gap-3 w-full"
                                        >
                                            <div className="flex-shrink-0">
                                                {notif.type === "connection" ? (
                                                    <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-cyan-600" />
                                                    </div>
                                                ) : (
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={notif.data?.senderPhoto} />
                                                        <AvatarFallback>
                                                            <MessageCircle className="h-5 w-5 text-blue-600" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">
                                                    {notif.title}
                                                </p>
                                                {notif.preview && (
                                                    <p className="text-xs text-muted-foreground truncate mt-1">
                                                        {notif.preview}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTime(notif.time)}
                                                </p>
                                            </div>
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        ) : (
                            <DropdownMenuItem className="py-8 text-center text-muted-foreground justify-center">
                                No notifications yet
                            </DropdownMenuItem>
                        )}
                    </ScrollArea>
                    
                    <div className="border-t bg-slate-50 p-2 sticky bottom-0">
                        <Button 
                            variant="ghost" 
                            className="w-full text-xs font-semibold text-primary hover:bg-slate-100"
                            asChild
                        >
                            <Link to="/notifications">View all notifications</Link>
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

export default NotificationBell;
