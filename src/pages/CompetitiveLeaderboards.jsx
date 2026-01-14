import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trophy, Crown } from "lucide-react";
import AILeaderboard from "@/components/gamification/AILeaderboard";
import CreatorLeaderboard from "@/components/promotion/CreatorLeaderboard";

export default function CompetitiveLeaderboards() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Crown className="w-8 h-8 text-yellow-600" />
            Leaderboards
          </h1>
          <p className="text-slate-600">Compete globally and earn rewards for top rankings</p>
        </div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="students">
              <Trophy className="w-4 h-4 mr-2" />
              Student Rankings
            </TabsTrigger>
            <TabsTrigger value="creators">
              <Crown className="w-4 h-4 mr-2" />
              Creator Rankings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <div className="space-y-4">
              <p className="text-slate-600">
                Compete on global and category-specific leaderboards. Top rankers earn bonus points and virtual currency!
              </p>
              <AILeaderboard />
            </div>
          </TabsContent>

          <TabsContent value="creators">
            <div className="space-y-4">
              <p className="text-slate-600">
                Best performing creators ranked by enrollments, ratings, and student success metrics.
              </p>
              <CreatorLeaderboard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}