import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Users, Calendar, Briefcase, Building2,
  Target, ChevronRight, ChevronLeft, Play, Instagram, Globe, Mail,
  ShieldCheck, Award, Zap, Rocket, Star, History,
  TrendingUp, GraduationCap, UserPlus, Facebook, Linkedin, ExternalLink, MapPin, Send
} from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useState, useEffect, useRef, memo } from "react";
import api from "@/services/axios";
import noteworthyAlumni from "@/data/noteworthyAlumni.json";
import eventsData from "@/data/eventsData.json";
import { resolveAlumniImage } from "@/utils/alumniAssets";
import AlumniSpotlights from "./AlumniSpotlights";
import LazyImage from "@/components/LazyImage";
import LazyVideo from "@/components/LazyVideo";

// Video paths from public folder
const video1 = "/video1.mp4";
const video2 = "/video2.mp4";

// Helper function to get alumni image path
const getAlumniImagePath = (imagePath) => {
  return (
    resolveAlumniImage(imagePath) ||
    `https://via.placeholder.com/300?text=No+Image`
  );
};

// Helper function to get event image path
const getEventImagePath = (imagePath) => {
  if (!imagePath) return `https://via.placeholder.com/400?text=No+Image`;
  if (imagePath.startsWith('http')) return imagePath;
  const filename = imagePath.split('/').pop();
  return new URL(`../../data/assets/images/events/${filename}`, import.meta.url).href;
};

const HomeCommunity = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loadingOpps, setLoadingOpps] = useState(true);
  const [loadingChals, setLoadingChals] = useState(true);
  
  // Refs for managing timers
  const pauseTimerRef = useRef(null);
  const autoPlayTimerRef = useRef(null);

  // Hero Images from Public Folder
  const heroImages = [
    '/silde0.jpg',
    '/silde1.jpg',
    '/silde2.jpg',
    '/silde5.jpg',
    '/silde6.jpg',
    '/silde7.jpg',
    '/silde8.jpg'
  ];

  // Manual navigation handler - pauses auto-play and resumes after 5 seconds
  const handleSlideNavigation = (direction) => {
    // Clear any existing timers
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    
    // Navigate to new slide
    if (direction === 'next') {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    } else {
      setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    }
    
    // Pause auto-play
    setIsPaused(true);
    
    // Resume auto-play after 5 seconds of user interaction
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  };

  const handleDotClick = (index) => {
    // Clear any existing timers
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    
    setCurrentSlide(index);
    setIsPaused(true);
    
    // Resume auto-play after 5 seconds
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  };

  // Auto-transition slideshow every 3 seconds (only when not paused)
  useEffect(() => {
    if (!isPaused) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
      }, 3000);
    }
    
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPaused, heroImages.length]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, []);

  // Fetch opportunities from API
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await api.get('/opportunities');
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setOpportunities(data.slice(0, 3)); // Show top 3
        setLoadingOpps(false);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        // Fallback to default data if API fails
        setOpportunities([
          { title: 'Senior Software Engineer at TCS', company: 'Tata Consultancy Services', salary: '₹12L - ₹18L', _id: '1' },
          { title: 'Product Manager at Goldman Sachs', company: 'Goldman Sachs', salary: '₹24L - ₹32L', _id: '2' },
          { title: 'Data Science Intern at Accenture', company: 'Accenture', salary: '₹6L - ₹9L', _id: '3' },
        ]);
        setLoadingOpps(false);
      }
    };
    fetchOpportunities();
  }, []);

  // Fetch challenges from API
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await api.get('/challenges');
        const data = response.data?.data || response.data || [];
        setChallenges(Array.isArray(data) ? data.slice(0, 3) : []); // Show top 3
        setLoadingChals(false);
      } catch (error) {
        console.error('Error fetching challenges:', error);
        // Fallback to default data if API fails
        setChallenges([
          { title: 'AI/ML Hackathon 2026', cashReward: 500000, deadline: 'May 15, 2026', _id: '1' },
          { title: 'Web Development Challenge', cashReward: 200000, deadline: 'May 20, 2026', _id: '2' },
          { title: 'Innovation Challenge', cashReward: 1000000, deadline: 'Jun 01, 2026', _id: '3' },
        ]);
        setLoadingChals(false);
      }
    };
    fetchChallenges();
  }, []);

  return (
    <div className="w-full overflow-x-hidden bg-white">
      {/* 1. HERO SECTION - Full Screen Slideshow */}
      <section className="w-full relative overflow-hidden bg-slate-900 -mt-14" style={{ height: 'calc(100vh + 56px)', minHeight: 'calc(100vh + 56px)' }}>
        {/* Image Container with smooth transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Blurred Background Layer - Scaled & Blurred */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${heroImages[currentSlide]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(25px)',
                transform: 'scale(1.15)',
              }}
            />
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Clear Foreground Image Layer - Centered */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <LazyImage 
                src={heroImages[currentSlide]}
                alt={`Slide ${currentSlide + 1}`}
                className="h-full w-full object-contain will-change-auto"
                placeholderSrc={heroImages[0]}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows - No Blur */}
        <button 
          onClick={() => handleSlideNavigation('prev')}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 h-14 w-14 rounded-full bg-black/40 border border-white/50 flex items-center justify-center text-white hover:bg-black/60 transition-all group"
        >
          <ChevronLeft className="h-7 w-7 group-hover:-translate-x-1 transition-transform" />
        </button>

        <button 
          onClick={() => handleSlideNavigation('next')}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 h-14 w-14 rounded-full bg-black/40 border border-white/50 flex items-center justify-center text-white hover:bg-black/60 transition-all group"
        >
          <ChevronRight className="h-7 w-7 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Pagination Dots - Bottom */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3 bg-black/50 px-6 py-3 rounded-full border border-white/30"
        >
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`transition-all h-2 rounded-full ${
                currentSlide === i 
                  ? "w-8 bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/50" 
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </motion.div>
      </section>

      {/* 2. ALUMNI STORIES - Full Screen Section */}
      <section className="w-full py-8 md:py-10 flex flex-col justify-center bg-gradient-to-br from-slate-50 via-white to-orange-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="text-center mb-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-2"
            >
              Alumni <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Stories</span>
            </motion.h2>
            <p className="text-slate-600 text-sm md:text-base font-bold">Real journeys of excellence</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Video 1 - Memories */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 aspect-video group"
            >
              <video className="w-full h-full object-cover" controls playsInline>
                <source src={video1} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Memories</span>
              </div>
            </motion.div>

            {/* Video 2 - Unforgettable Moments */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 aspect-video group"
            >
              <video className="w-full h-full object-cover" controls playsInline>
                <source src={video2} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Unforgettable Moments</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. ALUMNI SPOTLIGHT - NEW COMPONENT (Full screen handled inside) */}
      <AlumniSpotlights />

      {/* 4. FIND YOUR BATCH - Compact Professional Section */}
      <section className="w-full py-8 md:py-10 bg-gradient-to-br from-orange-50/30 via-white to-slate-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/15 to-amber-200/15 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-amber-200/15 to-orange-200/15 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 7, repeat: Infinity }}
            className="absolute top-1/3 right-1/3 w-40 h-40 bg-orange-300/5 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            {/* Left Side: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-orange-100 rounded-full border border-orange-200">
                <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
                <span className="text-xs font-black text-orange-700 uppercase tracking-widest">Legacy Network</span>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 leading-tight mb-3">
                Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Batch Legacy</span>
              </h2>

              <p className="text-slate-600 text-xs md:text-sm font-medium leading-relaxed mb-4">
                Reconnect with classmates, explore shared memories, and discover where your batchmates are making an impact today.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-sm border border-orange-200 shadow-sm hover:shadow-md transition-all"
                >
                  <p className="text-lg md:text-2xl font-black text-orange-600 mb-0.5">75+</p>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Active Batches</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-3 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/50 backdrop-blur-sm border border-amber-200 shadow-sm hover:shadow-md transition-all"
                >
                  <p className="text-lg md:text-2xl font-black text-amber-600 mb-0.5">50k+</p>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Alumni Connected</p>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/directory')}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-black text-xs rounded-lg shadow-lg shadow-orange-600/30 hover:from-orange-700 hover:to-amber-700 transition-all"
                >
                  Browse Batches
                  <ArrowRight className="w-3 h-3" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/directory?view=yearbook')}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-orange-700 font-black text-xs rounded-lg border border-orange-200 hover:bg-orange-50 transition-all"
                >
                  View Yearbooks
                </motion.button>
              </div>
            </motion.div>

            {/* Right Side: Visual Grid with Professional Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              {/* Batch Cards Grid */}
              <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4">
                {[
                  { year: '2024', color: 'from-orange-500 to-amber-600', delay: 0 },
                  { year: '2015', color: 'from-amber-500 to-orange-600', delay: 0.1 },
                  { year: '2008', color: 'from-orange-600 to-red-600', delay: 0.2 },
                  { year: '1995', color: 'from-amber-600 to-orange-700', delay: 0.1 },
                  { year: '1982', color: 'from-orange-500 to-amber-500', delay: 0.2 },
                  { year: '1970', color: 'from-amber-600 to-orange-500', delay: 0.3 },
                ].map((batch) => (
                  <motion.div
                    key={batch.year}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: batch.delay, duration: 0.4 }}
                    whileHover={{ y: -4, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/directory?batch=${batch.year}`)}
                    className={`relative aspect-square rounded-lg bg-gradient-to-br ${batch.color} p-4 flex flex-col justify-between items-center shadow-lg hover:shadow-xl cursor-pointer transition-all group overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <div className="w-14 h-14 rounded-md bg-white/30 backdrop-blur-md flex items-center justify-center text-white relative z-10">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <div className="text-center relative z-10">
                      <p className="text-[10px] font-black text-white/80 uppercase tracking-wide mb-1">Batch</p>
                      <p className="text-sm md:text-base font-black text-white">{batch.year}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Professional Achievement Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-2 md:gap-3"
              >
                <div className="p-3 md:p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-0.5">Success Stories</p>
                      <p className="text-lg md:text-xl font-black text-orange-700">1000+</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-orange-200/50 flex items-center justify-center text-sm">
                      🏆
                    </div>
                  </div>
                  <p className="text-[9px] text-orange-600 font-bold">Career achievements</p>
                </div>

                <div className="p-3 md:p-3 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Connections</p>
                      <p className="text-lg md:text-xl font-black text-amber-700">15k+</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-amber-200/50 flex items-center justify-center text-sm">
                      🤝
                    </div>
                  </div>
                  <p className="text-[9px] text-amber-600 font-bold">Active networks</p>
                </div>

                <div className="p-3 md:p-3 rounded-lg bg-gradient-to-br from-orange-50 to-yellow-100/50 border border-orange-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-0.5">Startups</p>
                      <p className="text-lg md:text-xl font-black text-orange-700">200+</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-orange-200/50 flex items-center justify-center text-sm">
                      🚀
                    </div>
                  </div>
                  <p className="text-[9px] text-orange-600 font-bold">Founded by alumni</p>
                </div>

                <div className="p-3 md:p-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-100/50 border border-amber-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Since</p>
                      <p className="text-lg md:text-xl font-black text-amber-700">1970</p>
                    </div>
                    <div className="w-8 h-8 rounded-md bg-amber-200/50 flex items-center justify-center text-sm">
                      🗜
                    </div>
                  </div>
                  <p className="text-[9px] text-amber-600 font-bold">Legacy tradition</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Opportunities & Challenges Section - Full Screen */}
      <section className="w-full py-8 md:py-10 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          {/* Section Heading */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-2">
              Grow & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Succeed</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-bold max-w-2xl mx-auto">
              Discover exciting opportunities and challenges to accelerate your career.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opportunities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-slate-100 hover:shadow-orange-200/50 transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-900">Opportunities</h3>
              </div>
              
              <div className="space-y-2 mb-4">
                {loadingOpps ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  </div>
                ) : opportunities.length > 0 ? (
                  opportunities.slice(0, 2).map((opp, idx) => (
                    <motion.div
                      key={opp._id || idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-orange-300 hover:bg-white hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate('/opportunities')}
                    >
                      <p className="font-black text-slate-900 text-sm line-clamp-1">{opp.title}</p>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <p className="text-orange-600 font-bold">{opp.company || 'Company'}</p>
                        <p className="text-slate-400 font-bold">{opp.salary || 'Competitive'}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm font-bold py-4 text-center">No opportunities available</p>
                )}
              </div>

              <button
                onClick={() => navigate('/opportunities')}
                className="w-full py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-black text-sm rounded-lg shadow-lg hover:from-orange-700 hover:to-orange-800 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                Explore All <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>

            {/* Challenges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-slate-100 hover:shadow-amber-200/50 transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-900">Challenges</h3>
              </div>
              
              <div className="space-y-2 mb-4">
                {loadingChals ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  </div>
                ) : challenges.length > 0 ? (
                  challenges.slice(0, 2).map((challenge, idx) => (
                    <motion.div
                      key={challenge._id || idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-amber-300 hover:bg-white hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate('/challenges')}
                    >
                      <p className="font-black text-slate-900 text-sm line-clamp-1">{challenge.title}</p>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <p className="text-amber-600 font-bold">💰 ₹{(challenge.cashReward || 0).toLocaleString('en-IN')}</p>
                        <p className="text-slate-400 font-bold">📅 {challenge.deadline || 'TBD'}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm font-bold py-4 text-center">No challenges available</p>
                )}
              </div>

              <button
                onClick={() => navigate('/challenges')}
                className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-sm rounded-lg shadow-lg hover:from-amber-700 hover:to-orange-700 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                Explore All <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. UPCOMING EVENTS - Full Screen */}
      <section className="w-full py-8 md:py-12 bg-gradient-to-br from-slate-50 via-white to-orange-50/20\">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="text-center mb-6 md:mb-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-2"
            >
              Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500\">Events</span>
            </motion.h2>
            <p className="text-slate-500 text-base md:text-lg font-bold">Don't miss out on the latest community gatherings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {eventsData.slice(2, 5).filter(event => event.title !== 'Remote Webinar: Data Science Careers' && event.title !== 'Global Alumni Meetup 2026').map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-orange-200/50 transition-all duration-500 h-full flex flex-col">
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={getEventImagePath(event.image)} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 text-center shadow-xl">
                        <p className="text-xs font-black text-orange-600 uppercase tracking-widest">{event.date.split(' ')[1]}</p>
                        <p className="text-2xl font-black text-slate-900">{event.date.split(' ')[0]}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 md:p-5 flex flex-col flex-1">
                    <h3 className="text-base md:text-lg font-black text-slate-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-slate-500 text-xs md:text-sm font-medium line-clamp-1 mb-3">
                      {event.description}
                    </p>
                    <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin size={14} />
                        <span className="text-xs font-bold truncate">{event.location}</span>
                      </div>
                      <ChevronRight size={18} className="text-orange-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              onClick={() => navigate('/events')}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black rounded-lg h-10 px-6 text-sm shadow-lg shadow-orange-600/20"
            >
              View All Events <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* 5. STAY CONNECTED - Social Media with Embedded Feeds */}
      <section className="w-full py-8 md:py-10 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 relative overflow-hidden\">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-black text-white mb-2"
            >
              Stay <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Connected</span>
            </motion.h2>
            <p className="text-white/70 text-sm md:text-base font-bold max-w-2xl mx-auto">
              Browse posts directly below. Click any card to open the full page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Instagram Card with Embedded Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="rounded-xl overflow-hidden bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-[2px]"
            >
              <div className="rounded-xl bg-slate-950/95 backdrop-blur-md overflow-hidden flex flex-col">
                <div className="p-3 md:p-4 flex items-center gap-3 border-b border-white/10">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-pink-500/30 flex-shrink-0">
                    <Instagram className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-black text-white">LDCE Alumni Association</h3>
                    <p className="text-pink-300 text-xs font-bold">@ldce_alumni_association</p>
                  </div>
                  <a href="https://www.instagram.com/ldce_alumni_association?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-black rounded-lg hover:from-pink-600 hover:to-red-600 transition-all flex items-center gap-1 flex-shrink-0">
                    Follow <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="h-48 md:h-56 overflow-hidden relative bg-black/20">
                  <iframe src="https://www.instagram.com/ldce_alumni_association/embed/" className="w-full h-full border-0" loading="lazy" title="Instagram Feed" style={{ background: 'transparent' }} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none opacity-0 [&:only-child]:opacity-100 [&:only-child]:pointer-events-auto">
                    <Instagram className="h-16 w-16 text-pink-400/50" />
                    <p className="text-white/50 text-sm font-bold">Unable to load Instagram feed</p>
                    <a href="https://www.instagram.com/ldce_alumni_association?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="pointer-events-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm font-black rounded-xl hover:from-pink-600 hover:to-red-600 transition-all">
                      Open on Instagram <ExternalLink className="h-4 w-4 inline ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Facebook Card with Embedded Page Plugin */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 p-[2px]"
            >
              <div className="rounded-xl bg-slate-950/95 backdrop-blur-md overflow-hidden flex flex-col">
                <div className="p-3 md:p-4 flex items-center gap-3 border-b border-white/10">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                    <Facebook className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-black text-white">LDCE Alumni Association</h3>
                    <p className="text-blue-300 text-xs font-bold">Facebook Page</p>
                  </div>
                  <a href="https://www.facebook.com/share/17JZ8KjQ8J/" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-black rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-1 flex-shrink-0">
                    Like <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="h-48 md:h-56 overflow-y-auto bg-gradient-to-b from-blue-950/50 to-slate-950/50 p-3 md:p-4 space-y-2">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-14 w-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Facebook className="h-7 w-7 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-black text-white text-sm">LDCE Alumni Association</h4>
                        <p className="text-blue-300/70 text-xs">Higher Education • Ahmedabad, Gujarat</p>
                      </div>
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed mb-4">
                      Official Facebook page of LD College of Engineering Alumni Association. Connecting 30,000+ alumni globally. Building bridges between generations of excellence.
                    </p>
                    <a href="https://www.facebook.com/share/17JZ8KjQ8J/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 text-xs font-black rounded-lg hover:bg-blue-500/30 transition-all">
                      View on Facebook <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Facebook className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-black">LDCE Alumni Association</p>
                        <p className="text-white/40 text-[10px]">2h</p>
                      </div>
                    </div>
                    <p className="text-white/70 text-xs leading-relaxed mb-3">
                      🎉 Alumni Meet 2024 registration is now open! Join us for a memorable evening of networking and nostalgia. Early bird discounts available until March 31st.
                    </p>
                    <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-xl h-28 flex items-center justify-center border border-blue-500/10">
                      <span className="text-blue-300/50 text-xs font-bold">Alumni Meet 2024 Banner</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-white/40 text-[10px] font-bold">
                      <span>👍 289</span><span>💬 45</span><span>🔄 22</span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Facebook className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-black">LDCE Alumni Association</p>
                        <p className="text-white/40 text-[10px]">5d</p>
                      </div>
                    </div>
                    <p className="text-white/70 text-xs leading-relaxed mb-3">
                      🏆 Congratulations to our alumnus who received the National Innovation Award! Your success inspires the entire LDCE community. #ProudLDCE
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-white/40 text-[10px] font-bold">
                      <span>👍 456</span><span>💬 67</span><span>🔄 38</span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Facebook className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-black">LDCE Alumni Association</p>
                        <p className="text-white/40 text-[10px]">1w</p>
                      </div>
                    </div>
                    <p className="text-white/70 text-xs leading-relaxed">
                      📢 Calling all alumni! Share your success stories and career journeys with our students. Your experience can guide the next generation of engineers. DM us to participate!
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-white/40 text-[10px] font-bold">
                      <span>👍 189</span><span>💬 34</span><span>🔄 15</span>
                    </div>
                  </div>
                  <a href="https://www.facebook.com/share/17JZ8KjQ8J/" target="_blank" rel="noopener noreferrer" className="block text-center py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-xs font-black hover:bg-blue-500/20 transition-all">
                    View all posts on Facebook →
                  </a>
                </div>
              </div>
            </motion.div>

            {/* LinkedIn Card with Profile Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-[2rem] overflow-hidden bg-gradient-to-br from-sky-500 to-blue-600 p-[2px]"
            >
              <div className="rounded-[2rem] bg-slate-950/95 backdrop-blur-md overflow-hidden flex flex-col">
                <div className="p-5 flex items-center gap-4 border-b border-white/10">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                    <Linkedin className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-white">LDCE Alumni Association</h3>
                    <p className="text-sky-300 text-xs font-bold">Company Page</p>
                  </div>
                  <a href="https://www.linkedin.com/company/ldce-alumni-association/?originalSubdomain=in" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-black rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all flex items-center gap-1.5">
                    Follow <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="h-[280px] overflow-y-auto bg-gradient-to-b from-sky-950/50 to-slate-950/50 p-4 space-y-3">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-14 w-14 rounded-xl bg-sky-500/20 flex items-center justify-center">
                        <Linkedin className="h-7 w-7 text-sky-400" />
                      </div>
                      <div>
                        <h4 className="font-black text-white text-sm">LDCE Alumni Association</h4>
                        <p className="text-sky-300/70 text-xs">Higher Education • Ahmedabad, Gujarat</p>
                      </div>
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed mb-4">
                      Official LinkedIn page of LD College of Engineering Alumni Association. Connecting 30,000+ alumni globally. Building bridges between generations of excellence.
                    </p>
                    <a href="https://www.linkedin.com/company/ldce-alumni-association/?originalSubdomain=in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/20 text-sky-300 text-xs font-black rounded-lg hover:bg-sky-500/30 transition-all">
                      View on LinkedIn <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                        <Linkedin className="h-4 w-4 text-sky-400" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-black">LDCE Alumni Association</p>
                        <p className="text-white/40 text-[10px]">1h • 1st</p>
                      </div>
                    </div>
                    <p className="text-white/70 text-xs leading-relaxed mb-3">
                      🎓 Excited to announce the upcoming Alumni Meet 2024! Join us for an evening of networking, nostalgia, and new connections. Register now on our portal!
                    </p>
                    <div className="bg-gradient-to-r from-sky-900/30 to-blue-900/30 rounded-xl h-32 flex items-center justify-center border border-sky-500/10">
                      <span className="text-sky-300/50 text-xs font-bold">Alumni Meet 2024</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-white/40 text-[10px] font-bold">
                      <span>👍 142</span><span>💬 28</span><span>🔄 15</span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                        <Linkedin className="h-4 w-4 text-sky-400" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-black">LDCE Alumni Association</p>
                        <p className="text-white/40 text-[10px]">3d • 1st</p>
                      </div>
                    </div>
                    <p className="text-white/70 text-xs leading-relaxed">
                      🚀 Proud to share that our alumni startup has raised Series A funding! Congratulations to the team. LDCE continues to produce innovators and leaders.
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-white/40 text-[10px] font-bold">
                      <span>👍 256</span><span>💬 42</span><span>🔄 31</span>
                    </div>
                  </div>
                  <a href="https://www.linkedin.com/company/ldce-alumni-association/?originalSubdomain=in" target="_blank" rel="noopener noreferrer" className="block text-center py-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-300 text-xs font-black hover:bg-sky-500/20 transition-all">
                    View all posts on LinkedIn →
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Alumni Portal Card with Embedded Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-[2rem] overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 p-[2px]"
            >
              <div className="rounded-[2rem] bg-slate-950/95 backdrop-blur-md overflow-hidden flex flex-col">
                <div className="p-5 flex items-center gap-4 border-b border-white/10">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-white">LDCE Alumni Portal</h3>
                    <p className="text-emerald-300 text-xs font-bold">ldcealumni.net</p>
                  </div>
                  <a href="https://www.ldcealumni.net/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center gap-1.5">
                    Visit <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="h-[280px] overflow-hidden relative bg-black/20">
                  <iframe src="https://www.ldcealumni.net/" className="w-full h-full border-0" loading="lazy" title="LDCE Alumni Portal" style={{ background: 'white' }} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none opacity-0 [&:only-child]:opacity-100 [&:only-child]:pointer-events-auto bg-gradient-to-b from-emerald-950/90 to-slate-950/90">
                    <Globe className="h-16 w-16 text-emerald-400/50" />
                    <h4 className="text-white font-black text-lg">LDCE Alumni Portal</h4>
                    <p className="text-white/50 text-sm font-medium max-w-xs text-center">The official web portal for LDCE alumni. Click below to explore.</p>
                    <a href="https://www.ldcealumni.net/" target="_blank" rel="noopener noreferrer" className="pointer-events-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-black rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all">
                      Open Portal <ExternalLink className="h-4 w-4 inline ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default memo(HomeCommunity);
