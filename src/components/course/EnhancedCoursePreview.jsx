import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, ChevronUp, BookOpen, Clock, Target, Brain, Users, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EnhancedCoursePreview({ course, onAccept, onReject }) {
    const [expandedLesson, setExpandedLesson] = useState(null);

    if (!course) return null;

    const totalDuration = course.lessons?.reduce((sum, l) => sum + (l.duration_minutes || 0), 0) || 0;
    const totalQuizzes = course.lessons?.filter(l => l.quiz).length || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Main Course Card */}
            <Card className="border-0 shadow-2xl overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 relative">
                    {course.thumbnail_url && (
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                        <div className="flex flex-wrap gap-2">
                            <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white">
                                {course.level || "Beginner"}
                            </Badge>
                            <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white">
                                {course.category || "General"}
                            </Badge>
                        </div>
                    </div>
                </div>

                <CardContent className="p-8">
                    <p className="text-slate-700 text-lg leading-relaxed mb-6">
                        {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-violet-50 border border-violet-100">
                            <BookOpen className="h-8 w-8 text-violet-600" />
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{course.lessons?.length || 0}</p>
                                <p className="text-xs text-slate-600">Lessons</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                            <Clock className="h-8 w-8 text-blue-600" />
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{Math.round(totalDuration / 60)}h</p>
                                <p className="text-xs text-slate-600">Duration</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                            <Brain className="h-8 w-8 text-emerald-600" />
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{totalQuizzes}</p>
                                <p className="text-xs text-slate-600">Quizzes</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                            <Target className="h-8 w-8 text-amber-600" />
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{course.skills_taught?.length || 0}</p>
                                <p className="text-xs text-slate-600">Skills</p>
                            </div>
                        </div>
                    </div>

                    {/* Skills Section */}
                    {course.skills_taught && course.skills_taught.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                <Star className="h-4 w-4 text-amber-500" />
                                What You'll Learn
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {course.skills_taught.map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="bg-slate-50">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Instructor Info */}
                    {course.instructor_name && (
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-900">{course.instructor_name}</p>
                                {course.instructor_bio && (
                                    <p className="text-sm text-slate-600">{course.instructor_bio}</p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Curriculum */}
            <Card className="border-0 shadow-xl">
                <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-2xl flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-violet-600" />
                        Course Curriculum
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-3">
                        {course.lessons?.map((lesson, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setExpandedLesson(expandedLesson === idx ? null : idx)}
                                    className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-semibold">{lesson.order}</span>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-semibold text-slate-900">{lesson.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-sm text-slate-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {lesson.duration_minutes} min
                                            </span>
                                            {lesson.quiz && (
                                                <Badge variant="outline" className="text-xs">
                                                    <Brain className="h-3 w-3 mr-1" />
                                                    Quiz
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {expandedLesson === idx ? (
                                        <ChevronUp className="h-5 w-5 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-slate-400" />
                                    )}
                                </button>
                                <AnimatePresence>
                                    {expandedLesson === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-slate-100"
                                        >
                                            <div className="p-4 bg-slate-50">
                                                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                                                    {lesson.content}
                                                </p>
                                                {lesson.quiz && (
                                                    <div className="pt-3 border-t border-slate-200">
                                                        <p className="text-xs font-semibold text-slate-700 mb-2">
                                                            Quiz: {lesson.quiz.questions?.length || 0} questions
                                                        </p>
                                                        <p className="text-xs text-slate-600">
                                                            Passing score: {lesson.quiz.passing_score || 70}%
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <Button
                    onClick={onAccept}
                    className="flex-1 h-14 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 shadow-lg"
                >
                    <Check className="h-5 w-5 mr-2" />
                    Save This Course
                </Button>
                <Button
                    onClick={onReject}
                    variant="outline"
                    className="h-14 px-8 border-slate-300"
                >
                    Edit Details
                </Button>
            </div>
        </motion.div>
    );
}