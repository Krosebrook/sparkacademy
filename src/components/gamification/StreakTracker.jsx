import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Flame, Award, Calendar, Zap } from 'lucide-react';

export default function StreakTracker({ userEmail }) {
  const { data: streak } = useQuery({
    queryKey: ['learning-streak', userEmail],
    queryFn: async () => {
      const streaks = await base44.entities.LearningStreak.filter({ user_email: userEmail });
      return streaks[0];
    }
  });

  if (!streak) return null;

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Your Learning Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {streak.current_streak}
            </div>
            <div className="text-xs text-gray-600">Current Streak</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {streak.longest_streak}
            </div>
            <div className="text-xs text-gray-600">Best Streak</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {streak.total_learning_days}
            </div>
            <div className="text-xs text-gray-600">Total Days</div>
          </div>
        </div>

        {streak.streak_freeze_count > 0 && (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Streak Freezes Available</span>
            </div>
            <Badge className="bg-yellow-100 text-yellow-700">
              {streak.streak_freeze_count}
            </Badge>
          </div>
        )}

        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Last Activity</span>
          </div>
          <p className="text-sm text-gray-600">
            {new Date(streak.last_activity_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {streak.current_streak >= 7 && (
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
            <Award className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-semibold text-orange-800">
              Amazing! You're on fire! 🔥
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}