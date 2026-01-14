import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, TrendingUp, Compass } from "lucide-react";
import AIRecommendations from "@/components/discovery/AIRecommendations";
import TrendingCoursesSection from "@/components/discovery/TrendingCoursesSection";

export default function CourseDiscovery() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Compass className="w-8 h-8 text-blue-600" />
            Discover Courses
          </h1>
          <p className="text-slate-600">Find your next learning adventure</p>
        </div>

        <Tabs defaultValue="recommended" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="recommended">
              <Sparkles className="w-4 h-4 mr-2" />
              For You
            </TabsTrigger>
            <TabsTrigger value="trending">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommended">
            <div className="space-y-4">
              <p className="text-slate-600">
                Personalized recommendations based on your learning history and interests
              </p>
              {user && <AIRecommendations userEmail={user.email} />}
            </div>
          </TabsContent>

          <TabsContent value="trending">
            <TrendingCoursesSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}