import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, TrendingUp } from 'lucide-react';
import EnhancedLeaderboard from '@/components/gamification/EnhancedLeaderboard';
import BadgeShowcase from '@/components/gamification/BadgeShowcase';
import GamificationStats from '@/components/gamification/GamificationStats';

export default function GamificationHub() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  return (
    <div className="min-h-screen bg-[#0f0618] text-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-8 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Achievements & Leaderboards</h1>
          </div>
          <p className="text-yellow-100">
            Track your progress, compete with peers, and earn badges for your accomplishments
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <GamificationStats />

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-purple-900/20 border border-purple-500/20">
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-purple-600">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboards
            </TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:bg-purple-600">
              <Award className="w-4 h-4 mr-2" />
              Badges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <EnhancedLeaderboard />
          </TabsContent>

          <TabsContent value="badges">
            <BadgeShowcase userEmail={user?.email} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}