import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, TrendingUp, Brain, Zap, Flame } from 'lucide-react';
import EnhancedLeaderboard from '@/components/gamification/EnhancedLeaderboard';
import BadgeShowcase from '@/components/gamification/BadgeShowcase';
import GamificationStats from '@/components/gamification/GamificationStats';
import LevelProgressCard from '@/components/gamification/LevelProgressCard';
import CourseProgressTracker from '@/components/gamification/CourseProgressTracker';
import SkillAcquisitionTracker from '@/components/gamification/SkillAcquisitionTracker';
import StreakTracker from '@/components/gamification/StreakTracker';

export default function GamificationHub() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: studentPoints } = useQuery({
    queryKey: ['studentPointsHub', user?.email],
    queryFn: () => base44.entities.StudentPoints.filter({ student_email: user.email }).then(r => r[0]),
    enabled: !!user?.email
  });

  const totalXP = studentPoints?.total_points || 1250; // default sample if no data yet

  return (
    <div className="min-h-screen bg-[#0f0618] text-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-violet-800 to-indigo-900 p-8 shadow-[0_0_40px_rgba(139,92,246,0.4)] border-b border-purple-500/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold">Learning Achievements</h1>
          </div>
          <p className="text-purple-200">
            Track your XP, earn badges, climb leaderboards, and master new skills
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 space-y-6 mt-4">

        {/* Level progress — always visible */}
        <LevelProgressCard totalPoints={totalXP} />

        {/* Stats row */}
        <GamificationStats points={totalXP} />

        {/* Main tabs */}
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-purple-900/20 border border-purple-500/20">
            <TabsTrigger value="progress" className="data-[state=active]:bg-purple-700 text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-purple-700 text-xs sm:text-sm">
              <Trophy className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:bg-purple-700 text-xs sm:text-sm">
              <Award className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-purple-700 text-xs sm:text-sm">
              <Brain className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
          </TabsList>

          {/* Progress tab */}
          <TabsContent value="progress" className="space-y-6">
            {user?.email && <CourseProgressTracker userEmail={user.email} />}
            <div className="mt-4">
              {user?.email && <StreakTracker studentEmail={user.email} />}
            </div>
          </TabsContent>

          {/* Leaderboard tab */}
          <TabsContent value="leaderboard">
            <EnhancedLeaderboard />
          </TabsContent>

          {/* Badges tab */}
          <TabsContent value="badges">
            <BadgeShowcase userEmail={user?.email} />
          </TabsContent>

          {/* Skills tab */}
          <TabsContent value="skills">
            <SkillAcquisitionTracker />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}