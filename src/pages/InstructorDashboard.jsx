import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Users, BookOpen, TrendingUp, MessageCircle, Star, AlertCircle } from "lucide-react";

export default function InstructorDashboard() {
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
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

            const allDiscussions = await base44.entities.CourseDiscussion.list();
            const myDiscussions = allDiscussions.filter(d =>
                myCourses.some(c => c.id === d.course_id)
            );

            const courseAnalytics = myCourses.map(course => {
                const enrollments = myEnrollments.filter(e => e.course_id === course.id);
                const discussions = myDiscussions.filter(d => d.course_id === course.id);
                
                const avgCompletion = enrollments.length > 0
                    ? enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / enrollments.length
                    : 0;

                const completedCount = enrollments.filter(e => e.completion_percentage === 100).length;

                return {
                    courseId: course.id,
                    courseTitle: course.title,
                    totalStudents: enrollments.length,
                    avgCompletion: Math.round(avgCompletion),
                    completedStudents: completedCount,
                    discussionCount: discussions.length,
                    rating: course.rating || 0,
                    reviewsCount: course.reviews_count || 0,
                };
            });

            const totalStudents = courseAnalytics.reduce((sum, c) => sum + c.totalStudents, 0);
            const totalDiscussions = courseAnalytics.reduce((sum, c) => sum + c.discussionCount, 0);
            const avgRating = myCourses.filter(c => c.rating > 0).length > 0
                ? myCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / myCourses.filter(c => c.rating > 0).length
                : 0;

            setAnalytics({
                courseAnalytics,
                totalStudents,
                totalDiscussions,
                avgRating: avgRating.toFixed(1),
                totalCourses: myCourses.length,
            });

        } catch (error) {
            console.error("Error loading instructor dashboard:", error);
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
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Instructor Performance Dashboard</h1>
                    <p className="text-slate-600">Track your teaching impact and course engagement</p>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <BookOpen className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Total Courses</p>
                                    <p className="text-2xl font-bold text-slate-900">{analytics?.totalCourses || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Total Students</p>
                                    <p className="text-2xl font-bold text-slate-900">{analytics?.totalStudents || 0}</p>
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
                                    <p className="text-2xl font-bold text-slate-900">{analytics?.avgRating || "N/A"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <MessageCircle className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Discussions</p>
                                    <p className="text-2xl font-bold text-slate-900">{analytics?.totalDiscussions || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="courses" className="space-y-6">
                    <TabsList className="bg-white border border-slate-200">
                        <TabsTrigger value="courses">Course Performance</TabsTrigger>
                        <TabsTrigger value="engagement">Engagement Insights</TabsTrigger>
                        <TabsTrigger value="improvements">Areas for Improvement</TabsTrigger>
                    </TabsList>

                    <TabsContent value="courses" className="space-y-4">
                        {analytics?.courseAnalytics?.map((course) => (
                            <Card key={course.courseId} className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{course.courseTitle}</span>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="secondary">
                                                {course.totalStudents} students
                                            </Badge>
                                            {course.rating > 0 && (
                                                <Badge className="bg-amber-100 text-amber-800">
                                                    <Star className="h-3 w-3 mr-1" />
                                                    {course.rating.toFixed(1)}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div>
                                            <p className="text-sm text-slate-600 mb-2">Average Completion</p>
                                            <Progress value={course.avgCompletion} className="h-3 mb-2" />
                                            <p className="text-2xl font-bold text-slate-900">{course.avgCompletion}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600 mb-2">Completed Students</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {course.completedStudents} / {course.totalStudents}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600 mb-2">Discussion Activity</p>
                                            <p className="text-2xl font-bold text-purple-600">{course.discussionCount}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="engagement">
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    Student Engagement Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <h4 className="font-semibold text-green-900 mb-2">High Engagement Courses</h4>
                                    <ul className="space-y-1">
                                        {analytics?.courseAnalytics
                                            ?.filter(c => c.discussionCount > 5)
                                            .map(c => (
                                                <li key={c.courseId} className="text-sm text-slate-700">
                                                    • {c.courseTitle} - {c.discussionCount} discussions
                                                </li>
                                            ))}
                                    </ul>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-semibold text-blue-900 mb-2">Student Completion Rates</h4>
                                    <p className="text-sm text-slate-700">
                                        Your courses have an average completion rate of{" "}
                                        {analytics?.courseAnalytics?.length > 0
                                            ? Math.round(
                                                analytics.courseAnalytics.reduce((sum, c) => sum + c.avgCompletion, 0) /
                                                analytics.courseAnalytics.length
                                              )
                                            : 0}
                                        %. Keep engaging students with interactive content!
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="improvements">
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                    Suggestions for Improvement
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {analytics?.courseAnalytics
                                    ?.filter(c => c.avgCompletion < 50)
                                    .map(course => (
                                        <div key={course.courseId} className="p-4 border-l-4 border-amber-500 bg-amber-50">
                                            <h4 className="font-semibold text-slate-900 mb-2">{course.courseTitle}</h4>
                                            <p className="text-sm text-slate-700 mb-2">
                                                Low completion rate ({course.avgCompletion}%)
                                            </p>
                                            <ul className="text-sm text-slate-600 space-y-1">
                                                <li>• Consider breaking down complex lessons into smaller chunks</li>
                                                <li>• Add more interactive quizzes and projects</li>
                                                <li>• Engage students in course discussions</li>
                                            </ul>
                                        </div>
                                    ))}

                                {analytics?.courseAnalytics
                                    ?.filter(c => c.discussionCount === 0)
                                    .map(course => (
                                        <div key={course.courseId} className="p-4 border-l-4 border-purple-500 bg-purple-50">
                                            <h4 className="font-semibold text-slate-900 mb-2">{course.courseTitle}</h4>
                                            <p className="text-sm text-slate-700 mb-2">No discussion activity</p>
                                            <ul className="text-sm text-slate-600 space-y-1">
                                                <li>• Post discussion prompts to encourage engagement</li>
                                                <li>• Ask open-ended questions at the end of lessons</li>
                                                <li>• Respond to student questions quickly</li>
                                            </ul>
                                        </div>
                                    ))}

                                {analytics?.courseAnalytics?.every(c => c.avgCompletion >= 50 && c.discussionCount > 0) && (
                                    <div className="text-center py-8 text-slate-500">
                                        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                        <p className="font-semibold">Great job! Your courses are performing well.</p>
                                        <p className="text-sm">Keep up the excellent work!</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}