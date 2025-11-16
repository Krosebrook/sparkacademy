import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, Users, Clock, Target, AlertCircle, CheckCircle, Sparkles } from "lucide-react";

export default function EnhancedInstructorAnalytics() {
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [aiInsights, setAiInsights] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setIsLoading(true);
        try {
            const userData = await base44.auth.me();
            setUser(userData);

            const myCourses = await base44.entities.Course.filter({ created_by: userData.email });
            setCourses(myCourses);

            const allEnrollments = await base44.entities.Enrollment.list();
            const myEnrollments = allEnrollments.filter(e => 
                myCourses.some(c => c.id === e.course_id)
            );

            const courseAnalytics = myCourses.map(course => {
                const enrollments = myEnrollments.filter(e => e.course_id === course.id);
                
                const completedCount = enrollments.filter(e => e.completion_percentage === 100).length;
                const avgCompletion = enrollments.length > 0
                    ? enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / enrollments.length
                    : 0;

                const avgTimeSpent = enrollments.length > 0
                    ? enrollments.reduce((sum, e) => {
                        const progress = e.progress || [];
                        return sum + progress.length * 30;
                    }, 0) / enrollments.length
                    : 0;

                const quizScores = enrollments.flatMap(e => 
                    (e.progress || []).map(p => p.quiz_score).filter(Boolean)
                );
                const avgQuizScore = quizScores.length > 0
                    ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
                    : 0;

                const dropoffPoints = {};
                enrollments.forEach(e => {
                    const progress = e.progress || [];
                    const lastLesson = Math.max(...progress.map(p => p.lesson_order), 0);
                    if (lastLesson < (course.lessons?.length || 0)) {
                        dropoffPoints[lastLesson] = (dropoffPoints[lastLesson] || 0) + 1;
                    }
                });

                const recentActivity = enrollments.filter(e => {
                    const lastActivity = new Date(e.last_activity_date || e.enrollment_date);
                    const daysSince = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);
                    return daysSince <= 7;
                }).length;

                return {
                    courseId: course.id,
                    courseTitle: course.title,
                    totalStudents: enrollments.length,
                    completedStudents: completedCount,
                    avgCompletion: Math.round(avgCompletion),
                    avgTimeSpent: Math.round(avgTimeSpent),
                    avgQuizScore: Math.round(avgQuizScore),
                    dropoffPoints,
                    recentActivity,
                    completionRate: enrollments.length > 0 ? (completedCount / enrollments.length * 100).toFixed(1) : 0
                };
            });

            setAnalytics({ courseAnalytics });
        } catch (error) {
            console.error("Error loading analytics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateAIInsights = async () => {
        setIsGeneratingInsights(true);
        try {
            const analyticsData = JSON.stringify(analytics.courseAnalytics, null, 2);

            const prompt = `Analyze these instructor course analytics and provide actionable insights:

${analyticsData}

Generate:
1. Overall performance assessment (1 paragraph)
2. Top performing courses (with reasons - 3 items)
3. Courses needing attention (with specific issues - 3 items)
4. Predictive insights (likely student success patterns - 3 predictions)
5. Actionable recommendations (specific, prioritized - 5 items)
6. Engagement optimization strategies (3 strategies)`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overall_assessment: { type: "string" },
                        top_performers: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    course: { type: "string" },
                                    reason: { type: "string" }
                                }
                            }
                        },
                        needs_attention: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    course: { type: "string" },
                                    issue: { type: "string" }
                                }
                            }
                        },
                        predictions: { type: "array", items: { type: "string" } },
                        recommendations: { type: "array", items: { type: "string" } },
                        strategies: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setAiInsights(result);
        } catch (error) {
            console.error("Error generating AI insights:", error);
        } finally {
            setIsGeneratingInsights(false);
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
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">Enhanced Analytics</h1>
                        <p className="text-slate-600">Deep insights into your teaching performance</p>
                    </div>
                    <Button
                        onClick={generateAIInsights}
                        disabled={isGeneratingInsights}
                        className="bg-gradient-to-r from-violet-600 to-purple-600"
                    >
                        {isGeneratingInsights ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate AI Insights
                            </>
                        )}
                    </Button>
                </div>

                {aiInsights && (
                    <Card className="border-0 shadow-lg mb-8 bg-gradient-to-br from-violet-50 to-purple-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-violet-600" />
                                AI-Powered Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-slate-900 mb-2">Overall Assessment</h4>
                                <p className="text-slate-700">{aiInsights.overall_assessment}</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        Top Performers
                                    </h4>
                                    <div className="space-y-2">
                                        {aiInsights.top_performers?.map((item, idx) => (
                                            <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <p className="font-semibold text-green-900">{item.course}</p>
                                                <p className="text-sm text-slate-700">{item.reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-amber-600" />
                                        Needs Attention
                                    </h4>
                                    <div className="space-y-2">
                                        {aiInsights.needs_attention?.map((item, idx) => (
                                            <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                <p className="font-semibold text-amber-900">{item.course}</p>
                                                <p className="text-sm text-slate-700">{item.issue}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-slate-900 mb-3">Predictive Insights</h4>
                                <ul className="space-y-2">
                                    {aiInsights.predictions?.map((pred, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                            <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            {pred}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-slate-900 mb-3">Actionable Recommendations</h4>
                                <ol className="space-y-2">
                                    {aiInsights.recommendations?.map((rec, idx) => (
                                        <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                                            <Badge className="mt-0.5">{idx + 1}</Badge>
                                            <span className="text-sm text-slate-700">{rec}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Total Students</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {analytics?.courseAnalytics.reduce((sum, c) => sum + c.totalStudents, 0) || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Avg Completion</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {Math.round(
                                            analytics?.courseAnalytics.reduce((sum, c) => sum + c.avgCompletion, 0) /
                                            (analytics?.courseAnalytics.length || 1)
                                        )}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Avg Time/Student</p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {Math.round(
                                            analytics?.courseAnalytics.reduce((sum, c) => sum + c.avgTimeSpent, 0) /
                                            (analytics?.courseAnalytics.length || 1)
                                        )}m
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="courses">
                    <TabsList className="bg-white border border-slate-200 mb-6">
                        <TabsTrigger value="courses">Course Performance</TabsTrigger>
                        <TabsTrigger value="engagement">Engagement Metrics</TabsTrigger>
                        <TabsTrigger value="dropoff">Dropoff Analysis</TabsTrigger>
                    </TabsList>

                    <TabsContent value="courses" className="space-y-4">
                        {analytics?.courseAnalytics.map(course => (
                            <Card key={course.courseId} className="border-0 shadow-lg">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>{course.courseTitle}</CardTitle>
                                        <Badge variant="secondary">{course.totalStudents} students</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-4 gap-6">
                                        <div>
                                            <p className="text-sm text-slate-600 mb-2">Completion Rate</p>
                                            <Progress value={course.completionRate} className="h-3 mb-2" />
                                            <p className="text-2xl font-bold text-violet-600">{course.completionRate}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600 mb-2">Avg Quiz Score</p>
                                            <p className="text-2xl font-bold text-blue-600">{course.avgQuizScore}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600 mb-2">Avg Time Spent</p>
                                            <p className="text-2xl font-bold text-green-600">{course.avgTimeSpent}m</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600 mb-2">Recent Activity</p>
                                            <p className="text-2xl font-bold text-purple-600">{course.recentActivity}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="engagement">
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Student Engagement Patterns</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {analytics?.courseAnalytics.map(course => (
                                        <div key={course.courseId}>
                                            <h4 className="font-semibold text-slate-900 mb-3">{course.courseTitle}</h4>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <p className="text-sm font-semibold text-blue-900 mb-1">Active Students (Last 7 Days)</p>
                                                    <p className="text-3xl font-bold text-blue-700">{course.recentActivity}</p>
                                                    <p className="text-xs text-slate-600 mt-1">
                                                        {((course.recentActivity / course.totalStudents) * 100).toFixed(1)}% of total
                                                    </p>
                                                </div>
                                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                    <p className="text-sm font-semibold text-green-900 mb-1">Average Progress</p>
                                                    <p className="text-3xl font-bold text-green-700">{course.avgCompletion}%</p>
                                                    <p className="text-xs text-slate-600 mt-1">
                                                        {course.completedStudents} completed
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="dropoff">
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Student Dropoff Points</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {analytics?.courseAnalytics.map(course => {
                                        const hasDropoffs = Object.keys(course.dropoffPoints).length > 0;
                                        return (
                                            <div key={course.courseId}>
                                                <h4 className="font-semibold text-slate-900 mb-3">{course.courseTitle}</h4>
                                                {hasDropoffs ? (
                                                    <div className="space-y-2">
                                                        {Object.entries(course.dropoffPoints)
                                                            .sort((a, b) => b[1] - a[1])
                                                            .map(([lesson, count]) => (
                                                                <div key={lesson} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                                                    <div className="flex-1">
                                                                        <p className="font-semibold text-slate-900">After Lesson {lesson}</p>
                                                                        <p className="text-sm text-slate-600">{count} students dropped off here</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-600 py-4">No significant dropoff points detected</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}