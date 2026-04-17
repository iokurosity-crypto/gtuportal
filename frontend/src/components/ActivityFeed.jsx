import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { 
  Briefcase, 
  Award, 
  Calendar, 
  Users, 
  ExternalLink, 
  Clock,
  TrendingUp,
  MessageCircle,
  Heart,
  Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/axios';
import { toast } from 'sonner';

const ActivityFeed = ({ userId, isOwnProfile = false }) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        // Fetch challenges posted by user to create activities
        const challengesRes = await api.get(`/challenges?userId=${userId}`);
        const challenges = Array.isArray(challengesRes.data) ? challengesRes.data : challengesRes.data?.data || [];
        
        // Transform challenges into activity format
        const activitiesData = challenges.map(challenge => ({
          id: challenge._id,
          type: 'challenge_posted',
          title: `Posted a new challenge: ${challenge.title}`,
          description: challenge.problemStatement || challenge.description,
          authorId: userId,
          timestamp: challenge.createdAt,
          metadata: {
            challengeId: challenge._id,
            domain: challenge.domain,
            rewards: {
              cash: challenge.cashReward,
              internship: challenge.internshipReward,
              certificate: challenge.certificateReward,
              mentorship: challenge.mentorshipReward
            }
          }
        }));
        
        setActivities(activitiesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivities([]);
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'challenge_posted':
        return <Briefcase className="h-4 w-4 text-blue-600" />;
      case 'connection_accepted':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'achievement_unlocked':
        return <Award className="h-4 w-4 text-purple-600" />;
      case 'profile_updated':
        return <Calendar className="h-4 w-4 text-orange-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-slate-600" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  const handleActivityClick = (activity) => {
    if (activity.type === 'challenge_posted' && activity.metadata?.challengeId) {
      navigate(`/challenges/${activity.metadata.challengeId}`);
    }
  };

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-600 text-sm">
              {isOwnProfile ? 'Your recent activities will appear here' : 'No recent activities'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => handleActivityClick(activity)}
              >
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-slate-900 truncate">
                      {activity.title}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(activity.timestamp)}
                    </div>
                    {activity.metadata?.domain && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {activity.metadata.domain}
                      </div>
                    )}
                  </div>
                  {activity.metadata?.rewards && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {activity.metadata.rewards.cash && (
                        <Badge className="text-xs bg-green-100 text-green-800">
                          ${activity.metadata.rewards.cash}
                        </Badge>
                      )}
                      {activity.metadata.rewards.internship && (
                        <Badge className="text-xs bg-blue-100 text-blue-800">
                          Internship
                        </Badge>
                      )}
                      {activity.metadata.rewards.certificate && (
                        <Badge className="text-xs bg-purple-100 text-purple-800">
                          Certificate
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
