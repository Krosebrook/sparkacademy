import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Award, Flame, Trophy } from "lucide-react";
import BadgeShowcase from "@/components/gamification/BadgeShowcase";
import StreakTracker from "@/components/gamification/StreakTracker";
import StudentLeaderboard from "@/components/gamification/StudentLeaderboard";
import LearningPathVisualization from "@/components/recommendations/LearningPathVisualization";

export default function StudentGamification() {
  const location = useLocation();
  const courseId = new URLSearchParams(location.search).get("id");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Your Learning Journey</h1>
          <p className="text-slate-600">Track achievements, streaks, and progress</p>
        </div>

        <Tabs defaultValue="badges" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="badges">
              <Award className="w-4 h-4 mr-2" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="streak">
              <Flame className="w-4 h-4 mr-2" />
              Streaks
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="path">
              <Flame className="w-4 h-4 mr-2" />
              Learning Path
            </TabsTrigger>
          </TabsList>

          <TabsContent value="badges">
            {user && <BadgeShowcase studentEmail={user.email} />}
          </TabsContent>

          <TabsContent value="streak">
            {user && courseId && <StreakTracker studentEmail={user.email} courseId={courseId} />}
          </TabsContent>

          <TabsContent value="leaderboard">
            {courseId && <StudentLeaderboard courseId={courseId} />}
          </TabsContent>

          <TabsContent value="path">
            {user && courseId && (
              <div className="space-y-4">
                <LearningPathVisualization studentEmail={user.email} courseId={courseId} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}