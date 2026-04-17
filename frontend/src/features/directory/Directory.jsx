import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import api from "@/services/axios";
import { alumni as dummyAlumni } from "@/data/dummyData.js";
import noteworthyAlumniRaw from "@/data/noteworthyAlumni.json";
import AlumniCard from "./AlumniCard";
import SearchBar from "@/components/SearchBar";
import {
  Users,
  GraduationCap,
  Briefcase,
  Filter,
  Award,
  Building2,
  CalendarCheck,
  Globe,
  ChevronDown
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { sendConnectionRequest, getOrCreateChat } from "@/services/socialService";
import { resolveAlumniImage } from "@/utils/alumniAssets";

const Directory = () => {
  const { user, requireAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("All"); // All, Mentors, LAA Member
  const [applying, setApplying] = useState(false);
  const [firestoreAlumni, setFirestoreAlumni] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch alumni from backend
    setLoading(true);
    axios.get("/api/alumni/directory")
      .then(res => setAlumni(res.data))
      .catch(() => setAlumni([]))
      .finally(() => setLoading(false));
  }, []);

  const handleApplyMembership = async () => {
    if (!requireAuth()) return;
    setApplying(true);
    try {
      // Implement membership application via backend API
      await api.post("/membership/apply", {
        status: "pending"
      });
      toast.success("Membership application submitted! We will review it shortly.");
    } catch (error) {
      console.error("Membership error:", error);
      toast.error("Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  useEffect(() => {
    // Fetch all users with role 'alumni' from backend
    const fetchAlumni = async () => {
      try {
        setLoading(true);
        const res = await api.get("/users?role=alumni");
        const users = Array.isArray(res.data) ? res.data : res.data?.data || [];
        
        const mappedUsers = users.map(doc => ({
          id: doc._id,
          ...doc,
          // Map common fields if they differ
          name: doc.displayName || doc.name || "Anonymous",
          graduationYear: doc.graduationYear || 2024,
          department: doc.department || "CSE",
          company: doc.company || "LDCE Alumni",
          role: doc.roleTitle || doc.role || "Alumni",
          avatar: doc.photoURL || `https://i.pravatar.cc/150?u=${doc._id}`,
          skills: doc.skills || ["Engineering", "Networking"],
          location: doc.location || "Ahmedabad",
          isMentor: doc.isMentor || false,
          achievement: doc.achievement || ""
        }));
        setFirestoreAlumni(mappedUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching alumni:", error);
        setFirestoreAlumni([]);
        setLoading(false);
      }
    };

    fetchAlumni();
  }, []);

  const normalizedNoteworthy = noteworthyAlumniRaw.map(a => ({
    id: `nw-${a.id}`,
    name: a.name,
    graduationYear: parseInt(a.batch) || 0,
    department: a.department || "General",
    company: a.position.includes(" at ") ? a.position.split(" at ")[1] : a.position,
    role: a.position.includes(" at ") ? a.position.split(" at ")[0] : "Alumni",
    location: "Ahmedabad",
    avatar: resolveAlumniImage(a.image, a.name),
    skills: ["Distinguished", "Leader"],
    isMentor: false,
    membershipType: "LAA Member",
    achievement: a.achievement,
    isNoteworthy: true // Flag to disable connect/message buttons
  }));

  const allAlumni = useMemo(() => {
    // Always include both noteworthy and firestore alumni
    // Combine them and remove duplicates if any (by name or id)
    const combined = [...normalizedNoteworthy, ...firestoreAlumni];

    // If we have firestore alumni, we can also add dummy data if combined is too small
    if (combined.length < 5) {
      return [...combined, ...dummyAlumni];
    }
    return combined;
  }, [firestoreAlumni]);

  const departments = useMemo(() => ["All", ...new Set(allAlumni.map(a => a.department))], [allAlumni]);
  const years = useMemo(() => ["All", ...new Set(allAlumni.map(a => a.graduationYear))].sort((a, b) => b - a), [allAlumni]);

  const filtered = allAlumni.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.department.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === "All" || a.department === selectedDept;
    const matchesYear = selectedYear === "All" || a.graduationYear.toString() === selectedYear.toString();

    let matchesTab = true;
    if (activeTab === "Mentors") matchesTab = a.isMentor;
    if (activeTab === "LAA Member") matchesTab = a.membershipType === "LAA Member";

    return matchesSearch && matchesDept && matchesYear && matchesTab;
  });

  const categoryCards = [
    { title: "Find Mentors", icon: Award, color: "bg-amber-500", count: allAlumni.filter(a => a.isMentor).length, filter: () => setActiveTab("Mentors") },
    { title: "Department Wise", icon: Building2, color: "bg-blue-600", count: departments.length - 1, filter: () => { setShowFilters(true); setSelectedDept(departments[1] || "All"); } },
    { title: "Year Wise", icon: CalendarCheck, color: "bg-purple-600", count: years.length - 1, filter: () => { setShowFilters(true); setSelectedYear(years[1] || "All"); } },
    { title: "Global Directory", icon: Globe, color: "bg-emerald-600", count: allAlumni.length, filter: () => setActiveTab("All") },
  ];

  const handleConnect = async (alum) => {
    if (!requireAuth()) return;
    try {
      await sendConnectionRequest(user, alum.id);
      toast.success(`Connection request sent to ${alum.name}`);
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to send request. You might already be connected.");
    }
  };

  const handleMessage = async (alum) => {
    if (!requireAuth()) return;
    try {
      const chatId = await getOrCreateChat(user.uid, alum.id);
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to start chat.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
        <div className="flex-1 w-full relative">
          <SearchBar
            placeholder="Search by name, company, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full shadow-sm"
          />
        </div>

        <div className="flex bg-secondary/50 p-1 rounded-lg border border-border/50 self-start md:self-auto shrink-0">
          {["All", "Mentors", "LAA Member"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${activeTab === tab
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          className={`gap-2 md:w-auto w-full border-border/60 shrink-0 ${showFilters ? "bg-secondary" : ""}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-secondary/30 rounded-2xl border border-border/40">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/70 ml-1 flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" /> Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full h-11 bg-card border border-border/60 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/70 ml-1 flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5" /> Passout Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full h-11 bg-card border border-border/60 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year === "All" ? "All Batches" : year}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <Button
                  className="flex-1 h-11 rounded-xl"
                  onClick={() => {
                    setSelectedDept("All");
                    setSelectedYear("All");
                    setActiveTab("All");
                    setSearch("");
                  }}
                  variant="ghost"
                >
                  Reset All
                </Button>
                <Button
                  className="flex-1 h-11 rounded-xl gradient-primary text-primary-foreground"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Showing {filtered.length} Results
        </h2>
        {filtered.length < allAlumni.length && (
          <Button variant="link" className="text-primary font-bold p-0 h-auto" onClick={() => {
            setSelectedDept("All");
            setSelectedYear("All");
            setActiveTab("All");
            setSearch("");
          }}>
            Clear filters
          </Button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a, i) => (
            <AlumniCard
              key={a.id}
              alumni={a}
              index={i}
              onConnect={() => handleConnect(a)}
              onMessage={() => handleMessage(a)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="bg-secondary/20 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold">No alumni found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
          <Button
            className="mt-6 border-primary text-primary hover:bg-primary/5"
            variant="outline"
            onClick={() => {
              setSelectedDept("All");
              setSelectedYear("All");
              setActiveTab("All");
              setSearch("");
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-20 p-10 rounded-[2rem] bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10 flex flex-col md:flex-row items-center gap-8"
      >
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold mb-3">Join our Alumni Association?</h2>
          <p className="text-muted-foreground">Register as an LAA Member to get exclusive access to events, career counseling, and networking opportunities.</p>
        </div>
        <Button
          onClick={handleApplyMembership}
          disabled={applying}
          className="gradient-primary text-primary-foreground px-8 py-6 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20"
        >
          {applying ? "Submitting..." : "Apply for Membership"}
        </Button>
      </motion.div>
    </div>
  );
};

export default Directory;
