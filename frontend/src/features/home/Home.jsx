import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Users, Calendar, Briefcase, Building2,
  Target, ChevronRight, ChevronLeft
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useState, useEffect } from "react";
import api from "@/services/axios";
import AlumniSpotlights from "./AlumniSpotlights";

const Home = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  // Real data states
  const [opportunities, setOpportunities] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [oppsRes, challengesRes, eventsRes] = await Promise.all([
          api.get('/opportunities?limit=3').catch(() => ({ data: { data: [] } })),
          api.get('/challenges?limit=3').catch(() => ({ data: { data: [] } })),
          api.get('/events?limit=4').catch(() => ({ data: { data: [] } }))
        ]);

        const getItems = (res) => {
          if (!res || !res.data) return [];
          if (Array.isArray(res.data)) return res.data;
          return res.data.data || [];
        };

        setOpportunities(getItems(oppsRes));
        setChallenges(getItems(challengesRes));
        setEvents(getItems(eventsRes));
      } catch (error) {
        console.error("❌ [Home] Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section - Clean & Professional */}
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-20 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
            animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
            animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/20 mb-8"
          >
            <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-sm font-black uppercase tracking-wider text-cyan-200">Welcome to LDCE Alumni Network</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight"
          >
            Connect, Grow &<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Make an Impact</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Join a thriving community of LDCE graduates. Explore opportunities, collaborate on challenges, and build lasting professional relationships.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {!isLoggedIn ? (
              <>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-black rounded-2xl px-10 h-14 text-lg shadow-2xl transition-all duration-300 group"
                  onClick={() => navigate('/signup')}
                >
                  <span className="flex items-center gap-3">
                    Get Started <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
                <Button
                  size="lg"
                  className="bg-white/15 backdrop-blur-md text-white border-2 border-white/30 hover:bg-white/20 font-bold rounded-2xl px-10 h-14 text-lg transition-all duration-300"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-black rounded-2xl px-10 h-14 text-lg shadow-2xl transition-all duration-300 group"
                onClick={() => navigate('/feed')}
              >
                <span className="flex items-center gap-3">
                  Explore Feed <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">

        {/* Stats Section - Professional Cards */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {/* Stat 1: Alumni */}
            <div className="group">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                  <Users className="h-7 w-7" />
                </div>
                <div className="text-5xl font-black text-blue-600 mb-2">2.5K+</div>
                <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Active Alumni</p>
                <div className="mt-4 h-1 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
              </motion.div>
            </div>

            {/* Stat 2: Events */}
            <div className="group">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-8 border-2 border-rose-200 hover:border-rose-400 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                <div className="h-14 w-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                  <Calendar className="h-7 w-7" />
                </div>
                <div className="text-5xl font-black text-rose-600 mb-2">{events.length || "15"}+</div>
                <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Events Annually</p>
                <div className="mt-4 h-1 w-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" />
              </motion.div>
            </div>

            {/* Stat 3: Opportunities */}
            <div className="group">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                  <Briefcase className="h-7 w-7" />
                </div>
                <div className="text-5xl font-black text-emerald-600 mb-2">{opportunities.length || "30"}+</div>
                <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Job Postings</p>
                <div className="mt-4 h-1 w-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
              </motion.div>
            </div>

            {/* Stat 4: Challenges */}
            <div className="group">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                  <Target className="h-7 w-7" />
                </div>
                <div className="text-5xl font-black text-purple-600 mb-2">{challenges.length || "12"}+</div>
                <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Competitions</p>
                <div className="mt-4 h-1 w-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Featured Opportunities */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-2">Career Opportunities</p>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900">Latest Job Openings</h2>
              </div>
              <Button 
                variant="outline" 
                className="h-12 px-6 border-2 border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-50 rounded-xl"
                asChild
              >
                <Link to="/opportunities" className="flex items-center gap-2">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {opportunities.length > 0 ? (
              opportunities.map((opp, index) => (
                <motion.div
                  key={opp._id || opp.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="h-full border-2 border-slate-100 hover:border-emerald-300 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group bg-white">
                    <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <Briefcase className="h-6 w-6" />
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-xs px-3 py-1 rounded-lg">
                          {opp.roleType || 'Full-time'}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {opp.title}
                      </CardTitle>
                      <p className="text-sm text-slate-600 font-bold mt-2 flex items-center gap-1">
                        <Building2 className="h-4 w-4" /> {opp.company}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-wrap gap-2">
                        {opp.skills?.slice(0, 2).map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-slate-100 text-slate-700 border-none text-xs font-semibold rounded-lg">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl py-2"
                        onClick={() => navigate('/opportunities')}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500 font-bold">No opportunities available yet</p>
              </div>
            )}
          </div>
        </section>

        {/* Featured Challenges */}
        <section className="bg-gradient-to-br from-purple-50 to-blue-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 rounded-3xl border-2 border-purple-200">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
              <div>
                <p className="text-sm font-black text-purple-600 uppercase tracking-widest mb-2">Compete & Learn</p>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900">Active Challenges</h2>
              </div>
              <Button 
                variant="outline" 
                className="h-12 px-6 border-2 border-purple-300 text-purple-700 font-bold hover:bg-purple-100 rounded-xl"
                asChild
              >
                <Link to="/challenges" className="flex items-center gap-2">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.length > 0 ? (
              challenges.map((challenge, index) => (
                <motion.div
                  key={challenge._id || challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="h-full border-2 border-white bg-white hover:border-purple-300 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className="h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                          <Target className="h-6 w-6" />
                        </div>
                        <Badge className="bg-purple-100 text-purple-700 border-none font-bold text-xs px-3 py-1 rounded-lg">
                          {challenge.domain || 'Tech'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-black text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {challenge.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {challenge.description || challenge.problemStatement}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Reward</p>
                          <p className="text-lg font-black text-slate-900">{challenge.prize || 'Recognition'}</p>
                        </div>
                        <Button 
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg px-4 py-2"
                          asChild
                        >
                          <Link to={`/challenges/${challenge._id || challenge.id}`}>Join</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500 font-bold">No challenges available yet</p>
              </div>
            )}
          </div>
        </section>

        {/* Upcoming Events */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm font-black text-rose-600 uppercase tracking-widest mb-2">Campus Pulse</p>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900">Upcoming Events</h2>
              </div>
              <Button 
                variant="outline" 
                className="h-12 px-6 border-2 border-rose-200 text-rose-700 font-bold hover:bg-rose-50 rounded-xl"
                asChild
              >
                <Link to="/events" className="flex items-center gap-2">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {events.length > 0 ? (
              events.map((event, index) => (
                <motion.div
                  key={event._id || event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card className="h-full border-2 border-slate-100 hover:border-rose-300 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group bg-white flex flex-col">
                    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-rose-400 to-pink-500">
                      {event.coverImage ? (
                        <img 
                          src={event.coverImage} 
                          alt={event.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30">
                          <Calendar className="h-12 w-12" />
                        </div>
                      )}
                      <Badge className="absolute top-3 right-3 bg-white text-rose-700 border-none font-bold text-xs px-3 py-1 rounded-lg">
                        {event.mode || 'Offline'}
                      </Badge>
                    </div>
                    <CardContent className="p-6 flex-grow flex flex-col">
                      <h4 className="text-lg font-black text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 mb-4">
                        {event.title}
                      </h4>
                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-600 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-rose-500" />
                          {event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                        </span>
                        <Link to={`/events/${event._id || event.id}`} className="text-rose-600 font-bold hover:text-rose-700">
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-4 text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500 font-bold">No events scheduled yet</p>
              </div>
            )}
          </div>
        </section>

        {/* ==================== TEN ALUMNI STORIES SECTION ==================== */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <p className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-2">Success Stories</p>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900">Alumni Success Stories</h2>
              <p className="text-xl text-slate-600 mt-4 max-w-3xl mx-auto">Inspiring journeys from our graduates who've made their mark in the industry</p>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                name: "Raj Patel",
                role: "Senior Software Engineer",
                company: "Google",
                story: "From college projects to Google. Here's how mentorship changed my career.",
                image: "👨‍💻"
              },
              {
                name: "Priya Singh",
                role: "Product Manager",
                company: "Microsoft",
                story: "Building products that impact millions. My LDCE foundation made it possible.",
                image: "👩‍💼"
              },
              {
                name: "Amit Verma",
                role: "Startup Founder",
                company: "TechFlow AI",
                story: "Started in a dorm room, now raising Series B. Thank you LDCE!",
                image: "🚀"
              },
              {
                name: "Neha Gupta",
                role: "Data Scientist",
                company: "Amazon",
                story: "Leading ML initiatives. The analytical foundation from college was key.",
                image: "📊"
              },
              {
                name: "Vikram Kumar",
                role: "DevOps Lead",
                company: "Meta",
                story: "Building infrastructure at scale. LDCE's project experience was invaluable.",
                image: "⚙️"
              },
              {
                name: "Sarah Johnson",
                role: "UX Designer",
                company: "Apple",
                story: "Designing for millions of users. Started with passion, LDCE polished it.",
                image: "🎨"
              },
              {
                name: "Chen Wei",
                role: "Security Engineer",
                company: "Cisco",
                story: "Protecting networks globally. LDCE taught me to think like a hacker.",
                image: "🔒"
              },
              {
                name: "Emma Davis",
                role: "Consultant",
                company: "McKinsey",
                story: "Advising Fortune 500 companies. My LDCE network opened all doors.",
                image: "🤝"
              },
              {
                name: "Arjun Nair",
                role: "ML Engineer",
                company: "OpenAI",
                story: "Working on AI that matters. LDCE's rigorous curriculum set me up.",
                image: "🤖"
              },
              {
                name: "Lisa Chen",
                role: "VP Engineering",
                company: "Stripe",
                story: "Building payment infrastructure. From student to VP - LDCE made it count.",
                image: "💎"
              }
            ].map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border-2 border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="text-5xl mb-4">{story.image}</div>
                <h4 className="font-black text-slate-900 text-lg mb-1">{story.name}</h4>
                <p className="text-sm font-bold text-indigo-600 mb-1">{story.role}</p>
                <Badge className="bg-indigo-100 text-indigo-700 border-none w-fit mb-4 rounded-lg text-xs font-bold px-2 py-1">
                  {story.company}
                </Badge>
                <p className="text-sm text-slate-600 leading-relaxed flex-grow italic">
                  "{story.story}"
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ==================== ALUMNI SPOTLIGHT SECTION ==================== */}
        <AlumniSpotlights />

        {/* ==================== SOCIAL MEDIA LINKS SECTION ==================== */}
        <section className="text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div>
              <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Stay Connected</p>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Join Our Community</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">Follow us on social media to stay updated with the latest alumni stories, events, and opportunities</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 max-w-4xl mx-auto">
              {/* LinkedIn */}
              <motion.a
                href="https://linkedin.com/company/ldce-alumni"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="group relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <span className="text-4xl">💼</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  LinkedIn
                </div>
              </motion.a>

              {/* Twitter/X */}
              <motion.a
                href="https://twitter.com/ldce_alumni"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="group relative w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <span className="text-4xl">𝕏</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  Twitter/X
                </div>
              </motion.a>

              {/* Instagram */}
              <motion.a
                href="https://instagram.com/ldce_alumni"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="group relative w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <span className="text-4xl">📷</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  Instagram
                </div>
              </motion.a>

              {/* Facebook */}
              <motion.a
                href="https://facebook.com/ldce.alumni"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="group relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <span className="text-4xl">f</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  Facebook
                </div>
              </motion.a>

              {/* YouTube */}
              <motion.a
                href="https://youtube.com/@ldce-alumni"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="group relative w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <span className="text-4xl">▶️</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  YouTube
                </div>
              </motion.a>

              {/* Discord */}
              <motion.a
                href="https://discord.gg/ldce-alumni"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="group relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <span className="text-4xl">💬</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  Discord
                </div>
              </motion.a>
            </div>

            <div className="pt-8">
              <p className="text-slate-600 font-bold mb-4">Or subscribe to our newsletter</p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:outline-none font-semibold text-slate-900 placeholder-slate-500"
                />
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black rounded-xl px-8">
                  Subscribe
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-5xl font-black text-white">Ready to Connect?</h2>
              <p className="text-xl text-cyan-50 max-w-2xl mx-auto">Join thousands of LDCE graduates in a vibrant professional community. Explore opportunities, collaborate, and grow together.</p>
              <Button
                size="lg"
                className="bg-white text-cyan-600 hover:bg-slate-100 font-black rounded-2xl px-10 h-14 text-lg shadow-xl"
                onClick={() => isLoggedIn ? navigate('/directory') : navigate('/signup')}
              >
                {isLoggedIn ? 'Explore Directory' : 'Get Started'} <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
