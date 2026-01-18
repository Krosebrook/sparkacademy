import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap, TrendingUp, BookOpen, MessageCircle } from 'lucide-react';

export default function PointsTracker({ userEmail }) {
  const { data: pointsData } = useQuery({
    queryKey: ['studentPoints', userEmail],
    queryFn: async () => {
      const results = await base44.entities.StudentPoints?.filter({ student_email: userEmail });
      return results?.[0] || { total_points: 0, lifetime_points: 0, achievements: {} };
    },
    enabled: !!userEmail
  });

  const achievements = pointsData?.achievements || {};
  const currentLevel = Math.floor((pointsData?.total_points || 0) / 1000) + 1;
  const pointsInLevel = (pointsData?.total_points || 0) % 1000;
  const progressToNextLevel = (pointsInLevel / 1000) * 100;

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Learning Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Display */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Level {currentLevel}</span>
            <span className="text-sm text-gray-400">{pointsData?.total_points || 0} pts</span>
          </div>
          <Progress value={progressToNextLevel} className="h-2 mb-2" />
          <p className="text-xs text-gray-500">{1000 - pointsInLevel} points to Level {currentLevel + 1}</p>
        </div>

        {/* Achievements */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <BookOpen className="w-5 h-5 text-cyan-400 mb-1" />
            <div className="text-2xl font-bold text-white">{achievements.courses_completed || 0}</div>
            <div className="text-xs text-gray-400">Courses</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <TrendingUp className="w-5 h-5 text-green-400 mb-1" />
            <div className="text-2xl font-bold text-white">{achievements.quizzes_passed || 0}</div>
            <div className="text-xs text-gray-400">Quizzes Passed</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <Zap className="w-5 h-5 text-yellow-400 mb-1" />
            <div className="text-2xl font-bold text-white">{achievements.streak_days || 0}</div>
            <div className="text-xs text-gray-400">Day Streak</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <MessageCircle className="w-5 h-5 text-purple-400 mb-1" />
            <div className="text-2xl font-bold text-white">{achievements.discussions_participated || 0}</div>
            <div className="text-xs text-gray-400">Discussions</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}