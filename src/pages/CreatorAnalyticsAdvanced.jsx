import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BarChart3, TrendingUp, Lightbulb, Users } from "lucide-react";
import EngagementHeatmap from "@/components/analytics/EngagementHeatmap";
import CompletionTrends from "@/components/analytics/CompletionTrends";
import ContentImprovementSuggestions from "@/components/improvements/ContentImprovementSuggestions";

export default function CreatorAnalyticsAdvanced() {
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Course Analytics</h1>
          <p className="text-slate-600">Deep insights into student engagement and performance</p>
        </div>

        <Tabs defaultValue="engagement" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="engagement">
              <BarChart3 className="w-4 h-4 mr-2" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="trends">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="improvements">
              <Lightbulb className="w-4 h-4 mr-2" />
              Improvements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="engagement">
            {courseId && <EngagementHeatmap courseId={courseId} />}
          </TabsContent>

          <TabsContent value="trends">
            {courseId && <CompletionTrends courseId={courseId} />}
          </TabsContent>

          <TabsContent value="improvements">
            {courseId && user && (
              <ContentImprovementSuggestions courseId={courseId} creatorEmail={user.email} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}