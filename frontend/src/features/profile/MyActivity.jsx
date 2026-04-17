import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/axios';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Button,
    Badge
} from '@/components/ui';
import {
    ArrowLeft,
    Calendar,
    Briefcase,
    Rocket,
    Trophy,
    Clock,
    MapPin,
    Building,
    Activity,
    Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyActivity = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('events');
    const [loading, setLoading] = useState(true);

    const [activities, setActivities] = useState({
        events: [],
        opportunities: [],
        startups: [],
        challenges: []
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchActivities = async () => {
            try {
                setLoading(true);
                
                // Fetch all activities in parallel
                const [eventsRes, oppsRes, startupsRes, challengesRes] = await Promise.all([
                    api.get(`/events?userId=${user._id}`),
                    api.get(`/opportunities?userId=${user._id}`),
                    api.get(`/startups?userId=${user._id}`),
                    api.get(`/challenges?userId=${user._id}`)
                ]);

                setActivities({
                    events: Array.isArray(eventsRes.data) ? eventsRes.data : eventsRes.data?.data || [],
                    opportunities: Array.isArray(oppsRes.data) ? oppsRes.data : oppsRes.data?.data || [],
                    startups: Array.isArray(startupsRes.data) ? startupsRes.data : startupsRes.data?.data || [],
                    challenges: Array.isArray(challengesRes.data) ? challengesRes.data : challengesRes.data?.data || []
                });
            } catch (error) {
                console.error('Error fetching activities:', error);
                setActivities({
                    events: [],
                    opportunities: [],
                    startups: [],
                    challenges: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [user, navigate]);

    const getActivityCount = (type) => activities[type].length;

    const EmptyState = ({ type, label, actionPath }) => (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
                {type === 'events' && <Calendar className="h-8 w-8 text-slate-400" />}
                {type === 'opportunities' && <Briefcase className="h-8 w-8 text-slate-400" />}
                {type === 'startups' && <Rocket className="h-8 w-8 text-slate-400" />}
                {type === 'challenges' && <Trophy className="h-8 w-8 text-slate-400" />}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No {label} Posted Yet</h3>
            <p className="text-slate-500 text-center mb-6 max-w-xs">
                Share your first {label.slice(0, -1)} with the community today!
            </p>
            <Button onClick={() => navigate(actionPath)} className="bg-blue-600 hover:bg-blue-700 font-bold px-6">
                <Plus className="h-4 w-4 mr-2" />
                Post {label.slice(0, -1)}
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/profile')}
                        className="rounded-full h-10 w-10 p-0 hover:bg-white shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Other Activity</h1>
                        <p className="text-slate-500 font-medium">Manage everything you've shared with the community</p>
                    </div>
                </div>

                <Tabs defaultValue="events" className="w-full" onValueChange={setActiveTab}>
                    <div className="bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white/50 shadow-sm mb-8 overflow-x-auto no-scrollbar">
                        <TabsList className="bg-transparent h-auto p-0 gap-1 w-full justify-start">
                            {[
                                { id: 'events', label: 'My Events', icon: Calendar, color: 'text-orange-500' },
                                { id: 'opportunities', label: 'My Opps', icon: Briefcase, color: 'text-emerald-500' },
                                { id: 'startups', label: 'My Startups', icon: Rocket, color: 'text-blue-500' },
                                { id: 'challenges', label: 'My Challenges', icon: Trophy, color: 'text-purple-500' }
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className={`
                    flex-1 flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold transition-all duration-300
                    data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:scale-[1.02]
                  `}
                                >
                                    <tab.icon className={`h-4 w-4 ${tab.color}`} />
                                    <span>{tab.label}</span>
                                    <Badge variant="secondary" className="ml-1 bg-slate-100/50 text-slate-600 font-black px-2 py-0 border-none">
                                        {getActivityCount(tab.id)}
                                    </Badge>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <div className="min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Events Content */}
                                <TabsContent value="events" className="m-0 space-y-4">
                                    {getActivityCount('events') > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {activities.events.map(event => (
                                                <Card key={event.id} className="group border-none shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden rounded-2xl" onClick={() => navigate('/events')}>
                                                    <div className="h-2 bg-orange-400" />
                                                    <CardContent className="p-6">
                                                        <h3 className="text-lg font-black text-slate-900 group-hover:text-orange-600 transition-colors mb-2 line-clamp-1">{event.title}</h3>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                                                <MapPin className="h-3.5 w-3.5" />
                                                                {event.location || 'Online'}
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 flex justify-between items-center">
                                                            <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-none uppercase text-[10px] font-black">{event.type}</Badge>
                                                            <div className="flex items-center gap-1 text-[10px] font-black text-slate-400">
                                                                <Clock className="h-3 w-3" />
                                                                {event.timestamp ? 'Updated live' : ''}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : <EmptyState type="events" label="Events" actionPath="/events" />}
                                </TabsContent>

                                {/* Opportunities Content */}
                                <TabsContent value="opportunities" className="m-0 space-y-4">
                                    {getActivityCount('opportunities') > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {activities.opportunities.map(opp => (
                                                <Card key={opp.id} className="group border-none shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden rounded-2xl" onClick={() => navigate('/opportunities')}>
                                                    <div className="h-2 bg-emerald-400" />
                                                    <CardContent className="p-6">
                                                        <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-1">{opp.title}</h3>
                                                        <div className="flex items-center gap-2 text-sm text-slate-600 font-bold mb-3">
                                                            <Building className="h-3.5 w-3.5" />
                                                            {opp.company}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {opp.tags?.split(',').map(tag => (
                                                                <Badge key={tag} className="bg-slate-100 text-slate-600 border-none text-[10px] font-bold">{tag.trim()}</Badge>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : <EmptyState type="opportunities" label="Opportunities" actionPath="/opportunities" />}
                                </TabsContent>

                                {/* Startups Content */}
                                <TabsContent value="startups" className="m-0 space-y-4">
                                    {getActivityCount('startups') > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {activities.startups.map(startup => (
                                                <Card key={startup.id} className="group border-none shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden rounded-2xl" onClick={() => navigate('/startup')}>
                                                    <div className="h-2 bg-blue-500" />
                                                    <CardContent className="p-6">
                                                        <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-1">{startup.title}</h3>
                                                        <p className="text-blue-600 font-bold text-xs mb-3 italic">"{startup.tagline}"</p>
                                                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">{startup.description}</p>
                                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                            <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px]">{startup.stage}</Badge>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Founder: {startup.founder}</span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : <EmptyState type="startups" label="Startups" actionPath="/startup" />}
                                </TabsContent>

                                {/* Challenges Content */}
                                <TabsContent value="challenges" className="m-0 space-y-4">
                                    {getActivityCount('challenges') > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {activities.challenges.map(challenge => (
                                                <Card key={challenge.id} className="group border-none shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden rounded-2xl" onClick={() => navigate(`/challenges/${challenge.id}`)}>
                                                    <div className="h-2 bg-purple-500" />
                                                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge className="bg-purple-100 text-purple-700 border-none font-bold text-[10px] tracking-tight">{challenge.domain}</Badge>
                                                                <span className={`w-2 h-2 rounded-full ${new Date(challenge.deadline) > new Date() ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                            </div>
                                                            <h3 className="text-xl font-black text-slate-900 group-hover:text-purple-600 transition-colors mb-2">{challenge.title}</h3>
                                                            <p className="text-slate-500 text-sm line-clamp-1">{challenge.description || challenge.problemStatement}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3 shrink-0">
                                                            {challenge.cashReward && (
                                                                <div className="bg-emerald-50 px-4 py-2 rounded-xl text-center border border-emerald-100">
                                                                    <p className="text-[9px] font-black uppercase text-emerald-600 mb-0.5">Reward</p>
                                                                    <p className="text-sm font-black text-emerald-700">{challenge.cashReward}</p>
                                                                </div>
                                                            )}
                                                            <div className="bg-slate-50 px-4 py-2 rounded-xl text-center border border-slate-100">
                                                                <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5">Deadline</p>
                                                                <p className="text-sm font-black text-slate-700">{new Date(challenge.deadline).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : <EmptyState type="challenges" label="Challenges" actionPath="/challenges" />}
                                </TabsContent>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default MyActivity;
