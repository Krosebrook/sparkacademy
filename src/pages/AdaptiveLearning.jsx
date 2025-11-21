import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Brain, Target, Code, Lightbulb } from "lucide-react";
import LearningStyleAnalyzer from "@/components/adaptive-learning/LearningStyleAnalyzer";
import AdaptiveLearningEngine from "@/components/adaptive-learning/AdaptiveLearningEngine";
import PersonalizedContentRecommender from "@/components/adaptive-learning/PersonalizedContentRecommender";
import PracticeEnvironmentGenerator from "@/components/adaptive-learning/PracticeEnvironmentGenerator";

export default function AdaptiveLearning() {
    const location = useLocation();
    const courseId = new URLSearchParams(location.search).get('id');
    
    const [user, setUser] = useState(null);
    const [course, setCourse] = useState(null);
    const [learningStyle, setLearningStyle] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [courseId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const userData = await base44.auth.me();
            setUser(userData);

            if (courseId) {
                const courseData = await base44.entities.Course.get(courseId);
                setCourse(courseData);
            }
        } catch (error) {
            console.error("Error loading data:", error);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Brain className="h-8 w-8 text-violet-600" />
                        Adaptive Learning System
                    </h1>
                    <p className="text-slate-600">
                        AI-powered personalized learning that adapts to your style, pace, and performance
                    </p>
                    {course && (
                        <p className="text-sm text-violet-600 mt-1">Course: {course.title}</p>
                    )}
                </div>

                <Tabs defaultValue="style" className="space-y-6">
                    <TabsList className="bg-white border border-slate-200">
                        <TabsTrigger value="style">
                            <Brain className="h-4 w-4 mr-2" />
                            Learning Style
                        </TabsTrigger>
                        <TabsTrigger value="adaptive" disabled={!courseId}>
                            <Target className="h-4 w-4 mr-2" />
                            Adaptive Path
                        </TabsTrigger>
                        <TabsTrigger value="content" disabled={!courseId || !learningStyle}>
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Content Recommendations
                        </TabsTrigger>
                        <TabsTrigger value="practice" disabled={!courseId}>
                            <Code className="h-4 w-4 mr-2" />
                            Practice Environment
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="style">
                        <LearningStyleAnalyzer 
                            userEmail={user.email}
                            onStyleIdentified={setLearningStyle}
                        />
                    </TabsContent>

                    <TabsContent value="adaptive">
                        {courseId && (
                            <AdaptiveLearningEngine
                                userEmail={user.email}
                                courseId={courseId}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="content">
                        {courseId && learningStyle && (
                            <PersonalizedContentRecommender
                                userEmail={user.email}
                                courseId={courseId}
                                learningStyle={learningStyle}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="practice">
                        {courseId && (
                            <PracticeEnvironmentGenerator
                                topic={course?.title || "Current topic"}
                                difficulty={course?.level || "medium"}
                                learningStyle={learningStyle}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}