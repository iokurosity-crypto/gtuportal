import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/axios";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { User, Mail, MapPin, Briefcase, GraduationCap, Edit, Plus, Linkedin, Github, Globe, Calendar, Trash2, ArrowRight, Activity, Users } from "lucide-react";
import { toast } from "sonner";
import EducationModal from "./EducationModal";
import ExperienceModal from "./ExperienceModal";
import EditProfileModal from "./EditProfileModal";
import MyActivity from "./MyActivity";

const ProfileModern = () => {
  const auth = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState(null); // 'connected', 'pending', 'none'
  const [sendingRequest, setSendingRequest] = useState(false);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const isOwnProfile = !id || id === auth.alumni?._id || id === auth.alumni?.id;

  // Handle connection request
  const handleConnect = async () => {
    if (!auth.isLoggedIn) {
      toast.error('Please login to send connection request');
      navigate('/login');
      return;
    }

    if (!id) {
      toast.error('Unable to send request');
      return;
    }

    setSendingRequest(true);
    try {
      const response = await api.post('/connections/request', { toUserId: id });
      console.log('✅ Connection request sent:', response.data);
      setConnectionStatus('pending');
      toast.success('Connection request sent!');
    } catch (err) {
      console.error('❌ Error sending connection request:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to send request';
      toast.error(errorMsg);
    } finally {
      setSendingRequest(false);
    }
  };

  // Fetch connection status
  const fetchConnectionStatus = async () => {
    if (isOwnProfile) return;

    try {
      const response = await api.get('/connections');
      const connections = response.data || [];

      // Check if already connected
      const isConnected = connections.some(c => c.user?._id === id);
      if (isConnected) {
        setConnectionStatus('connected');
        return;
      }

      // Check outgoing requests
      const outgoingResponse = await api.get('/connections/outgoing');
      const outgoingRequests = outgoingResponse.data || [];
      const hasPendingRequest = outgoingRequests.some(r => r.toUser?._id === id);
      if (hasPendingRequest) {
        setConnectionStatus('pending');
      } else {
        setConnectionStatus('none');
      }
    } catch (err) {
      console.warn('Failed to fetch connection status:', err);
      setConnectionStatus('none');
    }
  };

  useEffect(() => {
    if (profileData && !isOwnProfile && auth.isLoggedIn) {
      fetchConnectionStatus();
    }
  }, [profileData, isOwnProfile, id]);

  // Handle profile photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📸 [Profile] Selected file:', file.name, 'Size:', file.size);

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      console.log('📤 [Profile] Uploading to alumni/upload-profile-photo...');
      const response = await api.post('alumni/upload-profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('📥 [Profile] Upload response:', response.data);

      if (response.data && response.data.success) {
        const newPhotoUrl = response.data.profilePhotoUrl || response.data.alumni?.profilePhoto || response.data.alumni?.profilePicture;
        console.log('✅ [Profile] New photo URL:', newPhotoUrl);
        
        // 1. Update local profile data with BOTH profilePhoto and profilePicture
        setProfileData(prev => ({
          ...prev,
          profilePhoto: newPhotoUrl,
          profilePicture: newPhotoUrl,
          photoURL: newPhotoUrl
        }));
        
        // 2. Update AuthContext so Navbar and Feed refresh
        if (response.data.alumni) {
          console.log('✅ [Profile] Updating AuthContext with alumni data:', response.data.alumni);
          auth.updateAlumni(response.data.alumni);
        } else {
          // If response doesn't contain full alumni data, at least update the photo
          console.log('✅ [Profile] Updating AuthContext with photo only');
          auth.updateAlumni({ 
            profilePhoto: newPhotoUrl, 
            photoURL: newPhotoUrl, 
            profilePicture: newPhotoUrl 
          });
        }
        
        toast.success('Profile photo updated successfully! 📸');
      } else {
        console.error('❌ [Profile] Upload failed - success flag false:', response.data);
        toast.error(response.data?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ [Profile] Error uploading photo:', error.message, error.response?.data);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to upload photo. Try again.');
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const [timeoutWarning, setTimeoutWarning] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    setTimeoutWarning(false);
    
    // Show timeout warning after 3 seconds
    const warningTimer = setTimeout(() => {
      setTimeoutWarning(true);
    }, 3000);
    
    try {
      let response;
      
      // Set a 5 second timeout for profile fetch (reduced from 10s for faster feedback)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        if (isOwnProfile) {
          console.log('📄 [ProfileModern] Fetching my-profile...');
          response = await api.get("/alumni/my-profile", { signal: controller.signal });
        } else {
          console.log('📄 [ProfileModern] Fetching profile for ID:', id);
          response = await api.get(`/alumni/profile/${id}`, { signal: controller.signal });
        }
        clearTimeout(timeoutId);
        clearTimeout(warningTimer);
      } catch (err) {
        clearTimeout(timeoutId);
        clearTimeout(warningTimer);
        throw err;
      }

      if (response.data?.success || response.data?.alumni) {
        console.log('✅ [ProfileModern] Profile loaded:', response.data.alumni?.email);
        setProfileData(response.data.alumni);
      } else if (response.data) {
        console.log('✅ [ProfileModern] Profile loaded:', response.data.email);
        setProfileData(response.data);
      } else {
        console.error('❌ [ProfileModern] Invalid response:', response.data);
        setError("Profile data format error");
        toast.error("Failed to load profile");
      }
    } catch (err) {
      clearTimeout(warningTimer);
      if (err.code === 'ABORT_ERR') {
        console.error("❌ [ProfileModern] Profile fetch timeout (5s)");
        setError("Profile loading is taking too long. Please check your connection and try again.");
      } else if (err.response?.status === 404) {
        console.error("❌ [ProfileModern] Profile not found");
        setError("Profile not found");
      } else if (err.response?.status === 401) {
        console.error("❌ [ProfileModern] Unauthorized");
        setError("Please login again");
      } else {
        console.error("❌ [ProfileModern] Error fetching profile:", err.message);
        setError(err.response?.data?.message || "Failed to load profile. Please try again.");
      }
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch profile if auth is initialized (not in loading state) and user is logged in
    if (!auth.loading && auth.isLoggedIn) {
      fetchProfile();
    } else if (!auth.loading && !auth.isLoggedIn) {
      // User not logged in - redirect to login
      setError("Please login to view profile");
      setLoading(false);
    }
  }, [id, isOwnProfile, auth.isLoggedIn, auth.loading]);

  // Fetch connections count for own profile - with timeout protection
  useEffect(() => {
    if (profileData) {
      let isMounted = true; // Flag to prevent state updates after unmount
      
      const fetchConnections = async () => {
        try {
          if (isMounted) {
            // For own profile, use the more efficient service
            if (isOwnProfile) {
              // Set a 5 second timeout for connections fetch
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);
              
              try {
                const response = await api.get('/connections', { signal: controller.signal });
                clearTimeout(timeoutId);
                if (isMounted) {
                  const connections = response.data || [];
                  setConnectionsCount(Array.isArray(connections) ? connections.length : 0);
                }
              } catch (err) {
                clearTimeout(timeoutId);
                if (err.code === 'ABORT_ERR') {
                  console.warn("⏱️ [ProfileModern] Connections fetch timeout (5s)");
                } else {
                  console.warn("⚠️ [ProfileModern] Error fetching connections:", err.message);
                }
                if (isMounted) {
                  setConnectionsCount(0); // Set to 0 on error instead of hanging
                }
              }
            } else {
              // For other profiles, use profileData only (no API call)
              setConnectionsCount(profileData.connections?.length || profileData.connectionsCount || 0);
            }
          }
        } catch (error) {
          console.error("⚠️ [ProfileModern] Unexpected error in fetchConnections:", error);
          if (isMounted) {
            setConnectionsCount(0);
          }
        }
      };
      
      fetchConnections();

      // Only refresh for own profile - reduced from 5s to 30s to reduce API calls
      let interval;
      if (isOwnProfile) {
        interval = setInterval(fetchConnections, 30000);
      }
      
      // Cleanup function
      return () => {
        isMounted = false;
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [isOwnProfile, profileData]);

  const [userPosts, setUserPosts] = useState([]);
  const [fetchingPosts, setFetchingPosts] = useState(false);

  const fetchUserPosts = async () => {
    if (!profileData?._id && !profileData?.id) return;
    setFetchingPosts(true);
    try {
      const userId = profileData._id || profileData.id;
      
      // Set a 5 second timeout for posts fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await api.get(`/posts/user/${userId}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (response.data) {
        setUserPosts(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      if (err.code === 'ABORT_ERR') {
        console.warn("⏱️ [ProfileModern] Posts fetch timeout (5s)");
      } else {
        console.warn("⚠️ [ProfileModern] Error fetching user posts:", err.message);
      }
      setUserPosts([]); // Set empty array instead of staying in loading state
    } finally {
      setFetchingPosts(false);
    }
  };

  useEffect(() => {
    if (profileData) {
      fetchUserPosts();
      // Removed auto-refetch to reduce unnecessary API calls
      // Users can refresh manually if needed
    }
  }, [profileData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
          {timeoutWarning && (
            <p className="text-amber-600 text-sm mt-3 font-semibold animate-pulse">
              ⏱️ Taking longer than expected. Please wait or refresh.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md shadow-xl border-2 border-red-200 bg-red-50">
          <CardContent className="pt-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-red-900 mb-2">Oops! Profile Load Failed</h3>
              <p className="text-red-700 mb-6 text-sm">{error}</p>
              <div className="flex flex-col gap-3">
                <Button onClick={fetchProfile} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  🔄 Try Again
                </Button>
                <Button onClick={() => navigate("/")} variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50">
                  Return to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profileData) return null;

  const profilePhoto = profileData.profilePhoto || profileData.profilePicture || profileData.photoURL || '';
  const profileName = profileData.name || profileData.displayName || 'Alumni';
  const profileEmail = profileData.email || profileData.mail || 'Not provided';
  const profileLocationText = profileData.currentLocation || profileData.location || profileData.city || '';
  const profileJobTitle = profileData.currentJobTitle || profileData.jobTitle || profileData.role || 'Alumni';
  const profileBio = profileData.bio || profileData.about || '';
  const profileDepartment = profileData.department || 'Engineering';
  const profileBatch = profileData.batch || profileData.graduationYear || 'N/A';
  const workExperience = Array.isArray(profileData.workExperience) ? profileData.workExperience : [];
  const education = Array.isArray(profileData.education) ? profileData.education : [];
  const skills = Array.isArray(profileData.skills) ? profileData.skills : [];
  const socialLinks = profileData.socialLinks || {};

  return (
    <div className="min-h-screen bg-[#f3f2ef] py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Main Profile Header (LinkedIn Style) */}
        <Card className="overflow-hidden shadow-sm border-gray-200">
          <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
            {profileData.coverPhoto && (
              <img src={profileData.coverPhoto} className="w-full h-full object-cover" alt="Cover" />
            )}
          </div>
          <CardContent className="relative pt-0 pb-6 px-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
                <div className="relative group w-40 h-40">
                  {/* Hidden file input */}
                  <input
                    type="file"
                    id="profilePhotoInput"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto || !isOwnProfile}
                  />
                  
                  <label
                    htmlFor="profilePhotoInput"
                    className={`cursor-pointer block w-full h-full bg-white rounded-full p-1 shadow-md transition-all duration-300 ${
                      isOwnProfile ? 'hover:shadow-xl hover:ring-2 hover:ring-blue-400' : ''
                    }`}
                  >
                    <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center overflow-hidden relative">
                      {uploadingPhoto ? (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-full">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-blue-400" />
                        </div>
                      ) : null}
                      
                      {profilePhoto ? (
                        <img src={profilePhoto} alt={profileName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-20 h-20 text-slate-300" />
                      )}
                      
                      {/* LinkedIn-style overlay */}
                      {isOwnProfile && !uploadingPhoto && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center rounded-full transition-all duration-300">
                          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                            <div className="text-xl font-bold">📸</div>
                            <p className="text-xs mt-1">Change Photo</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
                <div className="text-center md:text-left mb-2">
                  <h1 className="text-2xl font-bold text-slate-900">{profileName}</h1>
                  <p className="text-lg text-slate-600 font-medium">{profileJobTitle}</p>
                  <div className="text-slate-500 text-sm flex items-center justify-center md:justify-start gap-2 mt-2">
                    {profileLocationText && (
                      <>
                        <MapPin className="w-3 h-3" /> 
                        <span>{profileLocationText}</span>
                        <span>•</span>
                      </>
                    )}
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-full">
                      <Users className="w-3 h-3 text-blue-600" />
                      <span className="text-blue-600 font-semibold">{connectionsCount}</span>
                      <span className="text-blue-600 text-xs">connections</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                {isOwnProfile ? (
                  <>
                    <Button onClick={() => setIsEditModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                      Edit Profile
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/complete-profile")} className="border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full">
                      More Details
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleConnect}
                    disabled={sendingRequest || connectionStatus === 'connected'}
                    className={`rounded-full px-8 ${
                      connectionStatus === 'connected' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : connectionStatus === 'pending'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {sendingRequest ? 'Sending...' : connectionStatus === 'connected' ? '✓ Connected' : connectionStatus === 'pending' ? 'Request Sent' : '+ Connect'}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                {/* About Section */}
                <section>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-slate-900">About</h2>
                    {isOwnProfile && <Button variant="ghost" size="icon" onClick={() => setIsEditModalOpen(true)}><Edit className="w-4 h-4 text-slate-500" /></Button>}
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {profileBio || "No bio provided yet."}
                  </p>
                </section>

                {/* Experience Section */}
                <section className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900">Experience</h2>
                    {isOwnProfile && <Button variant="ghost" size="icon" onClick={() => setIsExperienceModalOpen(true)}><Plus className="w-5 h-5 text-slate-500" /></Button>}
                  </div>
                  <div className="space-y-6">
                    {workExperience && workExperience.length > 0 ? (
                      workExperience.map((exp, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center shrink-0">
                            <Briefcase className="w-6 h-6 text-slate-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{exp.title}</h3>
                            <p className="text-slate-700 text-sm font-medium">{exp.company} • {exp.type || "Full-time"}</p>
                            <p className="text-slate-500 text-xs mt-1">
                              {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                            </p>
                            <p className="text-slate-500 text-xs">{exp.location}</p>
                            {exp.description && <p className="text-slate-600 text-sm mt-2">{exp.description}</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <p className="text-slate-500 text-sm italic">No experience listed yet.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Education Section */}
                <section className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900">Education</h2>
                    {isOwnProfile && <Button variant="ghost" size="icon" onClick={() => setIsEducationModalOpen(true)}><Plus className="w-5 h-5 text-slate-500" /></Button>}
                  </div>
                  <div className="space-y-6">
                    {education && education.length > 0 ? (
                      education.map((edu, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center shrink-0">
                            <GraduationCap className="w-6 h-6 text-slate-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{edu.institution}</h3>
                            <p className="text-slate-700 text-sm">{edu.degree}, {edu.field}</p>
                            <p className="text-slate-500 text-xs mt-1">
                              {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                            </p>
                            {edu.gpa && <p className="text-slate-600 text-xs mt-1 font-semibold">GPA: {edu.gpa}</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center shrink-0">
                          <GraduationCap className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">L.D. College of Engineering</h3>
                          <p className="text-slate-700 text-sm">{profileDepartment}</p>
                          <p className="text-slate-500 text-xs mt-1">Batch of {profileBatch}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                {/* Contact & Social Sidebar */}
                <section className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wider">Contact Info</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-slate-700 truncate">{profileEmail}</span>
                    </div>
                    <div className="pt-2 flex gap-3">
                      {socialLinks?.linkedin && (
                        <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full shadow-sm hover:text-blue-600 transition-colors">
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {socialLinks?.github && (
                        <a href={socialLinks.github} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full shadow-sm hover:text-slate-900 transition-colors">
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {socialLinks?.website && (
                        <a href={socialLinks.website} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full shadow-sm hover:text-green-600 transition-colors">
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </section>

                {/* Skills Section */}
                <section className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-wider">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills && skills.length > 0 ? (
                      skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-all">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-slate-400 text-xs italic">No skills added yet.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Activity</h2>
              <p className="text-slate-500 text-sm">{profileData.connections?.length || 0} followers</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/feed")} className="rounded-full border-blue-600 text-blue-600">
              Go to Feed
            </Button>
          </div>
          
          {/* Reuse MyActivity logic or just show recent activity */}
          <div className="space-y-4">
            <p className="text-slate-600 text-sm font-medium">Recent Activity</p>
            {isOwnProfile ? (
              <Tabs defaultValue="activity" className="w-full">
                <TabsList className="bg-slate-100 p-1 mb-4">
                  <TabsTrigger value="activity">Recent</TabsTrigger>
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                </TabsList>
                <TabsContent value="activity">
                  <div className="bg-slate-50 p-8 rounded-lg border border-dashed border-slate-200 text-center">
                    <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Your recent interactions will appear here.</p>
                  </div>
                </TabsContent>
                <TabsContent value="posts">
                  <div className="space-y-4">
                    {fetchingPosts ? (
                      <div className="flex justify-center p-8"><div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full"></div></div>
                    ) : userPosts.length > 0 ? (
                      userPosts.slice(0, 3).map((post, idx) => (
                        <div key={idx} className="p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate("/feed")}>
                          <p className="text-slate-800 text-sm line-clamp-2 mb-2 font-medium">{post.text}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            <span>{post.likesCount} likes • {post.commentsCount} comments</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-slate-50 p-8 rounded-lg border border-dashed border-slate-200 text-center">
                        <Edit className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No posts shared yet.</p>
                        {isOwnProfile && <Button variant="link" onClick={() => navigate("/feed")} className="text-blue-600 mt-2">Create your first post</Button>}
                      </div>
                    )}
                    {userPosts.length > 3 && (
                      <Button variant="ghost" className="w-full text-blue-600 text-sm font-bold" onClick={() => navigate("/feed")}>
                        View all posts <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="bg-slate-50 p-8 rounded-lg border border-dashed border-slate-200 text-center">
                <p className="text-slate-500 text-sm">Recent activity from {profileName} will show here.</p>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pb-12">
          <p>AluVerse Alumni Portal © 2024 • Build with ❤️ for LDCE</p>
        </div>
      </div>

      {/* Modals */}
      {isOwnProfile && (
        <>
          <EditProfileModal 
            open={isEditModalOpen} 
            onOpenChange={setIsEditModalOpen} 
            onSuccess={fetchProfile}
          />
          <EducationModal 
            open={isEducationModalOpen} 
            onOpenChange={setIsEducationModalOpen}
            onSuccess={fetchProfile}
          />
          <ExperienceModal 
            open={isExperienceModalOpen} 
            onOpenChange={setIsExperienceModalOpen}
            onSuccess={fetchProfile}
          />
        </>
      )}
    </div>
  );
};

export default ProfileModern;
