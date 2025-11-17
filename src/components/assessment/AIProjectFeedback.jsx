import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Upload } from "lucide-react";

export default function AIProjectFeedback({ courseId, lessonOrder, userEmail }) {
    const [submission, setSubmission] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateFeedback = async () => {
        if (!submission.trim()) return;
        
        setIsGenerating(true);
        try {
            const course = await base44.entities.Course.get(courseId);
            const lesson = course.lessons?.find(l => l.order === lessonOrder);

            const prompt = `You are an experienced instructor providing detailed feedback on a student's project submission.

COURSE: ${course.title}
LESSON: ${lesson?.title}
PROJECT REQUIREMENTS: ${lesson?.project?.requirements?.join(", ") || "General project"}

STUDENT SUBMISSION:
${submission}

Provide comprehensive feedback with:
1. Overall Assessment (0-100 score)
2. Strengths (3-5 specific points)
3. Areas for Improvement (3-5 specific points)
4. Detailed Feedback (constructive and encouraging)
5. Next Steps (2-3 actionable recommendations)

Be specific, constructive, and encouraging. Reference actual elements from the submission.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        score: { type: "number" },
                        grade: { type: "string" },
                        strengths: { type: "array", items: { type: "string" } },
                        improvements: { type: "array", items: { type: "string" } },
                        detailed_feedback: { type: "string" },
                        next_steps: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setFeedback(result);

            const enrollment = (await base44.entities.Enrollment.filter({
                student_email: userEmail,
                course_id: courseId
            }))[0];

            if (enrollment) {
                const progress = enrollment.progress || [];
                const lessonProgress = progress.find(p => p.lesson_order === lessonOrder) || {};
                const updatedProgress = progress.filter(p => p.lesson_order !== lessonOrder);
                updatedProgress.push({
                    ...lessonProgress,
                    lesson_order: lessonOrder,
                    project_submitted: true,
                    project_feedback: JSON.stringify(result)
                });

                await base44.entities.Enrollment.update(enrollment.id, {
                    progress: updatedProgress,
                    points_earned: (enrollment.points_earned || 0) + Math.round(result.score)
                });
            }
        } catch (error) {
            console.error("Error generating feedback:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-600" />
                    AI Project Feedback
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                        Your Submission
                    </label>
                    <Textarea
                        value={submission}
                        onChange={(e) => setSubmission(e.target.value)}
                        placeholder="Paste your project description, code, or written work here..."
                        rows={8}
                        disabled={isGenerating}
                    />
                </div>

                <Button 
                    onClick={generateFeedback}
                    disabled={!submission.trim() || isGenerating}
                    className="w-full"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing Submission...
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4 mr-2" />
                            Submit for AI Feedback
                        </>
                    )}
                </Button>

                {feedback && (
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">Assessment Results</h3>
                            <Badge className="text-lg px-4 py-1 bg-violet-600 text-white">
                                {feedback.score}/100 - {feedback.grade}
                            </Badge>
                        </div>

                        <div>
                            <h4 className="font-semibold text-green-700 mb-2">✓ Strengths</h4>
                            <ul className="space-y-1">
                                {feedback.strengths?.map((strength, idx) => (
                                    <li key={idx} className="text-sm text-slate-700">• {strength}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-amber-700 mb-2">⚠ Areas for Improvement</h4>
                            <ul className="space-y-1">
                                {feedback.improvements?.map((improvement, idx) => (
                                    <li key={idx} className="text-sm text-slate-700">• {improvement}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Detailed Feedback</h4>
                            <p className="text-sm text-slate-700">{feedback.detailed_feedback}</p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-blue-700 mb-2">→ Next Steps</h4>
                            <ul className="space-y-1">
                                {feedback.next_steps?.map((step, idx) => (
                                    <li key={idx} className="text-sm text-slate-700">• {step}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}