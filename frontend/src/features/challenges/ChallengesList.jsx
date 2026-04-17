import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import {
  Calendar,
  DollarSign,
  Briefcase,
  Users,
  Building,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  List,
  Grid,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import api from '@/services/axios';
import PostChallenge from './PostChallenge';


const getStatusBadge = (deadline) => {
  if (!deadline) return <Badge variant="secondary">Active</Badge>;
  const diffDays = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return <Badge variant="destructive" className="font-bold text-[10px] uppercase">Closed</Badge>;
  if (diffDays <= 7) return <Badge variant="warning" className="bg-amber-500 text-white font-bold text-[10px] uppercase">Closing Soon</Badge>;
  return <Badge variant="success" className="bg-emerald-500 text-white font-bold text-[10px] uppercase">Active</Badge>;
};

const ChallengesList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPostForm, setShowPostForm] = useState(false);

  const challengesPerPage = 6;

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const response = await api.get('/challenges');
      const data = response.data.data || response.data.challenges || response.data || [];
      setChallenges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to load challenges');
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleViewDetails = (id) => navigate(`/challenges/${id}`);

  const filteredChallenges = challenges.sort((a, b) => {
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const indexOfLastChallenge = currentPage * challengesPerPage;
  const indexOfFirstChallenge = indexOfLastChallenge - challengesPerPage;
  const currentChallenges = filteredChallenges.slice(indexOfFirstChallenge, indexOfLastChallenge);
  const totalPages = Math.ceil(filteredChallenges.length / challengesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Compact Search and Controls Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Navigation & Title */}
            <div className="flex items-center gap-4 shrink-0">
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Challenges</h1>
              <div className="h-6 w-px bg-slate-200"></div>
            </div>

            {/* Sort Header */}
            <div className="flex items-center gap-4 flex-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Challenges ({filteredChallenges.length})</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full lg:w-auto ml-auto">
              {user && (
                <Button
                  onClick={() => setShowPostForm(true)}
                  className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-blue-500/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Challenge
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">


          {/* Main Content */}
          <div className="flex-1">
            {challenges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Briefcase className="h-16 w-16 text-slate-300 mb-4" />
                <p className="text-lg font-black text-slate-600 text-center">No challenges posted yet. Be the first to post one!</p>
                {user && (
                  <Button
                    onClick={() => setShowPostForm(true)}
                    className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl"
                  >
                    Post First Challenge
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {viewMode === 'list' ? (
                  <div className="grid grid-cols-1 gap-6">
                    {currentChallenges.map((challenge) => (
                      <motion.div
                        key={challenge._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Card
                          className="group bg-white border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 rounded-3xl overflow-hidden cursor-pointer"
                          onClick={() => handleViewDetails(challenge._id)}
                        >
                          <CardContent className="p-0">
                            <div className="flex flex-col lg:flex-row p-6 lg:p-8 gap-8">
                              {/* Left: Author Info */}
                              <div 
                                className="flex flex-row lg:flex-col lg:items-center gap-4 shrink-0 lg:w-32 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const authorId = challenge.authorId?._id || challenge.authorId?.id;
                                  if (authorId) navigate(`/profile/${authorId}`);
                                }}
                              >
                                <Avatar className="h-16 w-16 ring-4 ring-slate-50 shadow-md">
                                  <AvatarImage src={challenge.authorId?.photoURL || challenge.authorId?.photo} />
                                  <AvatarFallback className="bg-blue-600 text-white font-black text-xl">
                                    {(challenge.authorId?.name || challenge.authorId?.displayName)?.[0]?.toUpperCase() || 'A'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="lg:text-center">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contributor</p>
                                  <p className="text-sm font-black text-slate-800 break-words leading-tight">{challenge.authorId?.name || challenge.authorId?.displayName}</p>
                                  <p className="text-[11px] text-slate-500 font-medium mt-1">Batch {challenge.batchYear || 'Alumni'}</p>
                                </div>
                              </div>

                              {/* Middle: Content Section */}
                              <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  {getStatusBadge(challenge.deadline)}
                                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-bold px-3 py-1 uppercase tracking-tighter text-[10px]">
                                    {challenge.domain}
                                  </Badge>
                                  {challenge.companyName && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                      <Building className="h-3 w-3" />
                                      {challenge.companyName}
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-2 leading-tight">
                                    {challenge.title}
                                  </h3>
                                  <p className="text-slate-600 text-sm md:text-base leading-relaxed line-clamp-2">
                                    {challenge.description || challenge.problemStatement}
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-2">
                                  <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    Deadline: {challenge.deadline ? new Date(challenge.deadline).toLocaleDateString() : 'Flexible'}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Actions Section */}
                              <div className="flex flex-row lg:flex-col lg:justify-between items-center lg:items-end gap-6 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
                                <div className="flex flex-col items-end gap-2">
                                  {challenge.cashReward && (
                                    <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black border border-emerald-100 flex items-center gap-1.5">
                                      <DollarSign className="h-4 w-4" /> Reward: {challenge.cashReward}
                                    </div>
                                  )}
                                  {challenge.internshipReward && (
                                    <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black border border-blue-100 flex items-center gap-1.5">
                                      <Briefcase className="h-4 w-4" /> Internship Reward
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col gap-3 w-full min-w-[140px]">
                                  {challenge.registrationLink && (
                                    <Button
                                      className="font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(challenge.registrationLink, '_blank');
                                      }}
                                    >
                                      Apply Now
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    className="font-black border-2 border-slate-200 rounded-xl h-11 hover:bg-slate-50 transition-all"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetails(challenge._id);
                                    }}
                                  >
                                    Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {currentChallenges.map((challenge) => (
                      <motion.div
                        key={challenge._id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card
                          className="group h-full bg-white border border-slate-200/60 shadow-sm hover:shadow-2xl hover:border-blue-500 transition-all duration-500 rounded-3xl overflow-hidden flex flex-col cursor-pointer"
                          onClick={() => handleViewDetails(challenge._id)}
                        >
                          <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex flex-col gap-2">
                                {getStatusBadge(challenge.deadline)}
                                <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-none font-bold text-[10px] w-fit italic">
                                  {challenge.domain}
                                </Badge>
                              </div>
                              <Avatar 
                                className="h-12 w-12 border-2 border-white shadow-xl ring-2 ring-slate-50 cursor-pointer hover:ring-4 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const authorId = challenge.authorId?._id || challenge.authorId?.id;
                                  if (authorId) navigate(`/profile/${authorId}`);
                                }}
                              >
                                <AvatarImage src={challenge.authorId?.photoURL || challenge.authorId?.photo} />
                                <AvatarFallback className="bg-blue-600 text-white font-black">
                                  {(challenge.authorId?.name || challenge.authorId?.displayName)?.[0]?.toUpperCase() || 'A'}
                                </AvatarFallback>
                              </Avatar>
                            </div>

                            <div className="flex-1 space-y-4">
                              <div>
                                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                  {challenge.title}
                                </h3>
                                  <p className="text-slate-500 text-sm font-bold mt-1 cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const authorId = challenge.authorId?._id || challenge.authorId?.id;
                                      if (authorId) navigate(`/profile/${authorId}`);
                                    }}
                                  >
                                    {challenge.authorId?.name || challenge.authorId?.displayName} • {challenge.companyName || 'Alumni'}
                                </p>
                              </div>
                              <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                                {challenge.description || challenge.problemStatement}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {challenge.cashReward && (
                                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-black">
                                    Reward: {challenge.cashReward}
                                  </Badge>
                                )}
                                {challenge.internshipReward && (
                                  <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-black">
                                    Internship Reward
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex gap-3">
                            {challenge.registrationLink && (
                              <Button
                                className="flex-1 bg-black hover:bg-slate-800 text-white font-black rounded-xl h-11"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(challenge.registrationLink, '_blank');
                                }}
                              >
                                Apply
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              className="flex-1 font-black border-2 border-slate-200 rounded-xl h-11 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(challenge._id);
                              }}
                            >
                              Details
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12 pb-12">
                    <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-10 w-10 p-0 rounded-xl disabled:opacity-30"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <div className="flex items-center px-4 gap-4">
                        <span className="text-sm font-black text-slate-800">
                          {currentPage} <span className="text-slate-400 mx-1">of</span> {totalPages}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-10 w-10 p-0 rounded-xl disabled:opacity-30"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Challenge Modal */}
      {showPostForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setShowPostForm(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <PostChallenge
              onClose={() => setShowPostForm(false)}
              onSuccess={() => {
                setShowPostForm(false);
                fetchChallenges();
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengesList;
