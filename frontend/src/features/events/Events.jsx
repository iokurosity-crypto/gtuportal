
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui";
import { motion } from "framer-motion";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useRealTime } from "@/contexts/RealTimeContext.jsx";
import { toast } from "sonner";
import api from "@/services/axios";
import CreateEventFixed from "./components/CreateEventFixed";
import EventCard from "./components/EventCard";
import { useLocation, useNavigate } from "react-router-dom";

const Events = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, requireAuth } = useAuth();
  const { socket } = useRealTime();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const sortedEvents = useMemo(() => {
    if (!eventsList.length) return [];

    const toJSDate = (v) => {
      try {
        if (!v) return new Date();
        if (typeof v.toDate === 'function') return v.toDate();
        const d = v instanceof Date ? v : new Date(v);
        return isNaN(d.getTime()) ? new Date() : d;
      } catch {
        return new Date();
      }
    };

    const now = new Date();
    
    // Separate upcoming and past events
    const upcoming = eventsList.filter(e => toJSDate(e.date || e.startDate) >= now);
    const past = eventsList.filter(e => toJSDate(e.date || e.startDate) < now);

    // Sort upcoming events: nearest first (ascending)
    upcoming.sort((a, b) => toJSDate(a.date || a.startDate) - toJSDate(b.date || b.startDate));
    
    // Sort past events: most recent first (descending)
    past.sort((a, b) => toJSDate(b.date || b.startDate) - toJSDate(a.date || a.startDate));

    return [...upcoming, ...past];
  }, [eventsList]);

  // Fetch events from API on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get('events');
        
        // Handle different response formats
        let events = [];
        if (Array.isArray(res.data)) {
          events = res.data;
        } else if (res.data?.events && Array.isArray(res.data.events)) {
          events = res.data.events;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          events = res.data.data;
        }
        
        console.log('✅ Fetched', events.length, 'events from API');
        setEventsList(events);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        toast.error('Failed to load events');
        setEventsList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Scroll to a specific event (from global search / activity links)
  useEffect(() => {
    const targetId = location.state?.scrollToId;
    if (!targetId) return;
    if (!sortedEvents?.length) return;

    const el = document.getElementById(`event-${targetId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-indigo-300");
      setTimeout(() => el.classList.remove("ring-2", "ring-indigo-300"), 1600);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [sortedEvents, location.state, navigate, location.pathname]);

  // Handle opening the event creation dialog
  const handlePost = () => {
    if (requireAuth()) {
      setIsDialogOpen(true);
    }
  };

  // Handle event creation
  const handleCreate = (newEventData) => {
    console.log('✅ Event created:', newEventData);
    setIsDialogOpen(false);
    
    // Add event to list
    const newEvent = {
      _id: newEventData._id || newEventData.id,
      id: newEventData._id || newEventData.id,
      ...newEventData,
      createdAt: newEventData.createdAt || new Date().toISOString(),
      date: newEventData.date || newEventData.startDate || new Date().toISOString()
    };
    
    setEventsList(prev => [newEvent, ...prev]);
    toast.success('Event created successfully!');
  };

  // Listen for new events via socket.io
  useEffect(() => {
    if (!socket) return;

    const handleNewEvent = (eventData) => {
      console.log('🎉 New event received via socket:', eventData);
      
      // Add the new event to the list
      const newEvent = {
        _id: eventData._id || eventData.id,
        id: eventData._id || eventData.id,
        ...eventData,
        createdAt: eventData.createdAt || new Date().toISOString(),
        date: eventData.date || eventData.startDate || new Date().toISOString()
      };
      
      setEventsList(prev => {
        // Check if event already exists to avoid duplicates
        const exists = prev.some(e => (e._id || e.id) === (newEvent._id || newEvent.id));
        if (exists) {
          console.log('📌 Event already exists, skipping');
          return prev;
        }
        console.log('✅ Adding new event to list');
        return [newEvent, ...prev];
      });
      
      toast.success('New event posted!');
      
      // Refresh events list after 2 seconds
      console.log('📝 Triggering event list refresh in 2 seconds...');
      setTimeout(async () => {
        try {
          console.log('🔄 Fetching fresh events from API...');
          const response = await api.get('events');
          
          let freshEvents = [];
          if (Array.isArray(response.data)) {
            freshEvents = response.data;
          } else if (response.data?.events && Array.isArray(response.data.events)) {
            freshEvents = response.data.events;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            freshEvents = response.data.data;
          }
          
          console.log('✅ Fetched fresh events from API:', freshEvents.length, 'total');
          setEventsList(freshEvents);
        } catch (error) {
          console.warn('⚠️ Failed to refresh events from API:', error);
          toast.warning('Please refresh the page to see new events');
        }
      }, 2000);
    };

    // Listen for new events via socket
    socket.on('event-created', handleNewEvent);

    // Cleanup listener on unmount
    return () => {
      socket.off('event-created', handleNewEvent);
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Events</h2>
              <span className="text-sm font-medium text-gray-500">{sortedEvents.length} upcoming events</span>
            </div>
          </div>

          {(user?.role === "alumni" || user?.role === "student") && (
            <Button
              onClick={handlePost}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white gap-2 rounded-full font-bold shadow-xl hover:shadow-2xl active:scale-95 transition-all"
            >
              <Plus className="h-5 w-5" /> Create Event
            </Button>
          )}
        </div>

        {isDialogOpen && (
          <CreateEventFixed
            onEventCreate={handleCreate}
            onClose={() => setIsDialogOpen(false)}
          />
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton cards
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-[450px] animate-pulse shadow-lg" />
              ))}
            </>
          ) : sortedEvents.length === 0 ? (
            // Empty state
            <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-lg border border-slate-200">
              <CalendarIcon className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-slate-600 mb-2">No events yet</h3>
              <p className="text-slate-400 mb-6">Be the first to host an event!</p>
              {(user?.role === "alumni" || user?.role === "student") && (
                <Button
                  onClick={handlePost}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold"
                >
                  Create Your First Event
                </Button>
              )}
            </div>
          ) : (
            // Events grid
            sortedEvents.map((event, i) => (
              <motion.div
                key={event._id || event.id}
                id={`event-${event._id || event.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <EventCard
                  event={event}
                  onViewDetails={() => navigate(`/events/${event._id || event.id}`)}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
