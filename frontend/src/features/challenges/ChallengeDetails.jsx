import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import {
  Calendar,
  DollarSign,
  Briefcase,
  Award,
  Users,
  ExternalLink,
  Mail,
  ArrowLeft,
  Building,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { sendConnectionRequest } from '@/services/socialService';
import api from '@/services/axios';

const ChallengeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchChallengeDetails();
  }, [id]);

  const fetchChallengeDetails = async () => {
    try {
      setLoading(true);
      console.log('[CHALLENGE_DETAILS] Fetching challenge with ID:', id);
      const response = await api.get(`/challenges/${id}`);
      console.log('[CHALLENGE_DETAILS] Challenge data received:', { 
        _id: response.data._id,
        id: response.data.id,
        title: response.data.title,
        author: response.data.authorId?.name 
      });
      setChallenge(response.data);
    } catch (error) {
      console.error('Error fetching challenge details:', error);
      console.error('Response details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      
      // Log the ID that failed to help with debugging
      if (error.response?.status === 404) {
        console.warn(`[CHALLENGE_DETAILS] Challenge not found with ID: ${id}`);
        console.warn('[CHALLENGE_DETAILS] Make sure the challenge exists in the database');
      }
      
      toast.error(error.response?.data?.message || 'Failed to load challenge details');
      // Wait a moment before navigating so user sees the error
      setTimeout(() => navigate('/challenges'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!user) {
      toast.error('Please login to send connection request');
      return;
    }

    if (!challenge.authorId) {
      toast.error('Unable to send connection request - user not found');
      return;
    }

    const authorId = challenge.authorId._id || challenge.authorId;

    if (user.id === authorId || user.uid === authorId) {
      toast.error('You cannot connect with yourself');
      return;
    }

    try {
      setConnecting(true);
      const userData = {
        id: user.id || user.uid,
        displayName: user.displayName || user.name,
        photoURL: user.photoURL
      };
      
      await sendConnectionRequest(userData, authorId);
      toast.success(`Connection request sent to ${challenge.authorId.name || challenge.authorId.displayName}!`);
    } catch (error) {
      console.error('Error sending connection request:', error);
      if (error.message && error.message.includes('already pending')) {
        toast.error('Connection request already pending');
      } else if (error.message && error.message.includes('already connected')) {
        toast.error('You are already connected with this user');
      } else {
        toast.error('Failed to send connection request');
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleApplyNow = () => {
    if (challenge.registrationLink) {
      window.open(challenge.registrationLink, '_blank');
    } else if (challenge.contactEmail) {
      window.open(`mailto:${challenge.contactEmail}`, '_blank');
    }
  };

  const handleProfileClick = () => {
    if (challenge.authorId) {
      const authorId = challenge.authorId._id || challenge.authorId;
      navigate(`/profile/${authorId}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Challenge not found</h2>
          <Button onClick={() => navigate('/challenges')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenges
          </Button>
        </div>
      </div>
    );
  }

  const author = challenge.authorId || {};
  const authorName = author.name || author.displayName || 'Unknown';
  const authorPhoto = author.photoURL || '';
  const authorId = author._id || author.id;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/challenges')}
        className="mb-6 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Challenges
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-slate-200/80 shadow-lg rounded-xl bg-white mb-8">
          {challenge.coverImage && (
            <div className="relative w-full h-64 overflow-hidden rounded-t-xl">
              <img src={challenge.coverImage} alt={challenge.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-green-500 text-white">Active</Badge>
                  {challenge.domain && (
                    <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {challenge.domain}
                    </span>
                  )}
                  {challenge.difficulty && (
                    <Badge variant="outline" className="text-slate-600">
                      {challenge.difficulty}
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-2xl font-bold text-slate-900 mb-6">
                  {challenge.title}
                </CardTitle>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-6">
                    <Avatar 
                      className="h-16 w-16 border-3 border-white shadow-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      onClick={handleProfileClick}
                    >
                      <AvatarImage src={authorPhoto} alt={authorName} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
                        {authorName[0]?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div 
                            className="font-bold text-xl text-slate-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={handleProfileClick}
                          >
                            {authorName}
                          </div>
                          <div className="text-slate-600 flex items-center gap-3 text-sm flex-wrap">
                            {challenge.companyName && (
                              <span className="flex items-center gap-1.5">
                                <Building className="h-4 w-4" />
                                {challenge.companyName}
                              </span>
                            )}
                            {challenge.batchYear && (
                              <span className="flex items-center gap-1.5">
                                <GraduationCap className="h-4 w-4" />
                                Batch {challenge.batchYear}
                              </span>
                            )}
                          </div>
                        </div>
                        {user && user.id !== authorId && user.uid !== authorId && (
                          <Button
                            onClick={handleConnect}
                            disabled={connecting}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            {connecting ? 'Connecting...' : 'Connect'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {challenge.description && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 text-lg border-b border-slate-100 pb-2">Challenge Overview</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">
                  {challenge.description}
                </p>
              </div>
            )}

            {challenge.problemStatement && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 text-lg border-b border-slate-100 pb-2">Problem Statement</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">
                  {challenge.problemStatement}
                </p>
              </div>
            )}

            {challenge.skillsRequired && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 text-lg border-b border-slate-100 pb-2">Skills Required</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">
                  {challenge.skillsRequired}
                </p>
              </div>
            )}

            {challenge.expectedDeliverables && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 text-lg border-b border-slate-100 pb-2">Expected Deliverables</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">
                  {challenge.expectedDeliverables}
                </p>
              </div>
            )}

            {(challenge.cashReward || challenge.internshipReward || challenge.certificateReward || challenge.mentorshipReward) && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-4 text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  Rewards & Incentives
                </h3>
                <div className="space-y-3">
                  {challenge.cashReward && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span>Cash Reward: <strong>{challenge.cashReward}</strong></span>
                    </div>
                  )}
                  {challenge.internshipReward && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <span>Internship Opportunity Available</span>
                    </div>
                  )}
                  {challenge.certificateReward && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <Award className="h-5 w-5 text-purple-600" />
                      <span>Certificate of Completion</span>
                    </div>
                  )}
                  {challenge.mentorshipReward && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <Users className="h-5 w-5 text-indigo-600" />
                      <span>Mentorship Opportunity</span>
                    </div>
                  )}
                  {challenge.otherRewards && (
                    <div className="text-slate-700">
                      <strong>Other Rewards:</strong> {challenge.otherRewards}
                    </div>
                  )}
                </div>
              </div>
            )}

            {challenge.deadline && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-3 text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-red-600" />
                  Timeline
                </h3>
                <div className="space-y-2 text-slate-700">
                  <p>
                    <strong>Deadline:</strong> {new Date(challenge.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {challenge.duration && (
                    <p><strong>Expected Duration:</strong> {challenge.duration}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6 border-t border-slate-200">
              <Button
                onClick={handleApplyNow}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-6 rounded-lg"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Apply Now
              </Button>

              {challenge.contactEmail && (
                <Button
                  onClick={() => window.open(`mailto:${challenge.contactEmail}`, '_blank')}
                  variant="outline"
                  className="flex-1 font-semibold text-lg py-6"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Contact
                </Button>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex gap-3">
                <div className="text-blue-600 font-bold text-lg">ℹ️</div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Important Disclaimer</h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    AluVerse only provides the platform for listing challenges. We do not manage applications, verify submissions, or handle rewards. All communication, evaluations, and reward distribution are handled directly by the challenge poster.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ChallengeDetails;
