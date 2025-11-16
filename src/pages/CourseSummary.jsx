import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, BookOpen, Clock, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function CourseSummary() {
    const location = useLocation();
    const courseId = new URLSearchParams(location.search).get('id');
    
    const [course, setCourse] = useState(null);
    const [summaries, setSummaries] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState("course");

    useEffect(() => {
        if (courseId) loadCourse();
    }, [courseId]);

    const loadCourse = async () => {
        const courseData = await base44.entities.Course.get(courseId);
        setCourse(courseData);
    };

    const generateCourseSummary = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Create a comprehensive summary of this course:

Title: ${course.title}
Description: ${course.description}
Lessons: ${course.lessons?.map(l => `${l.title}: ${l.content?.substring(0, 200)}...`).join('\n')}

Provide:
1. Course Overview (3-5 sentences)
2. Key Concepts Covered (bullet points)
3. Learning Outcomes (what students will be able to do)
4. Recommended For (who should take this course)
5. Time Commitment
6. Prerequisites`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overview: { type: "string" },
                        key_concepts: { type: "array", items: { type: "string" } },
                        learning_outcomes: { type: "array", items: { type: "string" } },
                        recommended_for: { type: "string" },
                        time_commitment: { type: "string" },
                        prerequisites: { type: "string" }
                    }
                }
            });

            setSummaries(prev => ({ ...prev, course: result }));
        } catch (error) {
            console.error("Error generating course summary:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateLessonSummary = async (lesson) => {
        setIsGenerating(true);
        try {
            const prompt = `Summarize this lesson concisely:

Title: ${lesson.title}
Content: ${lesson.content}

Provide:
1. Main Topic (1 sentence)
2. Key Points (3-5 bullet points)
3. Practical Takeaways (what to remember/apply)
4. Duration: ${lesson.duration_minutes} minutes`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        main_topic: { type: "string" },
                        key_points: { type: "array", items: { type: "string" } },
                        practical_takeaways: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setSummaries(prev => ({ 
                ...prev, 
                [`lesson_${lesson.order}`]: result 
            }));
        } catch (error) {
            console.error("Error generating lesson summary:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Course Summaries</h1>
                    <p className="text-slate-600">Quick revision and overview of {course.title}</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-white border border-slate-200 mb-6">
                        <TabsTrigger value="course">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Full Course
                        </TabsTrigger>
                        <TabsTrigger value="lessons">
                            <FileText className="h-4 w-4 mr-2" />
                            By Lesson
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="course">
                        {!summaries.course ? (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-12 text-center">
                                    <FileText className="h-16 w-16 mx-auto mb-6 text-violet-600" />
                                    <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                                        Generate Course Summary
                                    </h3>
                                    <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                                        Get a comprehensive overview of the entire course including key concepts, learning outcomes, and time commitment.
                                    </p>
                                    <Button
                                        onClick={generateCourseSummary}
                                        disabled={isGenerating}
                                        size="lg"
                                        className="bg-gradient-to-r from-violet-600 to-purple-600"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Generating Summary...
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="w-5 h-5 mr-2" />
                                                Generate Summary
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-2xl">{course.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Overview</h3>
                                        <p className="text-slate-700">{summaries.course.overview}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Key Concepts</h3>
                                        <ul className="space-y-2">
                                            {summaries.course.key_concepts?.map((concept, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <Badge className="mt-0.5">✓</Badge>
                                                    <span className="text-slate-700">{concept}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Learning Outcomes</h3>
                                        <ul className="space-y-2">
                                            {summaries.course.learning_outcomes?.map((outcome, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-violet-600 font-bold">{idx + 1}.</span>
                                                    <span className="text-slate-700">{outcome}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2">Recommended For</h4>
                                            <p className="text-sm text-slate-600">{summaries.course.recommended_for}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2">Time Commitment</h4>
                                            <p className="text-sm text-slate-600 flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                {summaries.course.time_commitment}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-2">Prerequisites</h4>
                                        <p className="text-sm text-slate-600">{summaries.course.prerequisites}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="lessons" className="space-y-4">
                        {course.lessons?.map((lesson) => (
                            <Card key={lesson.order} className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Lesson {lesson.order}: {lesson.title}</span>
                                        {!summaries[`lesson_${lesson.order}`] && (
                                            <Button
                                                onClick={() => generateLessonSummary(lesson)}
                                                disabled={isGenerating}
                                                variant="outline"
                                                size="sm"
                                            >
                                                {isGenerating ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    "Generate Summary"
                                                )}
                                            </Button>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                {summaries[`lesson_${lesson.order}`] && (
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2">Main Topic</h4>
                                            <p className="text-slate-700">{summaries[`lesson_${lesson.order}`].main_topic}</p>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2">Key Points</h4>
                                            <ul className="space-y-1">
                                                {summaries[`lesson_${lesson.order}`].key_points?.map((point, idx) => (
                                                    <li key={idx} className="text-sm text-slate-700">• {point}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2">Practical Takeaways</h4>
                                            <ul className="space-y-1">
                                                {summaries[`lesson_${lesson.order}`].practical_takeaways?.map((takeaway, idx) => (
                                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                                        <Badge variant="secondary" className="mt-0.5">💡</Badge>
                                                        {takeaway}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}