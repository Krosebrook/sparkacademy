import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Brain, X, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function GeneratedQuizPreview({ questions, onAccept, onReject }) {
    if (!questions || questions.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="border-b border-blue-100 pb-6">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl text-slate-900 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <Brain className="h-5 w-5 text-white" />
                            </div>
                            Generated Quiz Questions
                        </CardTitle>
                        <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                            {questions.length} Questions
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-6 mb-6">
                        {questions.map((question, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-xl p-5 shadow-sm border border-blue-100"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-semibold text-sm">{idx + 1}</span>
                                    </div>
                                    <p className="text-slate-900 font-medium leading-relaxed flex-1">
                                        {question.question_text}
                                    </p>
                                </div>
                                <div className="space-y-2 ml-11">
                                    {question.options.map((option, optIdx) => (
                                        <div
                                            key={optIdx}
                                            className={`p-3 rounded-lg border transition-colors ${
                                                optIdx === question.correct_option_index
                                                    ? "bg-emerald-50 border-emerald-200"
                                                    : "bg-slate-50 border-slate-200"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {optIdx === question.correct_option_index && (
                                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                )}
                                                <span className={`text-sm ${
                                                    optIdx === question.correct_option_index
                                                        ? "text-emerald-900 font-medium"
                                                        : "text-slate-600"
                                                }`}>
                                                    {option}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={onAccept}
                            className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 transition-opacity shadow-lg"
                        >
                            <Check className="h-5 w-5 mr-2" />
                            Use These Questions
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