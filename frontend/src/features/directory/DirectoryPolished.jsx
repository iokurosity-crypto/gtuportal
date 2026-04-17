import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  Search, 
  Briefcase, 
  GraduationCap, 
  Badge, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  UserPlus, 
  Star,
  Building2,
  Calendar,
  ArrowLeft,
  LayoutGrid
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/services/axios";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui";
import noteworthyAlumni from "@/data/noteworthyAlumni.json";
import { getDepartmentLogo } from "@/data/departmentLogos";
import { resolveAlumniImage } from "@/utils/alumniAssets";

const LDCE_DEPT_CONFIG = {
  "Computer Engineering": { start: 1982 },
  "Information Technology": { start: 2001 },
  "Artificial Intelligence and Machine Learning": { start: 2021 },
  "Robotics and Automation": { start: 2021 },
  "Mechanical Engineering": { start: 1948 },
  "Electrical Engineering": { start: 1948 },
  "Electronics and Communication Engineering": { start: 1972 },
  "Civil Engineering": { start: 1948 },
  "Chemical Engineering": { start: 1974 },
  "Instrumentation and Control Engineering": { start: 1980 },
  "Automobile Engineering": { start: 2004 },
  "Biomedical Engineering": { start: 2004 },
  "Environmental Engineering": { start: 2004 },
  "Plastic Technology": { start: 1982 },
  "Rubber Technology": { start: 1982 },
  "Textile Technology": { start: 1982 },
  // Postgraduate (M.E. / M.Tech)
  "Computer Engineering (Software Engineering)": { start: 1990 },
  "VLSI Design": { start: 2000 },
  "Communication Systems": { start: 2000 },
  "Computer Aided Design & Manufacturing (CAD/CAM)": { start: 2000 },
  "Internal Combustion Engines & Automobile": { start: 2000 },
  "Cryogenic Engineering": { start: 2000 },
  "Electric Vehicle Technology": { start: 2021 },
  "Structural Engineering": { start: 1948 },
  "Geotechnical Engineering": { start: 1948 },
  "Transportation Engineering": { start: 1948 },
  "Water Resources & Management": { start: 1948 },
  "Environmental Management": { start: 2000 },
  "Applied Instrumentation": { start: 2000 },
  "Master of Computer Application (MCA)": { start: 1999 }
};

const LDCE_DEPARTMENTS = Object.keys(LDCE_DEPT_CONFIG);
const BATCH_RANGE = Array.from({ length: 2027 - 1948 + 1 }, (_, i) => (2027 - i).toString());

const DirectoryPolished = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  
  // Navigation State
  const [view, setView] = useState("DEPARTMENTS"); // DEPARTMENTS, ALUMNI
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  
  // Data State
  const [alumni, setAlumni] = useState([]);
  const [connections, setConnections] = useState([]);
  const [allDepartments, setAllDepartments] = useState(LDCE_DEPARTMENTS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Dynamic Batch Range for Filter
  const currentBatchRange = useMemo(() => {
    if (!selectedDept) return BATCH_RANGE;
    const startYear = LDCE_DEPT_CONFIG[selectedDept]?.start || 1948;
    return Array.from({ length: 2027 - startYear + 1 }, (_, i) => (2027 - i).toString());
  }, [selectedDept]);

  // Initial Fetch: Connections only (Departments/Batches now static)
  useEffect(() => {
    if (auth.isLoggedIn) {
      api.get("/connections")
        .then(res => setConnections(res.data || []))
        .catch(err => console.error("Failed to fetch connections:", err));
    }
  }, [auth.isLoggedIn]);

  // Fetch Alumni when view is ALUMNI or when search is used
  useEffect(() => {
    if (view !== "ALUMNI" && !search) return;

    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", currentPage);
    params.append("limit", itemsPerPage);
    if (search) params.append("search", search);
    if (selectedDept) params.append("department", selectedDept);
    if (selectedBatch) params.append("batch", selectedBatch);

    api.get(`/alumni/directory?${params.toString()}`)
      .then((res) => {
        if (res.data.success) {
          const activeAlumni = Array.isArray(res.data.alumni) 
            ? res.data.alumni.filter(a => a.isActive !== false) 
            : [];
          
          const mappedNoteworthy = noteworthyAlumni
            .map(a => ({
              _id: `noteworthy-${a.id}`,
              name: a.name,
              profilePhoto: resolveAlumniImage(a.image, a.name),
              currentJobTitle: a.position,
              currentCompany: a.achievement,
              department: a.department,
              batch: a.batch,
              isNoteworthy: true,
              isActive: true
            }))
            .filter(a => {
              const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.batch.includes(search);
              const matchesDept = !selectedDept || a.department === selectedDept;
              const matchesBatch = !selectedBatch || a.batch === selectedBatch;
              return matchesSearch && matchesDept && matchesBatch;
            });

          const combinedAlumni = [...mappedNoteworthy, ...activeAlumni.filter(a => !mappedNoteworthy.some(n => n.name === a.name))];

          setAlumni(combinedAlumni);
        }
      })
      .catch(err => console.error("Failed to fetch alumni:", err))
      .finally(() => setLoading(false));
  }, [view, currentPage, search, selectedDept, selectedBatch]);

  const getConnectionStatus = (alumniId) => {
    if (connections.some(c => c.user._id === alumniId)) return 'connected';
    return 'none';
  };

  const handleMessage = async (alumniId) => {
    try {
      const response = await api.post("/chats/create", { user2Id: alumniId });
      if (response.data.chatId) navigate(`/chat/${response.data.chatId}`);
    } catch (err) {
      toast.error("Failed to start conversation");
    }
  };

  const handleConnect = async (alumniId) => {
    if (!auth.isLoggedIn) {
      toast.error("Please login to send connection request");
      navigate("/login");
      return;
    }
    try {
      await api.post("/connections/request", { toUserId: alumniId });
      toast.success("Connection request sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleProfileClick = (alumniId) => navigate(`/profile/${alumniId}`);

  const handleDeptSelect = (dept) => {
    setSelectedDept(dept);
    setSelectedBatch(null);
    setView("ALUMNI");
    setCurrentPage(1);
    setSearch("");
  };

  const goBack = () => {
    if (view === "ALUMNI") {
      setView("DEPARTMENTS");
      setSelectedDept(null);
      setSelectedBatch(null);
    }
  };

  const hasMorePages = alumni.length === itemsPerPage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumbs & Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
                  <motion.div 
                    className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-xl shadow-lg text-amber-500 border-2 border-slate-800"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Users className="w-6 h-6" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-600 mb-1 uppercase tracking-widest">
                      <span className="cursor-pointer hover:text-amber-700 transition-colors" onClick={() => { setView("DEPARTMENTS"); setSelectedDept(null); setSelectedBatch(null); }}>Directory</span>
                      {selectedDept && (
                        <>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-900">{selectedDept}</span>
                        </>
                      )}
                      {selectedBatch && (
                        <>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-900">Batch {selectedBatch}</span>
                        </>
                      )}
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                      {view === "DEPARTMENTS" ? "LDCE Alumni Hub" : selectedDept}
                    </h1>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {view === "DEPARTMENTS" ? (
                    <Button 
                      onClick={() => setView("ALUMNI")}
                      className="rounded-2xl font-black gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 border border-slate-800 px-6 h-12 uppercase tracking-widest text-[10px]"
                    >
                      <LayoutGrid className="w-4 h-4 text-amber-500" /> View All Alumni
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={goBack} className="rounded-2xl font-black gap-2 border-2 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-amber-500 self-start h-12 px-6 uppercase tracking-widest text-[10px]">
                      <ArrowLeft className="w-4 h-4" /> Back to Departments
                    </Button>
                  )}
                </div>
          </div>

          {/* Global Search & Batch Filter */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl">
            <div className="relative group flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-amber-600 transition-colors" />
              <input
                type="text"
                placeholder="Search by name or company..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value && view !== "ALUMNI") setView("ALUMNI");
                  else if (!e.target.value && !selectedDept) setView("DEPARTMENTS");
                }}
                className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-amber-300/20 focus:border-amber-600 outline-none text-base font-medium shadow-sm bg-white/95 backdrop-blur-sm transition-all hover:border-slate-400"
              />
            </div>
            
            {(view === "ALUMNI" || search) && (
              <div className="relative min-w-[180px]">
                <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 pointer-events-none" />
                <select
                  value={selectedBatch || ""}
                  onChange={(e) => setSelectedBatch(e.target.value || null)}
                  className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-amber-300/20 focus:border-amber-600 outline-none text-base font-bold shadow-sm bg-white/95 backdrop-blur-sm transition-all hover:border-slate-400 appearance-none cursor-pointer"
                >
                  <option value="">All Batches</option>
                  {currentBatchRange.map(batch => (
                    <option key={batch} value={batch}>Batch {batch}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* 1. DEPARTMENTS VIEW */}
          {view === "DEPARTMENTS" && !search && (
            <motion.div 
              key="depts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Noteworthy Alumni Section - Before Departments */}
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl shadow-lg">
                    <Star className="w-7 h-7 text-slate-900 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-amber-600 mb-1 uppercase tracking-widest">Spotlight</p>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Noteworthy Alumni</h2>
                  </div>
                  <div className="flex-1 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-transparent rounded-full" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 pb-12 border-b-2 border-amber-200">
                  {noteworthyAlumni.map((alumnus, index) => (
                    <motion.div
                      key={alumnus.id}
                      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="bg-white rounded-2xl shadow-lg border-2 border-amber-100 hover:border-amber-300 transition-all overflow-hidden group cursor-pointer flex flex-col h-full"
                      onClick={() => {
                        setSelectedDept(alumnus.department);
                        setView("ALUMNI");
                      }}
                    >
                      {/* Profile Photo */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-slate-100 h-48">
                        <img
                          src={resolveAlumniImage(alumnus.image, alumnus.name)}
                          className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500"
                          alt={alumnus.name}
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alumnus.name)}&background=random&color=fff&size=400&bold=true&font-size=0.4`;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />
                        
                        {/* Star Badge */}
                        <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-slate-900 text-[9px] font-black rounded-full shadow-md">
                          <Star className="w-3 h-3 fill-current" /> Star
                        </div>

                        {/* Name - Absolute Positioned */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-sm font-black text-white mb-1 line-clamp-2 drop-shadow-lg">
                            {alumnus.name}
                          </h3>
                          <div className="flex items-center gap-1 text-amber-300 text-[9px] font-bold">
                            <Calendar className="w-3 h-3" />
                            <span>{alumnus.batch}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 bg-white flex flex-col">
                        <div className="mb-4 space-y-2">
                          <div className="flex items-start gap-2">
                            <Briefcase className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 line-clamp-2">{alumnus.position}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter line-clamp-1 mt-0.5">{alumnus.achievement}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter line-clamp-1">{alumnus.department}</span>
                          </div>
                        </div>

                        <div className="mt-auto pt-3 border-t border-slate-100">
                          <Button 
                            className="w-full text-[9px] font-black h-8 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg uppercase tracking-widest transition-all shadow-md shadow-amber-400/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDept(alumnus.department);
                              setView("ALUMNI");
                            }}
                          >
                            View Profile →
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Departments Grid */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl shadow-lg">
                    <Building2 className="w-7 h-7 text-white fill-current" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-blue-600 mb-1 uppercase tracking-widest">Explore</p>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">All Departments</h2>
                  </div>
                  <div className="flex-1 h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-transparent rounded-full" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {allDepartments.map((dept, i) => (
                    <motion.div
                      key={dept}
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDeptSelect(dept)}
                      className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 cursor-pointer hover:shadow-xl hover:border-blue-200 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors" />
                      <div className="relative z-10">
                    {/* Department Logo */}
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 overflow-hidden group-hover:bg-amber-50 transition-colors">
                      <img 
                        src={getDepartmentLogo(dept)}
                        alt={dept}
                        className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="absolute inset-0 items-center justify-center text-slate-400 hidden">
                        <Building2 className="w-8 h-8" />
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-amber-700 transition-colors line-clamp-2">{dept}</h3>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                      <span>View Alumni</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. ALUMNI VIEW */}
          {(view === "ALUMNI" || search) && (
            <motion.div 
              key="alumni"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                  <div className="w-12 h-12 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin mb-4" />
                  <p className="font-bold text-slate-500">Finding alumni...</p>
                </div>
              ) : alumni.length > 0 ? (
                <>
                  {alumni.some(a => a.isNoteworthy) && (
                    <div className="mb-12">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-10 h-10 bg-amber-400 rounded-xl shadow-lg">
                          <Star className="w-6 h-6 text-slate-900 fill-current" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Distinguished Alumni</h2>
                        <div className="flex-1 h-1 bg-gradient-to-r from-amber-400 to-transparent rounded-full" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 pb-8 border-b-2 border-slate-100">
                        {alumni.filter(a => a.isNoteworthy).map((alumnus, index) => (
                          <motion.div
                            key={alumnus._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-2xl shadow-md border border-slate-100 hover:shadow-xl hover:border-blue-300 transition-all overflow-hidden group cursor-pointer flex flex-col h-full"
                          >
                            {/* Profile Photo - Top */}
                            <div className="relative overflow-hidden bg-slate-100 h-56">
                              <img
                                src={resolveAlumniImage(alumnus.profilePhoto, alumnus.name)}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                alt={alumnus.name}
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alumnus.name)}&background=random&color=fff&size=400&bold=true`;
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                              
                              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-900 text-[10px] font-black rounded-full border-2 border-amber-300 shadow-xl z-10">
                                <Star className="w-3.5 h-3.5 fill-current" /> NOTEWORTHY
                              </div>

                              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-white/50 z-10 group-hover:scale-110 transition-transform">
                                <img 
                                  src={getDepartmentLogo(alumnus.department)}
                                  alt={alumnus.department}
                                  className="w-6 h-6 object-contain"
                                  title={alumnus.department}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="absolute inset-0 items-center justify-center text-slate-400 hidden">
                                  <GraduationCap className="w-4 h-4" />
                                </div>
                              </div>

                              <div className="absolute bottom-4 left-4 right-4 z-10">
                                <h3 
                                  className="text-lg font-black text-white mb-0.5 line-clamp-1 group-hover:text-amber-400 transition-colors drop-shadow-lg" 
                                >
                                  {alumnus.name}
                                </h3>
                                <div className="flex items-center gap-2 text-white/90">
                                  <Calendar className="w-3 h-3 text-amber-400" />
                                  <span className="text-[10px] font-black uppercase tracking-widest drop-shadow-md">Batch {alumnus.batch}</span>
                                </div>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="flex-1 flex flex-col p-5 bg-white">
                              <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 flex-shrink-0 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
                                    <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-slate-900 leading-tight mb-0.5 line-clamp-1">{alumnus.currentJobTitle || "LDCE Alumnus"}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter line-clamp-1">{alumnus.currentCompany || "L.D. College of Engineering"}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 flex-shrink-0 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
                                    <GraduationCap className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight line-clamp-1">{alumnus.department}</span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="mt-auto pt-4 border-t border-slate-50 flex gap-2">
                                <Button 
                                  className="flex-1 text-[9px] font-black rounded-xl h-9 bg-slate-900 hover:bg-slate-800 text-white uppercase tracking-widest transition-all shadow-lg shadow-slate-900/10" 
                                  onClick={() => handleProfileClick(alumnus._id)}
                                >
                                  Profile
                                </Button>
                                
                                {auth.user?._id !== (alumnus._id || alumnus.id) && (
                                  getConnectionStatus(alumnus._id) === 'connected' ? (
                                    <Button 
                                      className="h-9 w-9 p-0 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 transition-all flex-shrink-0" 
                                      onClick={() => handleMessage(alumnus._id)}
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <Button 
                                      className="h-9 w-9 p-0 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all flex-shrink-0" 
                                      onClick={() => handleConnect(alumnus._id)}
                                    >
                                      <UserPlus className="w-4 h-4" />
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {alumni.some(a => !a.isNoteworthy) && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-400 rounded-xl shadow-lg">
                          <Users className="w-6 h-6 text-white fill-current" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">All Alumni</h2>
                        <div className="flex-1 h-1 bg-gradient-to-r from-blue-400 to-transparent rounded-full" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {alumni.filter(a => !a.isNoteworthy).map((alumnus, index) => (
                      <motion.div
                        key={alumnus._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl shadow-md border border-slate-100 hover:shadow-xl hover:border-blue-300 transition-all overflow-hidden group cursor-pointer flex flex-col h-full"
                      >
                        {/* Profile Photo - Top */}
                        <div className="relative overflow-hidden bg-slate-100 h-56">
                          <img
                            src={resolveAlumniImage(alumnus.profilePhoto, alumnus.name)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            alt={alumnus.name}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alumnus.name)}&background=random&color=fff&size=400&bold=true`;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                          
                          {alumnus.isNoteworthy && (
                            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-900 text-[10px] font-black rounded-full border-2 border-amber-300 shadow-xl z-10">
                              <Star className="w-3.5 h-3.5 fill-current" /> NOTEWORTHY
                            </div>
                          )}

                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-white/50 z-10 group-hover:scale-110 transition-transform">
                            <img 
                              src={getDepartmentLogo(alumnus.department)}
                              alt={alumnus.department}
                              className="w-6 h-6 object-contain"
                              title={alumnus.department}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="absolute inset-0 items-center justify-center text-slate-400 hidden">
                              <GraduationCap className="w-4 h-4" />
                            </div>
                          </div>

                          <div className="absolute bottom-4 left-4 right-4 z-10">
                            <h3 
                              className="text-lg font-black text-white mb-0.5 line-clamp-1 group-hover:text-amber-400 transition-colors drop-shadow-lg" 
                            >
                              {alumnus.name}
                            </h3>
                            <div className="flex items-center gap-2 text-white/90">
                              <Calendar className="w-3 h-3 text-amber-400" />
                              <span className="text-[10px] font-black uppercase tracking-widest drop-shadow-md">Batch {alumnus.batch}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="flex-1 flex flex-col p-5 bg-white">
                          <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 flex-shrink-0 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
                                <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-900 leading-tight mb-0.5 line-clamp-1">{alumnus.currentJobTitle || "LDCE Alumnus"}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter line-clamp-1">{alumnus.currentCompany || "L.D. College of Engineering"}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 flex-shrink-0 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
                                <GraduationCap className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight line-clamp-1">{alumnus.department}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-auto pt-4 border-t border-slate-50 flex gap-2">
                            <Button 
                              className="flex-1 text-[9px] font-black rounded-xl h-9 bg-slate-900 hover:bg-slate-800 text-white uppercase tracking-widest transition-all shadow-lg shadow-slate-900/10" 
                              onClick={() => handleProfileClick(alumnus._id)}
                            >
                              Profile
                            </Button>
                            
                            {auth.user?._id !== (alumnus._id || alumnus.id) && (
                              getConnectionStatus(alumnus._id) === 'connected' ? (
                                <Button 
                                  className="h-9 w-9 p-0 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 transition-all flex-shrink-0" 
                                  onClick={() => handleMessage(alumnus._id)}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button 
                                  className="h-9 w-9 p-0 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all flex-shrink-0" 
                                  onClick={() => handleConnect(alumnus._id)}
                                >
                                  <UserPlus className="w-4 h-4" />
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  <div className="flex items-center justify-center gap-4 py-8">
                    <Button variant="ghost" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="font-bold bg-slate-100 hover:bg-slate-200 text-slate-700">
                      <ChevronLeft className="w-4 h-4 mr-2" /> Prev
                    </Button>
                    <div className="font-black text-slate-900 bg-amber-50 px-4 py-2 rounded-xl border-2 border-amber-300">
                      Page {currentPage}
                    </div>
                    <Button variant="ghost" onClick={() => setCurrentPage(prev => prev + 1)} disabled={!hasMorePages} className="font-bold bg-slate-100 hover:bg-slate-200 text-slate-700">
                      Next <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-300 mb-6">
                    <Search className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">No matches found</h3>
                  <p className="text-slate-500 font-medium">We couldn't find any alumni matching your criteria.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DirectoryPolished;
