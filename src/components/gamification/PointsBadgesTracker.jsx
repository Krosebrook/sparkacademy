import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { Trophy, Star, Target, TrendingUp, Award } from 'lucide-react';

export default function PointsBadgesTracker({ studentEmail }) {
  const { data: points } = useQuery({
    queryKey: ['studentPoints', studentEmail],
    queryFn: async () => {
      const records = await base44.entities.StudentPoints.filter({ student_email: studentEmail });
      return records[0];
    }
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['userBadges', studentEmail],
    queryFn: () => base44.entities.UserBadge.filter({ student_email: studentEmail })
  });

  const nextMilestone = Math.ceil((points?.total_points || 0) / 1000) * 1000;
  const progressToNext = ((points?.total_points || 0) % 1000) / 10;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Your Points
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400">
              {points?.total_points?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-400">Total Points</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Next Milestone</span>
              <span className="text-cyan-400">{nextMilestone} pts</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-700">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-400">
                {points?.achievements?.courses_completed || 0}
              </div>
              <div className="text-xs text-gray-400">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-400">
                {points?.achievements?.quizzes_passed || 0}
              </div>
              <div className="text-xs text-gray-400">Quizzes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-400">
                {points?.achievements?.streak_days || 0}
              </div>
              <div className="text-xs text-gray-400">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-sm">
            <Award className="w-4 h-4 text-purple-400" />
            Badges Earned ({badges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {badges.slice(0, 6).map((badge) => (
              <div key={badge.id} className="flex flex-col items-center p-2 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <Star className="w-8 h-8 text-yellow-400 mb-1" />
                <span className="text-xs text-center text-white font-medium line-clamp-2">
                  {badge.badge_name}
                </span>
              </div>
            ))}
            {badges.length === 0 && (
              <div className="col-span-3 text-center py-4 text-gray-400 text-xs">
                Complete activities to earn badges!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}