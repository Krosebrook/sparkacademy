import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AutoGrader({ quizData, studentAnswers, onGradingComplete }) {
    const [results, setResults] = useState(null);
    const [isGrading, setIsGrading] = useState(false);

    const gradeSubmission = async () => {
        setIsGrading(true);
        try {
            let correctCount = 0;
            const detailedResults = [];

            for (let i = 0; i < quizData.questions.length; i++) {
                const question = quizData.questions[i];
                const studentAnswer = studentAnswers[i];

                if (question.type === "multiple_choice" || question.type === "true_false") {
                    const isCorrect = studentAnswer === question.correct_option_index;
                    if (isCorrect) correctCount++;
                    
                    detailedResults.push({
                        question: question.question_text,
                        studentAnswer: question.options?.[studentAnswer] || "No answer",
                        correctAnswer: question.options?.[question.correct_option_index],
                        isCorrect,
                        explanation: question.explanation
                    });
                } else if (question.type === "short_answer") {
                    const prompt = `Grade this short answer question:

QUESTION: ${question.question_text}
STUDENT ANSWER: ${studentAnswer}
CORRECT ANSWER/KEY POINTS: ${question.explanation}

Determine if the student's answer is correct (1) or incorrect (0).
Provide a brief explanation of why.`;

                    const aiGrading = await base44.integrations.Core.InvokeLLM({
                        prompt,
                        response_json_schema: {
                            type: "object",
                            properties: {
                                is_correct: { type: "number" },
                                feedback: { type: "string" }
                            }
                        }
                    });

                    if (aiGrading.is_correct === 1) correctCount++;

                    detailedResults.push({
                        question: question.question_text,
                        studentAnswer,
                        isCorrect: aiGrading.is_correct === 1,
                        explanation: aiGrading.feedback
                    });
                }
            }

            const score = Math.round((correctCount / quizData.questions.length) * 100);
            const passed = score >= (quizData.passing_score || 70);

            const finalResults = {
                score,
                passed,
                correctCount,
                totalQuestions: quizData.questions.length,
                details: detailedResults
            };

            setResults(finalResults);
            if (onGradingComplete) {
                onGradingComplete(finalResults);
            }
        } catch (error) {
            console.error("Error grading submission:", error);
        } finally {
            setIsGrading(false);
        }
    };

    if (!results && !isGrading) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <Button onClick={gradeSubmission} size="lg">
                        Submit for Grading
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (isGrading) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
                    <p className="text-slate-600">AI is grading your submission...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className={results.passed ? "bg-green-50" : "bg-red-50"}>
                <CardTitle className="flex items-center justify-between">
                    <span>Quiz Results</span>
                    <Badge className={results.passed ? "bg-green-600 text-white text-lg px-4 py-2" : "bg-red-600 text-white text-lg px-4 py-2"}>
                        {results.score}%
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">Score</span>
                        <span className="text-sm text-slate-600">
                            {results.correctCount} / {results.totalQuestions} correct
                        </span>
                    </div>
                    <Progress value={results.score} className="h-3" />
                </div>

                {results.passed ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                            <p className="font-semibold text-green-900">Congratulations! You passed!</p>
                            <p className="text-sm text-green-700">You can proceed to the next lesson.</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <XCircle className="h-6 w-6 text-red-600" />
                        <div>
                            <p className="font-semibold text-red-900">Not quite there yet</p>
                            <p className="text-sm text-red-700">Review the feedback below and try again.</p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <h4 className="font-bold text-slate-900">Detailed Feedback</h4>
                    {results.details?.map((result, idx) => (
                        <div key={idx} className={`p-4 border-2 rounded-lg ${result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                            <div className="flex items-start gap-2 mb-2">
                                {result.isCorrect ? (
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-slate-900 mb-2">
                                        Question {idx + 1}: {result.question}
                                    </p>
                                    <p className="text-sm text-slate-700 mb-1">
                                        <span className="font-semibold">Your answer:</span> {result.studentAnswer}
                                    </p>
                                    {!result.isCorrect && result.correctAnswer && (
                                        <p className="text-sm text-green-700 mb-1">
                                            <span className="font-semibold">Correct answer:</span> {result.correctAnswer}
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-600 mt-2 italic">
                                        {result.explanation}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}