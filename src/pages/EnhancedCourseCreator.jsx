import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, HelpCircle, Link2, Sparkles } from "lucide-react";
import AILessonPlanner from "@/components/course-creator/AILessonPlanner";
import DiverseQuizGenerator from "@/components/course-creator/DiverseQuizGenerator";
import ResourceSuggester from "@/components/course-creator/ResourceSuggester";
import { createPageUrl } from "@/utils";

export default function EnhancedCourseCreator() {
    const navigate = useNavigate();
    const [generatedLessons, setGeneratedLessons] = useState([]);
    const [generatedQuizzes, setGeneratedQuizzes] = useState([]);
    const [generatedResources, setGeneratedResources] = useState([]);

    const handleLessonGenerated = (lesson) => {
        setGeneratedLessons(prev => [...prev, lesson]);
    };

    const handleQuizGenerated = (quiz) => {
        setGeneratedQuizzes(prev => [...prev, quiz]);
    };

    const handleResourcesGenerated = (resources) => {
        setGeneratedResources(prev => [...prev, ...resources.resources]);
    };

    const createCourseFromGenerated = async () => {
        try {
            const user = await base44.auth.me();
            
            const newCourse = await base44.entities.Course.create({
                title: `AI Generated Course - ${new Date().toLocaleDateString()}`,
                description: "Course created with AI assistance",
                category: "technology",
                level: "beginner",
                is_published: false,
                instructor_name: user.full_name,
                lessons: generatedLessons.map((lesson, idx) => ({
                    order: idx + 1,
                    title: lesson.title,
                    content: lesson.content_outline,
                    duration_minutes: lesson.lesson_structure?.reduce((sum, s) => sum + s.time_minutes, 0) || 30,
                    quiz: generatedQuizzes[idx] || null
                }))
            });

            navigate(createPageUrl("EditCourse") + `?id=${newCourse.id}`);
        } catch (error) {
            console.error("Error creating course:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Course Creator</h1>
                    <p className="text-slate-600">Comprehensive AI assistance for creating engaging courses</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-white border border-slate-200 rounded-lg text-center">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-violet-600" />
                        <p className="text-sm font-semibold text-slate-900">{generatedLessons.length} Lessons</p>
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-lg text-center">
                        <HelpCircle className="h-8 w-8 mx-auto mb-2 text-violet-600" />
                        <p className="text-sm font-semibold text-slate-900">{generatedQuizzes.length} Quizzes</p>
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-lg text-center">
                        <Link2 className="h-8 w-8 mx-auto mb-2 text-violet-600" />
                        <p className="text-sm font-semibold text-slate-900">{generatedResources.length} Resources</p>
                    </div>
                </div>

                <Tabs defaultValue="lessons" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 bg-white border border-slate-200">
                        <TabsTrigger value="lessons">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Lesson Plans
                        </TabsTrigger>
                        <TabsTrigger value="quizzes">
                            <HelpCircle className="h-4 w-4 mr-2" />
                            Quizzes
                        </TabsTrigger>
                        <TabsTrigger value="resources">
                            <Link2 className="h-4 w-4 mr-2" />
                            Resources
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="lessons">
                        <AILessonPlanner onLessonGenerated={handleLessonGenerated} />
                    </TabsContent>

                    <TabsContent value="quizzes">
                        <DiverseQuizGenerator onQuizGenerated={handleQuizGenerated} />
                    </TabsContent>

                    <TabsContent value="resources">
                        <ResourceSuggester onResourcesGenerated={handleResourcesGenerated} />
                    </TabsContent>
                </Tabs>

                {(generatedLessons.length > 0 || generatedQuizzes.length > 0 || generatedResources.length > 0) && (
                    <div className="mt-8 text-center">
                        <Button
                            onClick={createCourseFromGenerated}
                            size="lg"
                            className="bg-gradient-to-r from-violet-600 to-purple-600"
                        >
                            <Sparkles className="h-5 w-5 mr-2" />
                            Create Course from Generated Content
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}