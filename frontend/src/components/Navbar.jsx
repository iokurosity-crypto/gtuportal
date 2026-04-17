import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useRealTime } from '@/contexts/RealTimeContext';
import {
  Users, 
  Home, 
  Search, 
  MessageCircle, 
  Bell, 
  LogOut, 
  User as UserIcon,
  Menu,
  X,
  Briefcase,
  Target,
  Calendar,
  Zap,
  TrendingUp
} from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui";
import ldceLogo from '@/data/assets/images/events/LDCE_Logo.png';
import api from "@/services/axios";
import { toast } from "sonner";

const Navbar = () => {
  const { alumni, logout, isLoggedIn } = useAuth();
  const { unreadCount: notificationCount } = useNotifications();
  const { socket } = useRealTime();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [globalQ, setGlobalQ] = React.useState("");
  const [globalOpen, setGlobalOpen] = React.useState(false);
  const [globalLoading, setGlobalLoading] = React.useState(false);
  const [globalResults, setGlobalResults] = React.useState([]);
  const [unreadChats, setUnreadChats] = React.useState(0);
  const searchBoxRef = React.useRef(null);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Directory', path: '/directory', icon: Users },
    { name: 'Feed', path: '/feed', icon: MessageCircle },
    { name: 'Opportunities', path: '/opportunities', icon: Briefcase },
    { name: 'Challenges', path: '/challenges', icon: Target },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Innovation', path: '/innovation', icon: Zap },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  React.useEffect(() => {
    if (!isLoggedIn) return;
    const fetchUnreadChats = async () => {
      try {
        const response = await api.get('/chats');
        const chats = Array.isArray(response.data?.data)
          ? response.data.data
          : (Array.isArray(response.data) ? response.data : []);
        const unread = chats.filter(chat => (chat.unreadCount || 0) > 0).length;
        setUnreadChats(unread);
      } catch {
        // ignore
      }
    };
    fetchUnreadChats();
  }, [isLoggedIn]);

  React.useEffect(() => {
    if (!socket || !isLoggedIn) return;
    const onNewMessage = (data) => {
      setUnreadChats(prev => prev + 1);
      toast.info("New message", {
        description: data?.message?.text || data?.messagePreview || undefined,
        duration: 3500,
      });
    };
    socket.on("new-message", onNewMessage);
    return () => socket.off("new-message", onNewMessage);
  }, [socket, isLoggedIn]);

  React.useEffect(() => {
    const term = globalQ.trim();
    if (!globalOpen) return;
    if (term.length < 2) {
      setGlobalResults([]);
      setGlobalLoading(false);
      return;
    }

    setGlobalLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await api.get("/search", { params: { q: term, limit: 6 } });
        setGlobalResults(Array.isArray(res.data?.results) ? res.data.results : []);
      } catch {
        setGlobalResults([]);
      } finally {
        setGlobalLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [globalQ, globalOpen]);

  React.useEffect(() => {
    const onDocClick = (e) => {
      if (!searchBoxRef.current) return;
      if (!searchBoxRef.current.contains(e.target)) setGlobalOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <>
      <nav 
        className="w-full z-50 sticky top-0 bg-blue-900 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.18)] border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            
            {/* Logo & Portal Name (Left) */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="h-10 w-10 bg-white/95 rounded-xl flex items-center justify-center shadow-md ring-1 ring-white/20">
                <img src={ldceLogo} alt="LDCE" className="h-7 w-7 object-contain" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-extrabold text-white leading-tight tracking-tight">LDCE Alumni</p>
                <p className="text-[10px] font-semibold text-white/70 uppercase tracking-[0.22em]">AluVerse</p>
              </div>
            </Link>

            {/* Nav Links - Medium Text */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.path || pathname.startsWith(link.path + '/');
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 text-sm font-semibold transition-all duration-200 rounded-xl flex items-center gap-1.5 ${
                      isActive
                        ? 'text-blue-900 bg-white/95 shadow-lg shadow-black/10'
                        : 'text-white/90 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    <link.icon size={15} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Search (Center) */}
            <div className="hidden md:flex flex-1 justify-center max-w-md" ref={searchBoxRef}>
              <div className="w-full relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/80" />
                <input
                  value={globalQ}
                  onChange={(e) => {
                    setGlobalQ(e.target.value);
                    setGlobalOpen(true);
                  }}
                  onFocus={() => setGlobalOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const term = globalQ.trim();
                      if (term.length >= 2) {
                        setGlobalOpen(false);
                        navigate(`/search?q=${encodeURIComponent(term)}`);
                      }
                    }
                    if (e.key === "Escape") setGlobalOpen(false);
                  }}
                  placeholder="Search..."
                  className="h-10 w-full bg-white/15 border border-white/25 rounded-full pl-9 pr-3 text-sm text-white placeholder:text-white/70 focus:border-white/40 focus:ring-4 focus:ring-blue-300/30 focus:outline-none transition-all"
                />

                {globalOpen && (globalQ.trim().length >= 2) && (
                  <div className="absolute top-11 left-0 right-0 bg-white/95 border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[250]">
                    <div className="px-3 py-2 border-b bg-slate-50">
                      <p className="text-xs font-semibold text-slate-700">Results</p>
                    </div>
                    {globalLoading ? (
                      <div className="px-3 py-4 text-xs text-slate-500">Searching…</div>
                    ) : globalResults.length === 0 ? (
                      <div className="px-3 py-4 text-xs text-slate-500">No matches.</div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto">
                        {globalResults.map((r) => (
                          <button
                            key={`${r.type}-${r.id}`}
                            type="button"
                            onClick={() => {
                              setGlobalOpen(false);
                              navigate(r.route, { state: r.state || undefined });
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2"
                          >
                            <div className="h-7 w-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-[10px] font-bold uppercase">
                              {String(r.type || "").slice(0, 1)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">{r.title}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Icons */}
            <div className="flex items-center gap-1">
              {/* Mobile Search */}
              <div className="md:hidden">
                <button
                  type="button"
                  onClick={() => navigate("/search")}
                  className="p-2 text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <Search size={18} />
                </button>
              </div>

              {isLoggedIn ? (
                <>
                  {/* Notifications */}
                  <button 
                    className="p-2 text-white hover:bg-white/10 rounded-xl transition-all relative"
                    onClick={() => navigate('/notifications')}
                  >
                    <Bell size={18} />
                    {notificationCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </button>

                  {/* Chat */}
                  <button 
                    className="p-2 text-white hover:bg-white/10 rounded-xl transition-all relative"
                    onClick={() => navigate('/chat')}
                  >
                    <MessageCircle size={18} />
                    {unreadChats > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                        {unreadChats > 99 ? '99+' : unreadChats}
                      </span>
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-10 w-10 rounded-xl p-0 overflow-hidden border border-white/20 hover:border-white/35 hover:bg-white/10 transition-all"
                      >
                        <Avatar className="h-full w-full">
                          <AvatarImage src={alumni?.profilePhoto || alumni?.photoURL || alumni?.profilePicture || ""} />
                          <AvatarFallback className="bg-blue-600 text-white font-extrabold text-xs">
                            {alumni?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      className="w-64 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-0 z-[200]" 
                      align="end"
                      sideOffset={5}
                    >
                      <DropdownMenuLabel className="p-3 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 rounded-t-2xl border-b border-white/10">
                        <p className="text-sm font-extrabold text-white">{alumni?.name}</p>
                        <p className="text-xs text-white/75 truncate">{alumni?.email}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="m-0" />
                      <div className="p-1.5 space-y-0.5">
                        <DropdownMenuItem className="p-2 cursor-pointer font-semibold gap-2 rounded-xl hover:bg-slate-50 text-sm" onClick={() => navigate('/profile/me')}>
                          <UserIcon size={14} className="text-blue-600" /> My Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="p-2 cursor-pointer font-semibold gap-2 rounded-xl hover:bg-slate-50 text-sm" onClick={() => navigate('/my-connections')}>
                          <Users size={14} className="text-blue-600" /> Connections
                        </DropdownMenuItem>
                        <DropdownMenuItem className="p-2 cursor-pointer font-semibold gap-2 rounded-xl hover:bg-slate-50 text-sm" onClick={() => navigate('/my-activity')}>
                          <TrendingUp size={14} className="text-blue-600" /> Activity
                        </DropdownMenuItem>
                        <DropdownMenuItem className="p-2 cursor-pointer font-semibold gap-2 rounded-xl hover:bg-slate-50 text-sm" onClick={() => navigate('/notifications')}>
                          <Bell size={14} className="text-blue-600" /> Notifications
                        </DropdownMenuItem>
                      </div>
                      <DropdownMenuSeparator className="m-0" />
                      <DropdownMenuItem className="p-2 text-red-600 cursor-pointer font-semibold gap-2 rounded-2xl hover:bg-red-50 m-1 text-sm" onClick={handleLogout}>
                        <LogOut size={14} /> Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Mobile Menu Toggle */}
                  <button 
                    className="lg:hidden p-2 text-white hover:bg-white/10 rounded-xl transition-all"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="text-white/80 text-xs font-semibold hover:bg-white/10 hover:text-white h-9 px-4 rounded-xl" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                  <Button className="bg-white/95 text-blue-900 hover:bg-white font-semibold text-xs h-9 px-4 shadow-md transition-all rounded-xl" onClick={() => navigate('/signup')}>
                    Join
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-slate-950/60 border-t border-white/10 p-2 space-y-0.5 backdrop-blur-xl">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 text-white/90 hover:bg-white/10 rounded-xl font-semibold text-sm"
              >
                <link.icon size={16} />
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
