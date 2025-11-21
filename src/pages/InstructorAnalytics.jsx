import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BarChart3, TrendingUp, Brain, Lightbulb, Target } from "lucide-react";
import EngagementAnalytics from "@/components/instructor/EngagementAnalytics";
import ContentPerformanceAnalyzer from "@/components/instructor/ContentPerformanceAnalyzer";
import PredictiveInsights from "@/components/instructor/PredictiveInsights";
import ActionableRecommendations from "@/components/instructor/ActionableRecommendations";

export default function InstructorAnalytics() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        setIsLoading(true);
        try {
            const userData = await base44.auth.me();
            setUser(userData);
        } catch (error) {
            console.error("Error loading user:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <BarChart3 className="h-8 w-8 text-indigo-600" />
                        Instructor Analytics Dashboard
                    </h1>
                    <p className="text-slate-600">
                        AI-powered insights to enhance your teaching and student outcomes
                    </p>
                </div>

                <Tabs defaultValue="engagement" className="space-y-6">
                    <TabsList className="bg-white border border-slate-200 grid grid-cols-2 md:grid-cols-4">
                        <TabsTrigger value="engagement">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Engagement</span>
                        </TabsTrigger>
                        <TabsTrigger value="content">
                            <Target className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Content</span>
                        </TabsTrigger>
                        <TabsTrigger value="predictions">
                            <Brain className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Predictions</span>
                        </TabsTrigger>
                        <TabsTrigger value="recommendations">
                            <Lightbulb className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Actions</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="engagement">
                        <EngagementAnalytics instructorEmail={user?.email} />
                    </TabsContent>

                    <TabsContent value="content">
                        <ContentPerformanceAnalyzer instructorEmail={user?.email} />
                    </TabsContent>

                    <TabsContent value="predictions">
                        <PredictiveInsights instructorEmail={user?.email} />
                    </TabsContent>

                    <TabsContent value="recommendations">
                        <ActionableRecommendations instructorEmail={user?.email} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}