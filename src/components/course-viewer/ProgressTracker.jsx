import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Trophy, Target } from "lucide-react";

export default function ProgressTracker({ enrollment, course }) {
    if (!enrollment || !course) return null;

    const completedLessons = enrollment.progress?.filter(p => p.completed).length || 0;
    const totalLessons = course.lessons?.length || 0;
    const completionPercentage = enrollment.completion_percentage || 0;

    const totalQuizzes = course.lessons?.filter(l => l.quiz).length || 0;
    const passedQuizzes = enrollment.progress?.filter(p => p.quiz_passed).length || 0;

    const averageQuizScore = enrollment.progress
        ?.filter(p => typeof p.quiz_score === 'number')
        .reduce((sum, p, _, arr) => sum + p.quiz_score / arr.length, 0) || 0;

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-50">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Target className="h-5 w-5 text-violet-600" />
                        Your Progress
                    </h3>
                    <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                        {Math.round(completionPercentage)}%
                    </Badge>
                </div>

                <div className="space-y-4">
                    {/* Overall Progress */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">Course Completion</span>
                            <span className="font-semibold text-slate-900">
                                {completedLessons} / {totalLessons} lessons
                            </span>
                        </div>
                        <Progress value={completionPercentage} className="h-3" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-white rounded-lg border border-violet-100">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                <span className="text-xs font-medium text-slate-600">Completed</span>
                            </div>
                            <p className="text-xl font-bold text-slate-900">{completedLessons}</p>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-violet-100">
                            <div className="flex items-center gap-2 mb-1">
                                <Trophy className="h-4 w-4 text-amber-500" />
                                <span className="text-xs font-medium text-slate-600">Quizzes</span>
                            </div>
                            <p className="text-xl font-bold text-slate-900">
                                {passedQuizzes}/{totalQuizzes}
                            </p>
                        </div>

                        {averageQuizScore > 0 && (
                            <div className="col-span-2 p-3 bg-white rounded-lg border border-violet-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-blue-500" />
                                        <span className="text-xs font-medium text-slate-600">Average Quiz Score</span>
                                    </div>
                                    <p className="text-xl font-bold text-slate-900">
                                        {Math.round(averageQuizScore)}%
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Time Estimate */}
                    {completionPercentage < 100 && (
                        <div className="pt-3 border-t border-violet-100">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Clock className="h-4 w-4" />
                                <span>
                                    {totalLessons - completedLessons} lessons remaining
                                </span>
                            </div>
                        </div>
                    )}

                    {completionPercentage === 100 && (
                        <div className="pt-3 border-t border-violet-100">
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                <Trophy className="h-5 w-5 text-emerald-600" />
                                <span className="text-sm font-semibold text-emerald-700">
                                    Course Completed! 🎉
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}