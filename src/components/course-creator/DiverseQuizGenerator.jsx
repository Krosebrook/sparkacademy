import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, HelpCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DiverseQuizGenerator({ onQuizGenerated }) {
    const [lessonTopic, setLessonTopic] = useState("");
    const [keyPoints, setKeyPoints] = useState("");
    const [questionCount, setQuestionCount] = useState("5");
    const [questionTypes, setQuestionTypes] = useState(["multiple_choice", "fill_blank", "scenario"]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedQuiz, setGeneratedQuiz] = useState(null);

    const generateQuiz = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Create a diverse, engaging quiz for:

Lesson Topic: ${lessonTopic}
Key Concepts: ${keyPoints}
Number of Questions: ${questionCount}
Question Types to Include: ${questionTypes.join(", ")}

Generate ${questionCount} questions with variety:
- Multiple Choice: Traditional MCQ with 4 options
- Fill in the Blank: Complete the sentence questions
- Scenario-Based: Real-world application questions with multiple parts
- True/False: Statement verification
- Short Answer: Brief explanation questions

For each question provide:
1. Question type
2. Question text
3. Options (for MCQ)
4. Correct answer(s)
5. Explanation of why the answer is correct
6. Difficulty level (easy/medium/hard)

Mix difficulty levels and ensure questions test different cognitive levels (recall, understanding, application, analysis).`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        quiz_title: { type: "string" },
                        passing_score: { type: "number" },
                        questions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { 
                                        type: "string",
                                        enum: ["multiple_choice", "fill_blank", "scenario", "true_false", "short_answer"]
                                    },
                                    question_text: { type: "string" },
                                    options: { 
                                        type: "array", 
                                        items: { type: "string" }
                                    },
                                    correct_answer: { type: "string" },
                                    explanation: { type: "string" },
                                    difficulty: { 
                                        type: "string",
                                        enum: ["easy", "medium", "hard"]
                                    },
                                    points: { type: "number" }
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

    const acceptQuiz = () => {
        onQuizGenerated(generatedQuiz);
        setGeneratedQuiz(null);
        setLessonTopic("");
        setKeyPoints("");
    };

    const toggleQuestionType = (type) => {
        setQuestionTypes(prev => 
            prev.includes(type) 
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const getTypeColor = (type) => {
        const colors = {
            multiple_choice: "bg-blue-100 text-blue-800",
            fill_blank: "bg-green-100 text-green-800",
            scenario: "bg-purple-100 text-purple-800",
            true_false: "bg-amber-100 text-amber-800",
            short_answer: "bg-pink-100 text-pink-800"
        };
        return colors[type] || "bg-slate-100 text-slate-800";
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            easy: "bg-green-100 text-green-800",
            medium: "bg-amber-100 text-amber-800",
            hard: "bg-red-100 text-red-800"
        };
        return colors[difficulty] || "bg-slate-100 text-slate-800";
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-violet-600" />
                    Diverse Quiz Generator
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!generatedQuiz ? (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Lesson Topic</label>
                            <Input
                                value={lessonTopic}
                                onChange={(e) => setLessonTopic(e.target.value)}
                                placeholder="e.g., Variables in Python"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Key Concepts to Test</label>
                            <Textarea
                                value={keyPoints}
                                onChange={(e) => setKeyPoints(e.target.value)}
                                placeholder="List the main concepts students should be tested on..."
                                className="min-h-20"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Number of Questions</label>
                            <Select value={questionCount} onValueChange={setQuestionCount}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="3">3 Questions</SelectItem>
                                    <SelectItem value="5">5 Questions</SelectItem>
                                    <SelectItem value="7">7 Questions</SelectItem>
                                    <SelectItem value="10">10 Questions</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Question Types</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { value: "multiple_choice", label: "Multiple Choice" },
                                    { value: "fill_blank", label: "Fill in Blank" },
                                    { value: "scenario", label: "Scenario-Based" },
                                    { value: "true_false", label: "True/False" },
                                    { value: "short_answer", label: "Short Answer" }
                                ].map(type => (
                                    <Badge
                                        key={type.value}
                                        className={`cursor-pointer ${
                                            questionTypes.includes(type.value)
                                                ? "bg-violet-600 text-white"
                                                : "bg-slate-200 text-slate-600"
                                        }`}
                                        onClick={() => toggleQuestionType(type.value)}
                                    >
                                        {type.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <Button
                            onClick={generateQuiz}
                            disabled={isGenerating || !lessonTopic || questionTypes.length === 0}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating Quiz...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate Quiz
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{generatedQuiz.quiz_title}</h3>
                            <Badge variant="secondary">Passing Score: {generatedQuiz.passing_score}%</Badge>
                        </div>

                        <div className="space-y-4">
                            {generatedQuiz.questions?.map((question, idx) => (
                                <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="font-semibold text-slate-900">Question {idx + 1}</span>
                                        <div className="flex gap-2">
                                            <Badge className={getTypeColor(question.type)}>
                                                {question.type.replace('_', ' ')}
                                            </Badge>
                                            <Badge className={getDifficultyColor(question.difficulty)}>
                                                {question.difficulty}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <p className="text-slate-800 mb-3">{question.question_text}</p>
                                    
                                    {question.options && question.options.length > 0 && (
                                        <div className="space-y-2 mb-3">
                                            {question.options.map((option, oidx) => (
                                                <div 
                                                    key={oidx}
                                                    className={`p-2 rounded ${
                                                        option === question.correct_answer
                                                            ? "bg-green-50 border border-green-300"
                                                            : "bg-slate-50"
                                                    }`}
                                                >
                                                    <span className="text-sm text-slate-700">{option}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                        <p className="text-sm font-semibold text-blue-900 mb-1">Correct Answer:</p>
                                        <p className="text-sm text-slate-700 mb-2">{question.correct_answer}</p>
                                        <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                                        <p className="text-sm text-slate-700">{question.explanation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={() => setGeneratedQuiz(null)} variant="outline" className="flex-1">
                                Regenerate
                            </Button>
                            <Button onClick={acceptQuiz} className="flex-1 bg-violet-600 hover:bg-violet-700">
                                Add to Course
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}