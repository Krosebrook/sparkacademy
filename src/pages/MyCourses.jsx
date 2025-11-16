import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, BookOpen, Clock, Sparkles, BarChart } from "lucide-react";
import { createPageUrl } from "../utils";

export default function MyCourses() {
    const navigate = useNavigate();

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: () => base44.auth.me()
    });

    const { data: courses, isLoading } = useQuery({
        queryKey: ['myCourses'],
        queryFn: async () => {
            const allCourses = await base44.entities.Course.list();
            return allCourses.filter(c => c.created_by === user?.email);
        },
        enabled: !!user
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">My Courses</h1>
                        <p className="text-slate-600">Create and manage your courses</p>
                    </div>
                    <Button
                        onClick={() => navigate(createPageUrl("CreateCourse"))}
                        className="h-12 px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 shadow-lg"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Create Course
                    </Button>
                </div>

                {!courses || courses.length === 0 ? (
                    <Card className="border-0 shadow-xl">
                        <CardContent className="p-16 text-center">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="h-10 w-10 text-violet-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-slate-900 mb-3">Start Creating Amazing Courses</h3>
                            <p className="text-slate-600 mb-8 max-w-md mx-auto">
                                Use AI to generate course outlines, quizzes, and find resources in seconds
                            </p>
                            <Button
                                onClick={() => navigate(createPageUrl("CreateCourse"))}
                                className="h-12 px-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 shadow-lg"
                            >
                                <Sparkles className="h-5 w-5 mr-2" />
                                Create Your First Course
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <Card
                                key={course.id}
                                className="border-0 shadow-lg hover:shadow-xl transition-all group"
                            >
                                <CardContent className="p-6">
                                    <div className="h-40 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4 flex items-center justify-center">
                                        <BookOpen className="h-16 w-16 text-white opacity-50" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                        {course.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                        {course.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="h-4 w-4" />
                                            <span>{course.lessons?.length || 0} lessons</span>
                                        </div>
                                        {course.duration_hours > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>{course.duration_hours}h</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => navigate(createPageUrl("CourseOverview") + `?id=${course.id}`)}
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                        >
                                            <BarChart className="h-4 w-4 mr-1" />
                                            Overview
                                        </Button>
                                        <Button
                                            onClick={() => navigate(createPageUrl("EditCourse") + `?id=${course.id}`)}
                                            size="sm"
                                            className="flex-1 bg-violet-600 hover:bg-violet-700"
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}