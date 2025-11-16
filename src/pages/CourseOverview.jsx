import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BookOpen, Users, Clock, Star, Edit, BarChart, MessageSquare } from "lucide-react";
import FeedbackInsights from "@/components/course/FeedbackInsights";
import { createPageUrl } from "@/utils";

export default function CourseOverview() {
    const location = useLocation();
    const navigate = useNavigate();
    const courseId = new URLSearchParams(location.search).get('id');
    
    const [course, setCourse] = useState(null);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (courseId) loadCourseData();
    }, [courseId]);

    const loadCourseData = async () => {
        setIsLoading(true);
        try {
            const courseData = await base44.entities.Course.get(courseId);
            setCourse(courseData);

            const enrollments = await base44.entities.Enrollment.filter({ course_id: courseId });
            const feedback = await base44.entities.CourseFeedback.filter({ course_id: courseId });

            const avgRating = feedback.length > 0
                ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length
                : 0;

            const completedStudents = enrollments.filter(e => e.completion_percentage === 100).length;
            const avgCompletion = enrollments.length > 0
                ? enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / enrollments.length
                : 0;

            setStats({
                totalEnrollments: enrollments.length,
                completedStudents,
                avgCompletion: Math.round(avgCompletion),
                avgRating: avgRating.toFixed(1),
                feedbackCount: feedback.length
            });
        } catch (error) {
            console.error("Error loading course data:", error);
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

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-600">Course not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">{course.title}</h1>
                            <p className="text-slate-600">{course.description}</p>
                        </div>
                        <Button
                            onClick={() => navigate(createPageUrl("EditCourse") + `?id=${courseId}`)}
                            variant="outline"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Course
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{course.category}</Badge>
                        <Badge variant="secondary">{course.level}</Badge>
                        {course.is_published && <Badge className="bg-green-100 text-green-800">Published</Badge>}
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Total Students</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats?.totalEnrollments || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                                    <BookOpen className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Completed</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats?.completedStudents || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Star className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Avg Rating</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats?.avgRating || "N/A"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <MessageSquare className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Feedback</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats?.feedbackCount || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="insights" className="space-y-6">
                    <TabsList className="bg-white border border-slate-200">
                        <TabsTrigger value="insights">
                            <BarChart className="h-4 w-4 mr-2" />
                            Feedback Insights
                        </TabsTrigger>
                        <TabsTrigger value="details">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Course Details
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="insights">
                        <FeedbackInsights courseId={courseId} />
                    </TabsContent>

                    <TabsContent value="details">
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Course Content</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-2">Lessons ({course.lessons?.length || 0})</h4>
                                    <ul className="space-y-2">
                                        {course.lessons?.map((lesson, idx) => (
                                            <li key={idx} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                                                <span className="font-semibold text-violet-600">#{lesson.order}</span>
                                                <span className="flex-1">{lesson.title}</span>
                                                {lesson.duration_minutes && (
                                                    <Badge variant="outline">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {lesson.duration_minutes}m
                                                    </Badge>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}