import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StartupCard from "./StartupCard";
import StartupDetails from "./StartupDetails";
import PostStartupPage from "./PostStartupPage";
import api from "../../services/axios";
import { useRealTime } from "../../contexts/RealTimeContext";
import { 
  Rocket, 
  Plus,
  Zap,
} from 'lucide-react';
import { Button } from "@/components/ui";
import { toast } from "sonner";

const Startup = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const navigate = useNavigate();
  const { socket } = useRealTime();

  const fetchStartups = async () => {
    setLoading(true);
    try {
      console.log('🚀 [Startup] Fetching startups from backend...');
      const response = await api.get('/startups');
      const raw = response.data;
      // Backend returns an array; handle both array and {success,startups} shapes
      const startups = Array.isArray(raw) ? raw : (raw?.startups || raw?.data || []);
      setIdeas(Array.isArray(startups) ? startups : []);
    } catch (error) {
      console.error('❌ [Startup] Error fetching startups:', error);
      toast.error("Failed to load startups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  // Real-time listener
  useEffect(() => {
    if (socket) {
      const handleNewStartup = (data) => {
        const newStartup = data.startup || data;
        console.log('✨ [Startup] New startup received via socket:', newStartup);
        setIdeas(prev => {
          if (prev.some(s => (s._id || s.id) === (newStartup._id || newStartup.id))) return prev;
          return [newStartup, ...prev];
        });
      };

      socket.on('new-startup', handleNewStartup);
      return () => socket.off('new-startup', handleNewStartup);
    }
  }, [socket]);

  const filtered = ideas;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Enhanced Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 text-white py-8 md:py-10 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2 md:space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <Zap className="h-4 w-4 text-cyan-400 fill-cyan-400" />
                <span className="text-xs font-black uppercase tracking-widest text-cyan-50">Innovation Hub</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                LDCE Startup <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Ecosystem</span>
              </h1>
              <p className="text-sm md:text-base text-slate-300 max-w-2xl font-medium leading-relaxed">
                Connect with visionary founders, explore groundbreaking ventures, and be part of the next big success story from L.D. College of Engineering.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => setShowPostModal(true)}
                className="h-12 md:h-14 px-6 md:px-8 bg-white text-blue-900 hover:bg-blue-50 rounded-2xl font-black text-sm md:text-base shadow-2xl shadow-white/10 gap-3 group"
              >
                Launch Your Idea
                <Plus className="h-5 w-5 md:h-6 md:w-6 group-hover:rotate-90 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 mt-8 md:mt-10 relative z-20">

        {/* Startups Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[450px] bg-white rounded-[2rem] animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-20 md:py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Rocket className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No startups found</h3>
                <p className="text-slate-500 font-medium mb-8">Try adjusting your search or be the first to launch one!</p>
                <Button onClick={() => setShowPostModal(true)} className="bg-blue-600 font-black rounded-xl px-8 h-12">
                  Launch Now
                </Button>
              </div>
            ) : (
              filtered.map(startup => (
                <StartupCard
                  key={startup._id || startup.id}
                  startup={startup}
                  onClick={() => navigate(`/innovation/${startup._id || startup.id}`)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Post Modal Overlay */}
      {showPostModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowPostModal(false)}
        >
          <div onClick={e => e.stopPropagation()}>
            <PostStartupPage 
              onClose={() => setShowPostModal(false)}
              onSuccess={() => {
                setShowPostModal(false);
                fetchStartups();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Startup;
