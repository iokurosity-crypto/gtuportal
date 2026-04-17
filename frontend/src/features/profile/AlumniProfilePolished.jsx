import React, { useState, useEffect } from "react";
import api from "@/services/axios";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Briefcase, GraduationCap, MapPin, Users, UserPlus, Heart, Linkedin, Github, Globe } from "lucide-react";
import { toast } from "sonner";

const AlumniProfilePolished = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/alumni/profile/${id}`)
      .then((res) => {
        if (res.data.success) {
          setAlumni(res.data.alumni);
        } else {
          toast.error(res.data.message || "Failed to load profile");
          navigate("/directory");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        toast.error("Failed to load profile");
        navigate("/directory");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await api.post(`/alumni/connect/${id}`, {});
      toast.success("Connection request sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to connect");
    } finally {
      setConnecting(false);
    }
  };

  const handleFollow = async () => {
    setFollowing(true);
    try {
      await api.post(`/alumni/follow/${id}`, {});
      toast.success("Followed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to follow");
    } finally {
      setFollowing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-semibold mb-4">Alumni not found</p>
          <button
            onClick={() => navigate("/directory")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/directory")}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Directory
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header with Cover */}
          <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 opacity-20 bg-pattern"></div>
          </div>

          {/* Main Content */}
          <div className="px-8 py-8">
            {/* Profile Header with Avatar */}
            <div className="flex flex-col md:flex-row md:items-end md:gap-6 mb-8">
              <div className="-mt-24 mb-4 md:mb-0">
                <img
                  src={
                    alumni.profilePhoto ||
                    `https://ui-avatars.com/api/?name=${alumni.name}&size=200&background=random`
                  }
                  alt={alumni.name}
                  className="w-40 h-40 rounded-full border-4 border-white shadow-lg object-cover"
                />
              </div>
              <div className="flex-1 mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{alumni.name}</h1>
                {alumni.currentJobTitle && (
                  <p className="text-xl text-gray-600 font-semibold flex items-center gap-2 mb-3">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                    {alumni.currentJobTitle}
                  </p>
                )}
                {alumni.currentCompany && (
                  <p className="text-gray-600 mb-4">at {alumni.currentCompany}</p>
                )}

                {/* Stats */}
                <div className="flex gap-8">
                  <div>
                    <p className="text-2xl font-bold text-indigo-600">
                      {alumni.connections?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Connections</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {alumni.followers?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Followers</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!alumni.isActive ? (
                <div className="md:col-span-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg border border-gray-300">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    Not Yet Joined
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleConnect}
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    disabled={connecting}
                  >
                    <UserPlus className="w-5 h-5" />
                    {connecting ? "Connecting..." : "Connect"}
                  </button>
                  <button
                    onClick={handleFollow}
                    className="px-6 py-2 border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    disabled={following}
                  >
                    <Heart className="w-5 h-5" />
                    {following ? "Following..." : "Follow"}
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-8"></div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">About</h2>

                {/* Department */}
                {alumni.department && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <GraduationCap className="w-5 h-5 text-indigo-600" />
                      <p className="text-sm text-gray-600 font-semibold">Department</p>
                    </div>
                    <p className="text-gray-900 font-semibold ml-8">{alumni.department}</p>
                  </div>
                )}

                {/* Batch */}
                {alumni.batch && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <p className="text-sm text-gray-600 font-semibold">Batch</p>
                    </div>
                    <p className="text-gray-900 font-semibold ml-8">{alumni.batch}</p>
                  </div>
                )}

                {/* Email */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-5 h-5 text-pink-600" />
                      <p className="text-sm text-gray-600 font-semibold">Email</p>
                    </div>
                    <p className="text-gray-900 font-semibold ml-8 break-all">{alumni.email}</p>
                  </div>

                  {/* Social Links */}
                  {alumni.socialLinks && (alumni.socialLinks.linkedin || alumni.socialLinks.github || alumni.socialLinks.website) && (
                    <div className="mt-8">
                      <h3 className="text-sm font-bold text-gray-600 mb-4">Social Profiles</h3>
                      <div className="flex gap-3">
                        {alumni.socialLinks.linkedin && (
                          <a href={alumni.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                            <Linkedin className="w-5 h-5" />
                          </a>
                        )}
                        {alumni.socialLinks.github && (
                          <a href={alumni.socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                        {alumni.socialLinks.website && (
                          <a href={alumni.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                            <Globe className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Professional Info</h2>

                  {alumni.currentJobTitle && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 font-semibold mb-2">Current Position</p>
                      <p className="text-gray-900 font-semibold">{alumni.currentJobTitle}</p>
                    </div>
                  )}

                  {alumni.currentCompany && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 font-semibold mb-2">Company</p>
                      <p className="text-gray-900 font-semibold">{alumni.currentCompany}</p>
                    </div>
                  )}

                  {alumni.bio && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 font-semibold mb-2">Bio</p>
                      <p className="text-gray-700 text-sm leading-relaxed">{alumni.bio}</p>
                    </div>
                  )}

                  {alumni.skills && alumni.skills.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 font-semibold mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {alumni.skills.map((skill, idx) => (
                          <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {alumni.isActive ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-sm font-semibold rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Active Member
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg border border-gray-300">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    Not Yet Joined
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfilePolished;
