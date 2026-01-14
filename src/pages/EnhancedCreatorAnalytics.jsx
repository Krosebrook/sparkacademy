import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MessageSquare, Zap } from "lucide-react";
import FeedbackSentimentAnalysis from "@/components/analytics/FeedbackSentimentAnalysis";
import AIPromotionEngine from "@/components/promotion/AIPromotionEngine";

export default function EnhancedCreatorAnalytics() {
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Advanced Analytics</h1>
          <p className="text-slate-600">AI-powered insights and promotion strategies</p>
        </div>

        <Tabs defaultValue="sentiment" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="sentiment">
              <MessageSquare className="w-4 h-4 mr-2" />
              Sentiment Analysis
            </TabsTrigger>
            <TabsTrigger value="promotion">
              <Zap className="w-4 h-4 mr-2" />
              Promotion Engine
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sentiment">
            {courseId && <FeedbackSentimentAnalysis courseId={courseId} />}
          </TabsContent>

          <TabsContent value="promotion">
            {courseId && user && (
              <AIPromotionEngine courseId={courseId} creatorEmail={user.email} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}