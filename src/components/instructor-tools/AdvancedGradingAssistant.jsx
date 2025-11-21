import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function AdvancedGradingAssistant() {
    const [assignmentPrompt, setAssignmentPrompt] = useState("");
    const [rubric, setRubric] = useState("");
    const [studentSubmission, setStudentSubmission] = useState("");
    const [grading, setGrading] = useState(null);
    const [isGrading, setIsGrading] = useState(false);

    const gradeSubmission = async () => {
        setIsGrading(true);
        try {
            const prompt = `You are an expert grading assistant. Grade this student submission comprehensively.

ASSIGNMENT PROMPT:
${assignmentPrompt}

GRADING RUBRIC:
${rubric}

STUDENT SUBMISSION:
${studentSubmission}

Provide detailed grading with:
1. Overall score (0-100)
2. Grade letter (A+, A, B+, etc.)
3. Detailed feedback for each rubric criterion
4. Strengths (what student did well)
5. Areas for improvement (specific, actionable)
6. Suggestions for revision
7. Overall comments
8. Plagiarism/AI detection notes if suspicious patterns found

Be thorough, fair, and constructive. Provide specific examples from the submission.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overall_score: { type: "number" },
                        letter_grade: { type: "string" },
                        criterion_scores: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    criterion: { type: "string" },
                                    score: { type: "number" },
                                    max_score: { type: "number" },
                                    feedback: { type: "string" }
                                }
                            }
                        },
                        strengths: { type: "array", items: { type: "string" } },
                        improvements: { type: "array", items: { type: "string" } },
                        revision_suggestions: { type: "array", items: { type: "string" } },
                        overall_comments: { type: "string" },
                        flags: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setGrading(result);
        } catch (error) {
            console.error("Error grading submission:", error);
        } finally {
            setIsGrading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>AI Grading Assistant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold mb-2 block">Assignment Prompt</label>
                        <Textarea
                            placeholder="Paste the assignment instructions here..."
                            value={assignmentPrompt}
                            onChange={(e) => setAssignmentPrompt(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold mb-2 block">Grading Rubric</label>
                        <Textarea
                            placeholder="Paste your grading rubric with criteria and point values..."
                            value={rubric}
                            onChange={(e) => setRubric(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold mb-2 block">Student Submission</label>
                        <Textarea
                            placeholder="Paste the student's work here..."
                            value={studentSubmission}
                            onChange={(e) => setStudentSubmission(e.target.value)}
                            rows={8}
                        />
                    </div>
                    <Button 
                        onClick={gradeSubmission}
                        disabled={!assignmentPrompt || !studentSubmission || isGrading}
                        className="w-full"
                    >
                        {isGrading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Analyzing and Grading...
                            </>
                        ) : (
                            "Grade Submission"
                        )}
                    </Button>
                </CardContent>
            </Card>

            {grading && (
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center justify-between">
                            <CardTitle>Grading Results</CardTitle>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-green-600">{grading.overall_score}%</div>
                                <div className="text-lg font-semibold text-slate-700">{grading.letter_grade}</div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {grading.flags?.length > 0 && (
                            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                    <h4 className="font-semibold text-amber-900">Flags/Concerns:</h4>
                                </div>
                                <ul className="space-y-1">
                                    {grading.flags.map((flag, idx) => (
                                        <li key={idx} className="text-sm text-amber-800">• {flag}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div>
                            <h4 className="font-semibold mb-3">Criterion-by-Criterion Breakdown:</h4>
                            <div className="space-y-3">
                                {grading.criterion_scores?.map((crit, idx) => (
                                    <div key={idx} className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-semibold">{crit.criterion}</h5>
                                            <span className="text-sm font-bold">{crit.score}/{crit.max_score}</span>
                                        </div>
                                        <Progress value={(crit.score / crit.max_score) * 100} className="h-2 mb-2" />
                                        <p className="text-sm text-slate-700">{crit.feedback}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <h4 className="font-semibold text-green-900">Strengths:</h4>
                                </div>
                                <ul className="space-y-1">
                                    {grading.strengths?.map((strength, idx) => (
                                        <li key={idx} className="text-sm text-green-800">• {strength}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-semibold text-blue-900 mb-2">Areas for Improvement:</h4>
                                <ul className="space-y-1">
                                    {grading.improvements?.map((improvement, idx) => (
                                        <li key={idx} className="text-sm text-blue-800">• {improvement}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {grading.revision_suggestions?.length > 0 && (
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <h4 className="font-semibold text-purple-900 mb-2">Revision Suggestions:</h4>
                                <ol className="list-decimal list-inside space-y-1">
                                    {grading.revision_suggestions.map((suggestion, idx) => (
                                        <li key={idx} className="text-sm text-purple-800">{suggestion}</li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                            <h4 className="font-semibold mb-2">Overall Comments:</h4>
                            <p className="text-sm text-slate-700">{grading.overall_comments}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}