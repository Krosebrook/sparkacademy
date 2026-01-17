/**
 * Gamification Dashboard
 * Displays student points, badges, leaderboards, and progress
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Zap, TrendingUp, Award, Flame } from 'lucide-react';

export default function GamificationDashboard() {
  const { data: studentPoints } = useQuery({
    queryKey: ['studentPoints'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const points = await base44.entities.StudentPoints?.filter({ 
        student_email: user.email 
      }).catch(() => []);
      return points[0];
    }
  });

  const { data: badges } = useQuery({
    queryKey: ['userBadges'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const userBadges = await base44.entities.UserBadge?.filter({ 
        student_email: user.email 
      }).catch(() => []);
      return userBadges;
    }
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const entries = await base44.entities.LeaderboardEntry?.filter(
        { leaderboard_type: 'global_points', period: 'weekly' },
        '-score',
        10
      ).catch(() => []);
      return entries;
    }
  });

  const { data: streaks } = useQuery({
    queryKey: ['streaks'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const userStreaks = await base44.entities.CourseStreak?.filter({ 
        student_email: user.email 
      }).catch(() => []);
      return userStreaks;
    }
  });

  const badgeInfo = {
    first_course_completed: { name: 'First Steps', icon: '🎓', color: 'bg-blue-500/20' },
    power_learner: { name: 'Power Learner', icon: '⚡', color: 'bg-yellow-500/20' },
    point_collector: { name: 'Point Collector', icon: '💎', color: 'bg-purple-500/20' },
    consistency_champion: { name: 'Consistency Champion', icon: '🔥', color: 'bg-red-500/20' },
  };

  return (
    <div className="space-y-6">
      {/* Points & Badges Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="card-glow bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Points</p>
                <p className="text-4xl font-bold text-white">{studentPoints?.total_points || 0}</p>
              </div>
              <Zap className="w-12 h-12 text-yellow-400 opacity-30" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Badges Earned</p>
                <p className="text-4xl font-bold text-white">{badges?.length || 0}</p>
              </div>
              <Award className="w-12 h-12 text-green-400 opacity-30" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Current Streak</p>
                <p className="text-4xl font-bold text-white">
                  {Math.max(...(streaks?.map(s => s.current_streak_days || 0) || [0]))} 🔥
                </p>
              </div>
              <Flame className="w-12 h-12 text-orange-400 opacity-30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#1a0a2e]/50">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
        </TabsList>

        {/* Badges */}
        <TabsContent value="badges">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges?.map((badge) => {
                  const info = badgeInfo[badge.badge_id];
                  return (
                    <div key={badge.id} className="text-center">
                      <div className={`w-20 h-20 ${info?.color || 'bg-gray-500/20'} rounded-lg flex items-center justify-center text-4xl mb-2 mx-auto`}>
                        {info?.icon || '🏆'}
                      </div>
                      <p className="text-sm font-semibold text-white">{info?.name || badge.badge_id}</p>
                    </div>
                  );
                })}
              </div>
              {!badges?.length && (
                <p className="text-center text-gray-400 py-8">
                  Earn badges by completing courses and maintaining streaks!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Weekly Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard?.map((entry, idx) => (
                  <div key={entry.id} className="flex items-center gap-4 p-3 bg-[#0f0618]/50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-purple-300">#{entry.rank}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{entry.user_name}</p>
                      <p className="text-sm text-gray-400 truncate">{entry.user_email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-yellow-400">{entry.score}</p>
                      <p className="text-xs text-gray-400">pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Streaks */}
        <TabsContent value="streaks">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Learning Streaks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {streaks?.map((streak) => (
                <div key={streak.id} className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-white">{streak.current_streak_days} Day Streak 🔥</p>
                    <Badge className="bg-orange-500/20 text-orange-300">
                      Best: {streak.longest_streak_days} days
                    </Badge>
                  </div>
                  <Progress value={Math.min((streak.current_streak_days / streak.longest_streak_days) * 100, 100)} className="h-2" />
                </div>
              ))}
              {!streaks?.length && (
                <p className="text-center text-gray-400 py-8">
                  Start learning today to build your first streak!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}