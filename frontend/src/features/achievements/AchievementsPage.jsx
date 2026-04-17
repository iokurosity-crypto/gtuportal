import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import api from "@/services/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Progress } from "@/components/ui";
import { motion } from "framer-motion";
import { Trophy, Target, Zap, Award, Star, Medal, Crown, Flame } from "lucide-react";

const AchievementsPage = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPoints: 0,
    level: 1,
    nextLevelPoints: 100,
    completedAchievements: 0,
    totalAchievements: 0
  });

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        
        // Fetch all achievements
        const achievementsRes = await api.get("/achievements");
        const currentAchievements = Array.isArray(achievementsRes.data) ? achievementsRes.data : achievementsRes.data?.data || [];
        setAchievements(currentAchievements);
        setStats(prev => ({ ...prev, totalAchievements: currentAchievements.length }));

        // Fetch user achievements if logged in
        if (user) {
          const userAchievementsRes = await api.get(`/achievements/user/${user._id}`);
          const userAchievementsList = Array.isArray(userAchievementsRes.data) ? userAchievementsRes.data : userAchievementsRes.data?.data || [];
          setUserAchievements(userAchievementsList);

          // Calculate stats
          const completedPoints = userAchievementsList.reduce((total, ua) => {
            const achievement = currentAchievements.find(a => a._id === ua.achievementId);
            return total + (achievement?.points || 0);
          }, 0);

          setStats(prev => ({
            ...prev,
            totalPoints: completedPoints,
            completedAchievements: userAchievementsList.length,
            level: Math.floor(completedPoints / 100) + 1
          }));
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching achievements:", error);
        setAchievements([]);
        setUserAchievements([]);
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  const completeAchievement = async (achievementId) => {
    if (!user) return;

    try {
      // Add to user achievements via backend API
      const result = await api.post("/achievements/complete", {
        achievementId
      });

      // Update local state
      const achievement = achievements.find(a => a._id === achievementId);
      if (achievement) {
        setStats(prev => ({
          ...prev,
          totalPoints: prev.totalPoints + (achievement.points || 0),
          completedAchievements: prev.completedAchievements + 1,
          level: Math.floor((prev.totalPoints + (achievement.points || 0)) / 100) + 1
        }));
      }
    } catch (error) {
      console.error("Error completing achievement:", error);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'milestone': return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'challenge': return <Target className="h-6 w-6 text-red-500" />;
      case 'contribution': return <Zap className="h-6 w-6 text-blue-500" />;
      case 'social': return <Star className="h-6 w-6 text-purple-500" />;
      default: return <Award className="h-6 w-6 text-gray-500" />;
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading achievements...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.level}</div>
            <div className="text-sm text-gray-600">Current Level</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.completedAchievements}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.totalAchievements - stats.completedAchievements}</div>
            <div className="text-sm text-gray-600">Remaining</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {stats.level}</span>
              <span>Level {stats.level + 1}</span>
            </div>
            <Progress
              value={(stats.totalPoints % 100)}
              className="h-3"
            />
            <div className="text-xs text-gray-600 text-center">
              {stats.totalPoints % 100} / 100 points to next level
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement, index) => {
          const isCompleted = userAchievements.some(ua => ua.achievementId === achievement.id);

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`transition-all duration-300 hover:shadow-lg ${isCompleted ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-white'
                }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getIconForType(achievement.type)}
                      <div>
                        <CardTitle className="text-lg">{achievement.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {achievement.points} points
                          </Badge>
                          <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {isCompleted && (
                      <div className="text-green-500">
                        <Medal className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>

                  {achievement.requirements && (
                    <div className="mb-4">
                      <div className="text-xs font-medium text-gray-700 mb-2">Requirements:</div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {achievement.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!isCompleted && user && (
                    <Button
                      onClick={() => completeAchievement(achievement.id)}
                      className="w-full"
                      variant="outline"
                    >
                      Mark as Complete
                    </Button>
                  )}

                  {isCompleted && (
                    <div className="text-center text-sm text-green-600 font-medium">
                      ✓ Completed on {userAchievements.find(ua => ua.achievementId === achievement.id)?.completedAt?.toDate?.()?.toLocaleDateString?.() || 'Recently'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
          <p className="text-gray-600">Achievements will appear here as they're created</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;
