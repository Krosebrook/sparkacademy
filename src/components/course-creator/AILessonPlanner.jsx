import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, BookOpen, Sparkles, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AILessonPlanner({ onLessonGenerated }) {
    const [topic, setTopic] = useState("");
    const [objectives, setObjectives] = useState("");
    const [targetAudience, setTargetAudience] = useState("");
    const [duration, setDuration] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState(null);

    const generateLessonPlan = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Create a comprehensive lesson plan for:

Topic: ${topic}
Learning Objectives: ${objectives}
Target Audience: ${targetAudience}
Duration: ${duration} minutes

Generate a detailed lesson plan with:
1. Lesson title
2. Learning objectives (3-5 specific, measurable objectives)
3. Prerequisites (what students should know)
4. Lesson structure with timeline:
   - Introduction/Hook (engaging opening)
   - Main content sections (with key concepts for each)
   - Practice activities
   - Summary/Conclusion
5. Detailed content outline (markdown format, include explanations, examples, analogies)
6. Assessment methods
7. Differentiation strategies (for different learning levels)
8. Common misconceptions to address`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        learning_objectives: { type: "array", items: { type: "string" } },
                        prerequisites: { type: "array", items: { type: "string" } },
                        lesson_structure: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    section: { type: "string" },
                                    time_minutes: { type: "number" },
                                    key_points: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        content_outline: { type: "string" },
                        assessment_methods: { type: "array", items: { type: "string" } },
                        differentiation: { type: "array", items: { type: "string" } },
                        misconceptions: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setGeneratedPlan(result);
        } catch (error) {
            console.error("Error generating lesson plan:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const acceptPlan = () => {
        onLessonGenerated(generatedPlan);
        setGeneratedPlan(null);
        setTopic("");
        setObjectives("");
        setTargetAudience("");
        setDuration("");
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-violet-600" />
                    AI Lesson Planner
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!generatedPlan ? (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Lesson Topic</label>
                            <Input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Introduction to Photosynthesis"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Learning Objectives</label>
                            <Textarea
                                value={objectives}
                                onChange={(e) => setObjectives(e.target.value)}
                                placeholder="What should students learn? (e.g., Understand the process of photosynthesis, Identify key components...)"
                                className="min-h-20"
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Target Audience</label>
                                <Input
                                    value={targetAudience}
                                    onChange={(e) => setTargetAudience(e.target.value)}
                                    placeholder="e.g., High school students, Beginners"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Duration (minutes)</label>
                                <Input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="e.g., 45"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={generateLessonPlan}
                            disabled={isGenerating || !topic || !objectives}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating Lesson Plan...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate Lesson Plan
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{generatedPlan.title}</h3>
                            
                            <div className="mb-4">
                                <h4 className="font-semibold text-slate-900 mb-2">Learning Objectives</h4>
                                <ul className="space-y-1">
                                    {generatedPlan.learning_objectives?.map((obj, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            {obj}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mb-4">
                                <h4 className="font-semibold text-slate-900 mb-2">Prerequisites</h4>
                                <div className="flex flex-wrap gap-2">
                                    {generatedPlan.prerequisites?.map((prereq, idx) => (
                                        <Badge key={idx} variant="secondary">{prereq}</Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <h4 className="font-semibold text-slate-900 mb-2">Lesson Structure</h4>
                                <div className="space-y-2">
                                    {generatedPlan.lesson_structure?.map((section, idx) => (
                                        <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-slate-900">{section.section}</span>
                                                <Badge variant="outline">{section.time_minutes} min</Badge>
                                            </div>
                                            <ul className="space-y-1">
                                                {section.key_points?.map((point, pidx) => (
                                                    <li key={pidx} className="text-xs text-slate-600">• {point}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <h4 className="font-semibold text-slate-900 mb-2">Content Outline</h4>
                                <div className="p-4 bg-slate-50 rounded-lg max-h-64 overflow-y-auto">
                                    <pre className="text-sm text-slate-700 whitespace-pre-wrap">{generatedPlan.content_outline}</pre>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-2">Assessment Methods</h4>
                                    <ul className="space-y-1">
                                        {generatedPlan.assessment_methods?.map((method, idx) => (
                                            <li key={idx} className="text-sm text-slate-700">• {method}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-2">Differentiation</h4>
                                    <ul className="space-y-1">
                                        {generatedPlan.differentiation?.map((diff, idx) => (
                                            <li key={idx} className="text-sm text-slate-700">• {diff}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {generatedPlan.misconceptions?.length > 0 && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <h4 className="font-semibold text-amber-900 mb-2">Common Misconceptions</h4>
                                    <ul className="space-y-1">
                                        {generatedPlan.misconceptions.map((misc, idx) => (
                                            <li key={idx} className="text-sm text-slate-700">• {misc}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={() => setGeneratedPlan(null)} variant="outline" className="flex-1">
                                Regenerate
                            </Button>
                            <Button onClick={acceptPlan} className="flex-1 bg-violet-600 hover:bg-violet-700">
                                Use This Plan
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}