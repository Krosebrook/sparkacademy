import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, BookOpen, X } from "lucide-react";
import { motion } from "framer-motion";

export default function GeneratedLessonsPreview({ lessons, onAccept, onReject }) {
    if (!lessons || lessons.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-violet-50 to-purple-50">
                <CardHeader className="border-b border-violet-100 pb-6">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl text-slate-900 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            Generated Course Outline
                        </CardTitle>
                        <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                            {lessons.length} Lessons
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4 mb-6">
                        {lessons.map((lesson, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-xl p-5 shadow-sm border border-violet-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-semibold">{lesson.order}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-semibold text-slate-900 mb-2">
                                            {lesson.title}
                                        </h4>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-3">
                                            {lesson.content}
                                        </p>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-sm">{lesson.duration_minutes} minutes</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={onAccept}
                            className="flex-1 h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 transition-opacity shadow-lg"
                        >
                            <Check className="h-5 w-5 mr-2" />
                            Use This Outline
                        </Button>
                        <Button
                            onClick={onReject}
                            variant="outline"
                            className="h-12 border-slate-300 hover:bg-slate-50"
                        >
                            <X className="h-5 w-5 mr-2" />
                            Regenerate
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}