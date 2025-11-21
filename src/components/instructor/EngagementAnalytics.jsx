import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, Clock, MessageSquare } from "lucide-react";
import { Line, Bar } from "recharts";
import { ResponsiveContainer, LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function EngagementAnalytics({ instructorEmail }) {
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, [instructorEmail]);

    const loadAnalytics = async () => {
        setIsLoading(true);
        try {
            const courses = await base44.entities.Course.filter({ created_by: instructorEmail });
            const courseIds = courses.map(c => c.id);
            
            const [enrollments, discussions, feedback] = await Promise.all([
                Promise.all(courseIds.map(id => base44.entities.Enrollment.filter({ course_id: id }))),
                Promise.all(courseIds.map(id => base44.entities.CourseDiscussion.filter({ course_id: id }))),
                Promise.all(courseIds.map(id => base44.entities.CourseFeedback.filter({ course_id: id })))
            ]);

            const flatEnrollments = enrollments.flat();
            const flatDiscussions = discussions.flat();
            const flatFeedback = feedback.flat();

            // Calculate engagement metrics
            const totalStudents = flatEnrollments.length;
            const activeStudents = flatEnrollments.filter(e => {
                const lastActivity = new Date(e.last_activity_date);
                const daysSince = (new Date() - lastActivity) / (1000 * 60 * 60 * 24);
                return daysSince <= 7;
            }).length;

            const avgCompletion = flatEnrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / (totalStudents || 1);
            const avgStreak = flatEnrollments.reduce((sum, e) => sum + (e.current_streak_days || 0), 0) / (totalStudents || 1);

            // Course-level engagement
            const courseEngagement = courses.map(course => {
                const courseEnrollments = flatEnrollments.filter(e => e.course_id === course.id);
                const courseDiscussions = flatDiscussions.filter(d => d.course_id === course.id);
                const avgCompletion = courseEnrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / (courseEnrollments.length || 1);
                
                return {
                    name: course.title,
                    students: courseEnrollments.length,
                    completion: Math.round(avgCompletion),
                    discussions: courseDiscussions.length,
                    engagement: Math.round((avgCompletion + (courseDiscussions.length / courseEnrollments.length * 100)) / 2)
                };
            });

            setAnalytics({
                totalStudents,
                activeStudents,
                avgCompletion: Math.round(avgCompletion),
                avgStreak: Math.round(avgStreak * 10) / 10,
                totalDiscussions: flatDiscussions.length,
                totalFeedback: flatFeedback.length,
                courseEngagement
            });
        } catch (error) {
            console.error("Error loading analytics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-600">Total Students</p>
                                <p className="text-2xl font-bold">{analytics?.totalStudents || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-600">Active (7d)</p>
                                <p className="text-2xl font-bold">{analytics?.activeStudents || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-600">Avg Completion</p>
                                <p className="text-2xl font-bold">{analytics?.avgCompletion || 0}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-600">Discussions</p>
                                <p className="text-2xl font-bold">{analytics?.totalDiscussions || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>Course Engagement Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.courseEngagement || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="students" fill="#3b82f6" name="Students" />
                            <Bar dataKey="completion" fill="#10b981" name="Avg Completion %" />
                            <Bar dataKey="discussions" fill="#f59e0b" name="Discussions" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}