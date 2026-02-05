import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, LayoutDashboard, Trophy } from 'lucide-react';
import AIContentGenerator from '@/components/content/AIContentGenerator';
import CustomDashboardBuilder from '@/components/analytics/CustomDashboardBuilder';
import DashboardTemplates from '@/components/analytics/DashboardTemplates';
import StreakTracker from '@/components/gamification/StreakTracker';
import PersonalChallenges from '@/components/gamification/PersonalChallenges';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function AIContentStudio() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">AI Content Studio</h1>
          <p className="text-purple-100">
            Generate learning content, build custom dashboards, and track your achievements
          </p>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border">
            <TabsTrigger value="content">
              <Wand2 className="w-4 h-4 mr-2" />
              AI Content Generation
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Custom Analytics
            </TabsTrigger>
            <TabsTrigger value="gamification">
              <Trophy className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <AIContentGenerator />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Dashboard Templates</h2>
              <DashboardTemplates />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Build Custom Dashboard</h2>
              <CustomDashboardBuilder />
            </div>
          </TabsContent>

          <TabsContent value="gamification" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StreakTracker userEmail={user?.email} />
              <div>
                <h2 className="text-2xl font-bold mb-4">Your Challenges</h2>
                <PersonalChallenges userEmail={user?.email} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}