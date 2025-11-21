import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, MessageSquare, Shield, HelpCircle, TrendingUp, UserPlus } from "lucide-react";
import AIModeration from "@/components/discussion/AIModeration";
import FAQAnalyzer from "@/components/discussion/FAQAnalyzer";
import DiscussionSummary from "@/components/instructor/DiscussionSummary";
import SmartPeerMatcher from "@/components/community/SmartPeerMatcher";
import SmartGroupMatcher from "@/components/community/SmartGroupMatcher";
import EmergingContentDetector from "@/components/community/EmergingContentDetector";

export default function CommunityHub() {
    const location = useLocation();
    const courseId = new URLSearchParams(location.search).get('id');
    
    const [user, setUser] = useState(null);
    const [course, setCourse] = useState(null);
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

    const isInstructor = user?.role === 'admin' || (course && course.created_by === user?.email);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Users className="h-8 w-8 text-purple-600" />
                        Community Hub
                    </h1>
                    <p className="text-slate-600">
                        AI-powered collaboration, peer matching, and community insights
                    </p>
                    {course && (
                        <p className="text-sm text-purple-600 mt-1">Course: {course.title}</p>
                    )}
                </div>

                <Tabs defaultValue={isInstructor ? "summary" : "peer-match"} className="space-y-6">
                    <TabsList className="bg-white border border-slate-200 flex-wrap">
                        {!isInstructor && (
                            <>
                                <TabsTrigger value="peer-match" disabled={!courseId}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Peer Matching
                                </TabsTrigger>
                                <TabsTrigger value="group-match" disabled={!courseId}>
                                    <Users className="h-4 w-4 mr-2" />
                                    Study Groups
                                </TabsTrigger>
                            </>
                        )}
                        {isInstructor && courseId && (
                            <>
                                <TabsTrigger value="summary">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Discussion Summary
                                </TabsTrigger>
                                <TabsTrigger value="moderation">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Moderation
                                </TabsTrigger>
                                <TabsTrigger value="faq">
                                    <HelpCircle className="h-4 w-4 mr-2" />
                                    FAQ Generator
                                </TabsTrigger>
                                <TabsTrigger value="emerging">
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Emerging Content
                                </TabsTrigger>
                            </>
                        )}
                    </TabsList>

                    {!isInstructor && (
                        <>
                            <TabsContent value="peer-match">
                                {courseId && user && (
                                    <SmartPeerMatcher userEmail={user.email} courseId={courseId} />
                                )}
                            </TabsContent>

                            <TabsContent value="group-match">
                                {courseId && user && (
                                    <SmartGroupMatcher userEmail={user.email} courseId={courseId} />
                                )}
                            </TabsContent>
                        </>
                    )}

                    {isInstructor && courseId && (
                        <>
                            <TabsContent value="summary">
                                <DiscussionSummary courseId={courseId} />
                            </TabsContent>

                            <TabsContent value="moderation">
                                <AIModeration courseId={courseId} />
                            </TabsContent>

                            <TabsContent value="faq">
                                <FAQAnalyzer courseId={courseId} />
                            </TabsContent>

                            <TabsContent value="emerging">
                                <EmergingContentDetector courseId={courseId} />
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
        </div>
    );
}