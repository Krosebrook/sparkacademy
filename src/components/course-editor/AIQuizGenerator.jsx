import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Plus, Trash2 } from "lucide-react";

export default function AIQuizGenerator({ lessonContent, onQuizGenerated }) {
    const [numQuestions, setNumQuestions] = useState(5);
    const [difficulty, setDifficulty] = useState("medium");
    const [quizType, setQuizType] = useState("mixed");
    const [generatedQuiz, setGeneratedQuiz] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateQuiz = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Generate a comprehensive quiz based on the following lesson content:

LESSON CONTENT:
${lessonContent.substring(0, 3000)}

Generate ${numQuestions} questions with these requirements:
- Difficulty: ${difficulty}
- Question types: ${quizType === "mixed" ? "Mix of multiple choice, true/false, and short answer" : quizType}
- Each question should test understanding of key concepts
- Provide 4 options for multiple choice questions
- Include clear, accurate answers
- Add brief explanations for each answer

Make questions thought-provoking and practical.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        passing_score: { type: "number" },
                        questions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    question_text: { type: "string" },
                                    type: { type: "string", enum: ["multiple_choice", "true_false", "short_answer"] },
                                    options: { type: "array", items: { type: "string" } },
                                    correct_option_index: { type: "number" },
                                    explanation: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            setGeneratedQuiz(result);
        } catch (error) {
            console.error("Error generating quiz:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApply = () => {
        if (generatedQuiz) {
            onQuizGenerated(generatedQuiz);
            setGeneratedQuiz(null);
        }
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-600" />
                    AI Quiz Generator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-semibold mb-2 block">Questions</label>
                        <Input
                            type="number"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                            min={3}
                            max={20}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold mb-2 block">Difficulty</label>
                        <Select value={difficulty} onValueChange={setDifficulty}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-semibold mb-2 block">Type</label>
                        <Select value={quizType} onValueChange={setQuizType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mixed">Mixed</SelectItem>
                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                <SelectItem value="true_false">True/False</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button 
                    onClick={generateQuiz}
                    disabled={isGenerating}
                    className="w-full"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating Quiz...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Quiz
                        </>
                    )}
                </Button>

                {generatedQuiz && (
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-lg">{generatedQuiz.title}</h4>
                            <Badge>Passing: {generatedQuiz.passing_score}%</Badge>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {generatedQuiz.questions?.map((q, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 border rounded-lg">
                                    <p className="font-semibold text-sm mb-2">
                                        {idx + 1}. {q.question_text}
                                    </p>
                                    <div className="space-y-1 ml-4">
                                        {q.options?.map((opt, oidx) => (
                                            <p key={oidx} className={`text-xs ${oidx === q.correct_option_index ? 'text-green-700 font-semibold' : 'text-slate-600'}`}>
                                                {oidx === q.correct_option_index && '✓ '}{opt}
                                            </p>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 italic">{q.explanation}</p>
                                </div>
                            ))}
                        </div>

                        <Button onClick={handleApply} className="w-full">
                            Apply Quiz to Lesson
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}