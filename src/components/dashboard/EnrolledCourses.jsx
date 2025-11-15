import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, PlayCircle, Trophy, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EnrolledCourses({ enrollments, courses }) {
    if (!enrollments || enrollments.length === 0) {
        return (
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl">My Learning</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 mb-4">You haven't enrolled in any courses yet</p>
                    <Link to={createPageUrl("Storefront")}>
                        <Button className="bg-gradient-to-r from-violet-600 to-purple-600">
                            Browse Courses
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-violet-600" />
                    My Learning
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {enrollments.map((enrollment) => {
                    const course = courses?.find(c => c.id === enrollment.course_id);
                    if (!course) return null;

                    const isCompleted = enrollment.completion_percentage === 100;
                    const completedLessons = enrollment.progress?.filter(p => p.completed).length || 0;
                    const totalLessons = course.lessons?.length || 0;

                    return (
                        <div
                            key={enrollment.id}
                            className="p-4 rounded-lg border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                    {course.thumbnail_url ? (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <BookOpen className="h-8 w-8 text-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900 mb-1">
                                                {course.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 line-clamp-1">
                                                {course.description}
                                            </p>
                                        </div>
                                        {isCompleted && (
                                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 ml-2">
                                                <Trophy className="h-3 w-3 mr-1" />
                                                Completed
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-600">Progress</span>
                                                <span className="font-semibold text-slate-900">
                                                    {completedLessons}/{totalLessons} lessons
                                                </span>
                                            </div>
                                            <Progress
                                                value={enrollment.completion_percentage || 0}
                                                className="h-2"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {course.duration_hours || 0}h
                                                </span>
                                                <span>{Math.round(enrollment.completion_percentage || 0)}% complete</span>
                                            </div>
                                            <Link to={createPageUrl(`CourseViewer?id=${course.id}`)}>
                                                <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600">
                                                    <PlayCircle className="h-4 w-4 mr-1" />
                                                    {isCompleted ? "Review" : "Continue"}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}