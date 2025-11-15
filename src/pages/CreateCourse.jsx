import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { createPageUrl } from "./utils";
import AIContentGenerator from "../components/course/AIContentGenerator";
import GeneratedLessonsPreview from "../components/course/GeneratedLessonsPreview";
import GeneratedQuizPreview from "../components/course/GeneratedQuizPreview";
import GeneratedResourcesPreview from "../components/course/GeneratedResourcesPreview";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateCourse() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("details");
    
    const [course, setCourse] = useState({
        title: "",
        description: "",
        category: "technology",
        level: "beginner",
        duration_hours: 0,
        instructor_name: "",
        instructor_bio: "",
        skills_taught: [],
        lessons: []
    });

    const [generatedLessons, setGeneratedLessons] = useState(null);
    const [generatedQuiz, setGeneratedQuiz] = useState(null);
    const [selectedLessonIndex, setSelectedLessonIndex] = useState(null);
    const [generatedResources, setGeneratedResources] = useState(null);

    const handleSave = async () => {
        setSaving(true);
        try {
            await base44.entities.Course.create(course);
            navigate(createPageUrl("MyCourses"));
        } catch (error) {
            console.error("Error creating course:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleLessonsGenerated = (result) => {
        setGeneratedLessons(result.lessons);
    };

    const handleAcceptLessons = () => {
        setCourse({ ...course, lessons: generatedLessons });
        setGeneratedLessons(null);
        setActiveTab("lessons");
    };

    const handleQuizGenerated = (result) => {
        setGeneratedQuiz(result.questions);
    };

    const handleAcceptQuiz = () => {
        if (selectedLessonIndex !== null) {
            const updatedLessons = [...course.lessons];
            updatedLessons[selectedLessonIndex] = {
                ...updatedLessons[selectedLessonIndex],
                quiz: {
                    title: `${updatedLessons[selectedLessonIndex].title} Quiz`,
                    passing_score: 70,
                    questions: generatedQuiz
                }
            };
            setCourse({ ...course, lessons: updatedLessons });
        }
        setGeneratedQuiz(null);
        setSelectedLessonIndex(null);
    };

    const handleResourcesGenerated = (result) => {
        setGeneratedResources(result.resources);
    };

    const handleAcceptResources = () => {
        setGeneratedResources(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(createPageUrl("MyCourses"))}
                            className="h-10 w-10 p-0 rounded-full hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900">Create New Course</h1>
                            <p className="text-slate-600 mt-1">Use AI to generate content or create manually</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={saving || !course.title || !course.description}
                        className="h-12 px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 shadow-lg"
                    >
                        <Save className="h-5 w-5 mr-2" />
                        {saving ? "Saving..." : "Save Course"}
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className="bg-white shadow-sm border border-slate-200 p-1 h-auto">
                        <TabsTrigger value="details" className="px-6 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                            Course Details
                        </TabsTrigger>
                        <TabsTrigger value="ai-outline" className="px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI Outline
                        </TabsTrigger>
                        <TabsTrigger value="lessons" className="px-6 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                            Lessons ({course.lessons.length})
                        </TabsTrigger>
                        <TabsTrigger value="ai-resources" className="px-6 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white">
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI Resources
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6">
                        <Card className="border-0 shadow-xl">
                            <CardHeader className="border-b border-slate-100 pb-6">
                                <CardTitle className="text-2xl">Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Course Title</label>
                                    <Input
                                        placeholder="e.g., Complete Machine Learning Bootcamp"
                                        value={course.title}
                                        onChange={(e) => setCourse({ ...course, title: e.target.value })}
                                        className="h-12 text-base"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                    <Textarea
                                        placeholder="What will students learn in this course?"
                                        value={course.description}
                                        onChange={(e) => setCourse({ ...course, description: e.target.value })}
                                        className="min-h-32 text-base"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                                        <Select value={course.category} onValueChange={(value) => setCourse({ ...course, category: value })}>
                                            <SelectTrigger className="h-12">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="business">Business</SelectItem>
                                                <SelectItem value="technology">Technology</SelectItem>
                                                <SelectItem value="design">Design</SelectItem>
                                                <SelectItem value="marketing">Marketing</SelectItem>
                                                <SelectItem value="personal_development">Personal Development</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Level</label>
                                        <Select value={course.level} onValueChange={(value) => setCourse({ ...course, level: value })}>
                                            <SelectTrigger className="h-12">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Duration (hours)</label>
                                        <Input
                                            type="number"
                                            value={course.duration_hours}
                                            onChange={(e) => setCourse({ ...course, duration_hours: parseFloat(e.target.value) })}
                                            className="h-12"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Instructor Name</label>
                                    <Input
                                        placeholder="Your name"
                                        value={course.instructor_name}
                                        onChange={(e) => setCourse({ ...course, instructor_name: e.target.value })}
                                        className="h-12"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ai-outline" className="space-y-6">
                        <AIContentGenerator
                            type="outline"
                            onGenerate={handleLessonsGenerated}
                        />
                        <AnimatePresence>
                            {generatedLessons && (
                                <GeneratedLessonsPreview
                                    lessons={generatedLessons}
                                    onAccept={handleAcceptLessons}
                                    onReject={() => setGeneratedLessons(null)}
                                />
                            )}
                        </AnimatePresence>
                    </TabsContent>

                    <TabsContent value="lessons" className="space-y-6">
                        {course.lessons.length === 0 ? (
                            <Card className="border-0 shadow-xl">
                                <CardContent className="p-12 text-center">
                                    <Sparkles className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No Lessons Yet</h3>
                                    <p className="text-slate-600 mb-6">Use AI to generate a course outline or add lessons manually</p>
                                    <Button
                                        onClick={() => setActiveTab("ai-outline")}
                                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90"
                                    >
                                        <Sparkles className="h-5 w-5 mr-2" />
                                        Generate with AI
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {course.lessons.map((lesson, idx) => (
                                    <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-semibold">{lesson.order}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{lesson.title}</h3>
                                                    <p className="text-slate-600 text-sm mb-4">{lesson.content}</p>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm text-slate-500">{lesson.duration_minutes} min</span>
                                                        {!lesson.quiz && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedLessonIndex(idx);
                                                                    setActiveTab("ai-quiz");
                                                                }}
                                                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                                            >
                                                                <Sparkles className="h-4 w-4 mr-1" />
                                                                Add Quiz
                                                            </Button>
                                                        )}
                                                        {lesson.quiz && (
                                                            <span className="text-sm text-emerald-600 font-medium">
                                                                ✓ Quiz added ({lesson.quiz.questions?.length} questions)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="ai-quiz" className="space-y-6">
                        {selectedLessonIndex !== null && (
                            <>
                                <Card className="border-0 shadow-lg bg-blue-50 border-blue-100">
                                    <CardContent className="p-6">
                                        <p className="text-slate-700">
                                            Generating quiz for: <span className="font-semibold">{course.lessons[selectedLessonIndex]?.title}</span>
                                        </p>
                                    </CardContent>
                                </Card>
                                <AIContentGenerator
                                    type="quiz"
                                    onGenerate={handleQuizGenerated}
                                />
                                <AnimatePresence>
                                    {generatedQuiz && (
                                        <GeneratedQuizPreview
                                            questions={generatedQuiz}
                                            onAccept={handleAcceptQuiz}
                                            onReject={() => setGeneratedQuiz(null)}
                                        />
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="ai-resources" className="space-y-6">
                        <AIContentGenerator
                            type="resources"
                            onGenerate={handleResourcesGenerated}
                        />
                        <AnimatePresence>
                            {generatedResources && (
                                <GeneratedResourcesPreview
                                    resources={generatedResources}
                                    onAccept={handleAcceptResources}
                                    onReject={() => setGeneratedResources(null)}
                                />
                            )}
                        </AnimatePresence>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}