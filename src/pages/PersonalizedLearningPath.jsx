import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Target, BookOpen, TrendingUp, Clock, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PersonalizedLearningPath() {
    const [user, setUser] = useState(null);
    const [learningPath, setLearningPath] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [preferences, setPreferences] = useState(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const userData = await base44.auth.me();
        setUser(userData);
        
        if (userData.learning_preferences) {
            setPreferences(userData.learning_preferences);
            await generateLearningPath(userData);
        }
    };

    const generateLearningPath = async (userData = user) => {
        setIsGenerating(true);
        try {
            const enrollments = await base44.entities.Enrollment.filter({ student_email: userData.email });
            const allCourses = await base44.entities.Course.filter({ is_published: true });
            
            const enrolledCourseIds = enrollments.map(e => e.course_id);
            const completedCourses = enrollments.filter(e => e.completion_percentage === 100);
            
            const performanceData = enrollments.map(e => {
                const avgScore = (e.progress || [])
                    .filter(p => p.quiz_score)
                    .reduce((sum, p, _, arr) => sum + p.quiz_score / arr.length, 0);
                
                return {
                    courseId: e.course_id,
                    completion: e.completion_percentage,
                    avgQuizScore: avgScore,
                    strugglingAreas: (e.progress || [])
                        .filter(p => p.quiz_score && p.quiz_score < 70)
                        .map(p => p.lesson_order)
                };
            });

            const learningGoals = userData.learning_preferences?.goals || ["general skill development"];
            const preferredPace = userData.learning_preferences?.pace || "moderate";
            const preferredCategories = userData.learning_preferences?.categories || [];

            const prompt = `Create a personalized learning path for this student:

Completed Courses: ${completedCourses.length}
Current Performance Data: ${JSON.stringify(performanceData)}
Learning Goals: ${learningGoals.join(", ")}
Preferred Pace: ${preferredPace}
Preferred Categories: ${preferredCategories.join(", ")}

Available Courses (not yet enrolled):
${allCourses.filter(c => !enrolledCourseIds.includes(c.id)).map(c => 
    `- ${c.title} (${c.category}, ${c.level})`
).join('\n')}

Generate a personalized learning path with:
1. Next recommended course (with detailed reasoning)
2. Alternative courses (2-3 options with reasons)
3. Skill development focus areas (3-5 areas)
4. Learning milestones (short-term and long-term goals)
5. Estimated timeline
6. Tips for success based on their performance patterns`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        next_course: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                reasoning: { type: "string" },
                                expected_outcomes: { type: "array", items: { type: "string" } }
                            }
                        },
                        alternatives: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    reason: { type: "string" }
                                }
                            }
                        },
                        skill_focus: { type: "array", items: { type: "string" } },
                        milestones: {
                            type: "object",
                            properties: {
                                short_term: { type: "array", items: { type: "string" } },
                                long_term: { type: "array", items: { type: "string" } }
                            }
                        },
                        timeline: { type: "string" },
                        success_tips: { type: "array", items: { type: "string" } }
                    }
                }
            });

            const nextCourse = allCourses.find(c => 
                c.title.toLowerCase().includes(result.next_course.title.toLowerCase())
            );
            
            if (nextCourse) {
                result.next_course.course_id = nextCourse.id;
                result.next_course.course_data = nextCourse;
            }

            result.alternatives = result.alternatives.map(alt => {
                const course = allCourses.find(c => 
                    c.title.toLowerCase().includes(alt.title.toLowerCase())
                );
                return {
                    ...alt,
                    course_id: course?.id,
                    course_data: course
                };
            }).filter(alt => alt.course_id);

            setLearningPath(result);
        } catch (error) {
            console.error("Error generating learning path:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!user) {
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
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Your Personalized Learning Path</h1>
                    <p className="text-slate-600">AI-curated courses tailored to your goals and performance</p>
                </div>

                {!learningPath ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <Target className="h-16 w-16 mx-auto mb-6 text-violet-600" />
                            <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                                Generate Your Learning Path
                            </h3>
                            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                                Based on your progress, performance, and goals, we'll create a personalized learning journey just for you.
                            </p>
                            <Button
                                onClick={() => generateLearningPath()}
                                disabled={isGenerating}
                                size="lg"
                                className="bg-gradient-to-r from-violet-600 to-purple-600"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Analyzing Your Journey...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Create My Path
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <Card className="border-0 shadow-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Target className="h-8 w-8" />
                                    <div>
                                        <h3 className="text-xl font-bold">Your Next Step</h3>
                                        <p className="text-white/90">{learningPath.timeline}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-violet-600" />
                                    Recommended Course
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {learningPath.next_course.course_data ? (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                                <BookOpen className="h-8 w-8 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-xl font-semibold text-slate-900 mb-2">
                                                    {learningPath.next_course.course_data.title}
                                                </h4>
                                                <div className="flex gap-2 mb-3">
                                                    <Badge variant="secondary">{learningPath.next_course.course_data.category}</Badge>
                                                    <Badge variant="secondary">{learningPath.next_course.course_data.level}</Badge>
                                                    <Badge variant="outline">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {learningPath.next_course.course_data.duration_hours}h
                                                    </Badge>
                                                </div>
                                                <p className="text-slate-700 mb-4">{learningPath.next_course.reasoning}</p>
                                                
                                                <div className="mb-4">
                                                    <p className="text-sm font-semibold text-slate-900 mb-2">Expected Outcomes:</p>
                                                    <ul className="space-y-1">
                                                        {learningPath.next_course.expected_outcomes?.map((outcome, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                                                {outcome}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <Link to={createPageUrl(`CourseViewer?id=${learningPath.next_course.course_id}`)}>
                                                    <Button className="bg-gradient-to-r from-violet-600 to-purple-600">
                                                        Start Learning
                                                        <ArrowRight className="w-4 h-4 ml-2" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-slate-600">{learningPath.next_course.title}</p>
                                )}
                            </CardContent>
                        </Card>

                        {learningPath.alternatives?.length > 0 && (
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Alternative Paths</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {learningPath.alternatives.map((alt, idx) => (
                                            <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:border-violet-300 transition-colors">
                                                <h4 className="font-semibold text-slate-900 mb-2">{alt.title}</h4>
                                                <p className="text-sm text-slate-600 mb-3">{alt.reason}</p>
                                                {alt.course_id && (
                                                    <Link to={createPageUrl(`CourseViewer?id=${alt.course_id}`)}>
                                                        <Button variant="outline" size="sm" className="w-full">
                                                            View Course
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                        Skill Development Focus
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {learningPath.skill_focus?.map((skill, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                                                <Badge variant="secondary">{idx + 1}</Badge>
                                                {skill}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-violet-600" />
                                        Learning Milestones
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 mb-2">Short-term Goals</p>
                                        <ul className="space-y-1">
                                            {learningPath.milestones?.short_term?.map((goal, idx) => (
                                                <li key={idx} className="text-sm text-slate-700">• {goal}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 mb-2">Long-term Goals</p>
                                        <ul className="space-y-1">
                                            {learningPath.milestones?.long_term?.map((goal, idx) => (
                                                <li key={idx} className="text-sm text-slate-700">• {goal}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-0 shadow-lg bg-blue-50">
                            <CardHeader>
                                <CardTitle className="text-blue-900">Success Tips</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {learningPath.success_tips?.map((tip, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                            <span className="text-blue-600 font-bold">💡</span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <div className="text-center">
                            <Button
                                onClick={() => generateLearningPath()}
                                variant="outline"
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Regenerating...
                                    </>
                                ) : (
                                    "Regenerate Path"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}