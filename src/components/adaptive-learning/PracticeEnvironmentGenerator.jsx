import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Code, CheckCircle, AlertCircle } from "lucide-react";

export default function PracticeEnvironmentGenerator({ topic, difficulty, learningStyle }) {
    const [exercise, setExercise] = useState(null);
    const [studentCode, setStudentCode] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);

    const generateExercise = async () => {
        setIsGenerating(true);
        setExercise(null);
        setStudentCode("");
        setFeedback(null);
        try {
            const prompt = `Generate a hands-on practice exercise for: ${topic}

REQUIREMENTS:
- Difficulty: ${difficulty}
- Learning Style: ${learningStyle?.primary_style || "mixed"}
- Include clear instructions
- Provide starter code/template
- List expected outcomes
- Include test cases
- Add hints for struggling students
- Make it practical and engaging

Create an exercise that allows real practice and immediate feedback.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        instructions: { type: "array", items: { type: "string" } },
                        starter_code: { type: "string" },
                        expected_output: { type: "string" },
                        test_cases: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    input: { type: "string" },
                                    expected: { type: "string" }
                                }
                            }
                        },
                        hints: { type: "array", items: { type: "string" } },
                        success_criteria: { type: "array", items: { type: "string" } },
                        learning_objectives: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setExercise(result);
            setStudentCode(result.starter_code || "");
        } catch (error) {
            console.error("Error generating exercise:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const evaluateSubmission = async () => {
        setIsEvaluating(true);
        try {
            const prompt = `Evaluate this student's solution for the practice exercise:

EXERCISE: ${exercise.title}
INSTRUCTIONS: ${exercise.instructions?.join("\n")}
EXPECTED OUTPUT: ${exercise.expected_output}

STUDENT'S SOLUTION:
${studentCode}

TEST CASES:
${exercise.test_cases?.map(tc => `Input: ${tc.input}, Expected: ${tc.expected}`).join("\n")}

Provide:
1. Whether the solution is correct
2. What works well
3. What needs improvement
4. Specific suggestions
5. Code quality feedback
6. A score (0-100)

Be constructive and encouraging. Tailor feedback to their learning style: ${learningStyle?.primary_style}`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        is_correct: { type: "boolean" },
                        score: { type: "number" },
                        strengths: { type: "array", items: { type: "string" } },
                        improvements: { type: "array", items: { type: "string" } },
                        suggestions: { type: "array", items: { type: "string" } },
                        code_quality: { type: "string" },
                        next_steps: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setFeedback(result);
        } catch (error) {
            console.error("Error evaluating submission:", error);
        } finally {
            setIsEvaluating(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-violet-600" />
                        Practice Environment
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Button 
                        onClick={generateExercise}
                        disabled={isGenerating}
                        className="w-full"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating Exercise...
                            </>
                        ) : (
                            <>
                                <Code className="h-4 w-4 mr-2" />
                                Generate Practice Exercise
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {exercise && (
                <>
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg">{exercise.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-700">{exercise.description}</p>

                            <div>
                                <h4 className="font-semibold text-sm mb-2">Learning Objectives:</h4>
                                <ul className="text-xs text-slate-600 space-y-1">
                                    {exercise.learning_objectives?.map((obj, idx) => (
                                        <li key={idx}>• {obj}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-sm mb-2">Instructions:</h4>
                                <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                                    {exercise.instructions?.map((inst, idx) => (
                                        <li key={idx}>{inst}</li>
                                    ))}
                                </ol>
                            </div>

                            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                <h4 className="font-semibold text-xs text-blue-900 mb-1">Expected Output:</h4>
                                <pre className="text-xs text-slate-700 whitespace-pre-wrap">{exercise.expected_output}</pre>
                            </div>

                            <div>
                                <h4 className="font-semibold text-sm mb-2">💡 Hints:</h4>
                                <ul className="text-xs text-slate-600 space-y-1">
                                    {exercise.hints?.map((hint, idx) => (
                                        <li key={idx}>• {hint}</li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-base">Your Solution</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Textarea
                                value={studentCode}
                                onChange={(e) => setStudentCode(e.target.value)}
                                placeholder="Write your solution here..."
                                className="font-mono text-sm min-h-[300px]"
                            />
                            <Button 
                                onClick={evaluateSubmission}
                                disabled={!studentCode.trim() || isEvaluating}
                                className="w-full"
                            >
                                {isEvaluating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Evaluating...
                                    </>
                                ) : (
                                    "Submit for Feedback"
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </>
            )}

            {feedback && (
                <Card className={`border-0 shadow-lg ${feedback.is_correct ? 'bg-green-50' : 'bg-amber-50'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {feedback.is_correct ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                            )}
                            Feedback - Score: {feedback.score}/100
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {feedback.strengths?.length > 0 && (
                            <div className="p-3 bg-green-100 border border-green-200 rounded">
                                <h4 className="font-semibold text-sm text-green-900 mb-2">✓ What You Did Well:</h4>
                                <ul className="text-xs text-green-800 space-y-1">
                                    {feedback.strengths.map((s, idx) => (
                                        <li key={idx}>• {s}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {feedback.improvements?.length > 0 && (
                            <div className="p-3 bg-amber-100 border border-amber-200 rounded">
                                <h4 className="font-semibold text-sm text-amber-900 mb-2">⚡ Areas for Improvement:</h4>
                                <ul className="text-xs text-amber-800 space-y-1">
                                    {feedback.improvements.map((i, idx) => (
                                        <li key={idx}>• {i}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="p-3 bg-blue-100 border border-blue-200 rounded">
                            <h4 className="font-semibold text-sm text-blue-900 mb-2">💡 Suggestions:</h4>
                            <ul className="text-xs text-blue-800 space-y-1">
                                {feedback.suggestions?.map((s, idx) => (
                                    <li key={idx}>• {s}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-3 bg-slate-100 border border-slate-200 rounded">
                            <h4 className="font-semibold text-sm text-slate-900 mb-1">Code Quality:</h4>
                            <p className="text-xs text-slate-700">{feedback.code_quality}</p>
                        </div>

                        <div className="p-3 bg-violet-100 border border-violet-200 rounded">
                            <h4 className="font-semibold text-sm text-violet-900 mb-2">🎯 Next Steps:</h4>
                            <ul className="text-xs text-violet-800 space-y-1">
                                {feedback.next_steps?.map((step, idx) => (
                                    <li key={idx}>{idx + 1}. {step}</li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}