import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, User, FileText, Send } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function AIAssignmentFeedback({ courseId }) {
    const [enrollments, setEnrollments] = useState([]);
    const [course, setCourse] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [generatedFeedback, setGeneratedFeedback] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        loadData();
    }, [courseId]);

    const loadData = async () => {
        const courseData = await base44.entities.Course.get(courseId);
        setCourse(courseData);

        const allEnrollments = await base44.entities.Enrollment.filter({ course_id: courseId });
        const withSubmissions = allEnrollments.filter(e => 
            e.progress?.some(p => p.project_submitted && !p.project_feedback)
        );
        setEnrollments(withSubmissions);
    };

    const generateFeedback = async (enrollment, lessonProgress) => {
        setIsGenerating(true);
        setSelectedSubmission({ enrollment, lessonProgress });
        
        try {
            const lesson = course.lessons.find(l => l.order === lessonProgress.lesson_order);
            const project = lesson.project;

            const prompt = `As an instructor, provide detailed, personalized feedback on this student project submission:

Project Title: ${project.title}
Project Description: ${project.description}
Requirements: ${project.requirements?.join(", ")}

Student Performance in Course:
- Overall Progress: ${enrollment.completion_percentage}%
- Quiz Scores: ${enrollment.progress?.map(p => p.quiz_score || 'N/A').join(", ")}

Generate comprehensive feedback that includes:
1. Strengths (what they did well - 3-4 points)
2. Areas for improvement (specific, actionable - 3-4 points)
3. Detailed suggestions (how to enhance their work)
4. Overall assessment and grade recommendation
5. Encouraging closing remarks`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        strengths: { type: "array", items: { type: "string" } },
                        improvements: { type: "array", items: { type: "string" } },
                        suggestions: { type: "string" },
                        overall_assessment: { type: "string" },
                        grade_recommendation: { type: "string" },
                        closing_remarks: { type: "string" }
                    }
                }
            });

            const feedback = `**Strengths:**
${result.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

**Areas for Improvement:**
${result.improvements.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

**Detailed Suggestions:**
${result.suggestions}

**Overall Assessment:**
${result.overall_assessment}

**Grade Recommendation:** ${result.grade_recommendation}

${result.closing_remarks}`;

            setGeneratedFeedback(feedback);
        } catch (error) {
            console.error("Error generating feedback:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const sendFeedback = async () => {
        setIsSending(true);
        try {
            const updatedProgress = selectedSubmission.enrollment.progress.map(p => {
                if (p.lesson_order === selectedSubmission.lessonProgress.lesson_order) {
                    return { ...p, project_feedback: generatedFeedback };
                }
                return p;
            });

            await base44.entities.Enrollment.update(selectedSubmission.enrollment.id, {
                progress: updatedProgress
            });

            await base44.integrations.Core.SendEmail({
                to: selectedSubmission.enrollment.student_email,
                subject: `Project Feedback - ${course.title}`,
                body: `You've received feedback on your project submission!\n\n${generatedFeedback}`
            });

            setSelectedSubmission(null);
            setGeneratedFeedback("");
            loadData();
        } catch (error) {
            console.error("Error sending feedback:", error);
        } finally {
            setIsSending(false);
        }
    };

    if (enrollments.length === 0) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-600">No project submissions awaiting feedback</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-600" />
                    AI Assignment Feedback
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {enrollments.map(enrollment => {
                        const pendingSubmissions = enrollment.progress.filter(
                            p => p.project_submitted && !p.project_feedback
                        );
                        
                        return pendingSubmissions.map((progress, idx) => {
                            const lesson = course.lessons.find(l => l.order === progress.lesson_order);
                            
                            return (
                                <div key={`${enrollment.id}-${idx}`} className="p-4 border border-slate-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <User className="h-5 w-5 text-slate-400" />
                                            <div>
                                                <p className="font-semibold text-slate-900">{enrollment.student_email}</p>
                                                <p className="text-sm text-slate-600">Lesson {progress.lesson_order}: {lesson?.title}</p>
                                            </div>
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    onClick={() => generateFeedback(enrollment, progress)}
                                                    size="sm"
                                                    className="bg-violet-600 hover:bg-violet-700"
                                                >
                                                    <Sparkles className="h-4 w-4 mr-2" />
                                                    Generate Feedback
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>AI-Generated Feedback</DialogTitle>
                                                </DialogHeader>
                                                {isGenerating ? (
                                                    <div className="flex items-center justify-center py-12">
                                                        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                                                    </div>
                                                ) : generatedFeedback ? (
                                                    <div className="space-y-4">
                                                        <Textarea
                                                            value={generatedFeedback}
                                                            onChange={(e) => setGeneratedFeedback(e.target.value)}
                                                            className="min-h-96"
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedSubmission(null);
                                                                    setGeneratedFeedback("");
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                onClick={sendFeedback}
                                                                disabled={isSending}
                                                                className="bg-violet-600 hover:bg-violet-700"
                                                            >
                                                                {isSending ? (
                                                                    <>
                                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                        Sending...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Send className="w-4 h-4 mr-2" />
                                                                        Send Feedback
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            );
                        });
                    })}
                </div>
            </CardContent>
        </Card>
    );
}