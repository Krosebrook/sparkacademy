import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Pen, GraduationCap, BarChart } from "lucide-react";
import LessonOutlineGenerator from "@/components/instructor-tools/LessonOutlineGenerator";
import DiverseAssignmentGenerator from "@/components/instructor-tools/DiverseAssignmentGenerator";
import AdvancedGradingAssistant from "@/components/instructor-tools/AdvancedGradingAssistant";
import CourseStructureAnalyzer from "@/components/instructor-tools/CourseStructureAnalyzer";

export default function InstructorAITools() {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <GraduationCap className="h-8 w-8 text-blue-600" />
                        AI Instructor Tools
                    </h1>
                    <p className="text-slate-600">
                        Powerful AI assistants to help you create better courses, assignments, and provide meaningful feedback
                    </p>
                    {course && (
                        <p className="text-sm text-blue-600 mt-1">Course: {course.title}</p>
                    )}
                </div>

                <Tabs defaultValue="outline" className="space-y-6">
                    <TabsList className="bg-white border border-slate-200">
                        <TabsTrigger value="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Lesson Outlines
                        </TabsTrigger>
                        <TabsTrigger value="assignments">
                            <Pen className="h-4 w-4 mr-2" />
                            Assignments
                        </TabsTrigger>
                        <TabsTrigger value="grading">
                            <GraduationCap className="h-4 w-4 mr-2" />
                            Grading Assistant
                        </TabsTrigger>
                        <TabsTrigger value="analysis" disabled={!courseId}>
                            <BarChart className="h-4 w-4 mr-2" />
                            Course Analysis
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="outline">
                        <LessonOutlineGenerator />
                    </TabsContent>

                    <TabsContent value="assignments">
                        <DiverseAssignmentGenerator courseTopic={course?.title} />
                    </TabsContent>

                    <TabsContent value="grading">
                        <AdvancedGradingAssistant />
                    </TabsContent>

                    <TabsContent value="analysis">
                        {courseId && <CourseStructureAnalyzer courseId={courseId} />}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}