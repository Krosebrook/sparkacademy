import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, BookOpen, Lightbulb, FileText, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AIContentGenerators({ onContentGenerated }) {
    const [topic, setTopic] = useState("");
    const [context, setContext] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState("lesson");

    const generateLessonContent = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Create comprehensive lesson content for: ${topic}

Context: ${context}

Generate:
1. Lesson title
2. Learning objectives (3-5)
3. Detailed lesson content (use markdown formatting, include examples, explanations, and practical applications)
4. Key takeaways (3-5 bullet points)
5. Estimated duration in minutes
6. Difficulty level (beginner/intermediate/advanced)`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        learning_objectives: { type: "array", items: { type: "string" } },
                        content: { type: "string" },
                        key_takeaways: { type: "array", items: { type: "string" } },
                        duration_minutes: { type: "number" },
                        difficulty_level: { type: "string" }
                    }
                }
            });

            onContentGenerated({ type: "lesson", data: result });
        } catch (error) {
            console.error("Error generating lesson:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateCaseStudy = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Create a detailed case study for: ${topic}

Context: ${context}

Generate:
1. Case study title
2. Scenario description (realistic, detailed)
3. Key challenges presented
4. Analysis questions (5-7 thought-provoking questions)
5. Learning points
6. Possible solutions or approaches`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        scenario: { type: "string" },
                        challenges: { type: "array", items: { type: "string" } },
                        questions: { type: "array", items: { type: "string" } },
                        learning_points: { type: "array", items: { type: "string" } },
                        solutions: { type: "array", items: { type: "string" } }
                    }
                }
            });

            onContentGenerated({ type: "case_study", data: result });
        } catch (error) {
            console.error("Error generating case study:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateInteractiveActivity = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Create an interactive learning activity for: ${topic}

Context: ${context}

Generate:
1. Activity title
2. Activity type (e.g., role-play, simulation, group discussion)
3. Instructions (step-by-step)
4. Materials needed
5. Time required
6. Expected outcomes
7. Reflection questions`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        activity_type: { type: "string" },
                        instructions: { type: "array", items: { type: "string" } },
                        materials: { type: "array", items: { type: "string" } },
                        time_required: { type: "string" },
                        outcomes: { type: "array", items: { type: "string" } },
                        reflection_questions: { type: "array", items: { type: "string" } }
                    }
                }
            });

            onContentGenerated({ type: "activity", data: result });
        } catch (error) {
            console.error("Error generating activity:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const generateVideoScript = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Create a detailed video script for: ${topic}

Context: ${context}

Generate:
1. Video title
2. Hook (opening 30 seconds)
3. Main content sections with timestamps
4. Visual suggestions for each section
5. Call to action
6. Estimated total duration`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        hook: { type: "string" },
                        sections: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    timestamp: { type: "string" },
                                    content: { type: "string" },
                                    visuals: { type: "string" }
                                }
                            }
                        },
                        call_to_action: { type: "string" },
                        duration: { type: "string" }
                    }
                }
            });

            onContentGenerated({ type: "video_script", data: result });
        } catch (error) {
            console.error("Error generating video script:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const generators = {
        lesson: { fn: generateLessonContent, icon: BookOpen, label: "Lesson Content" },
        case_study: { fn: generateCaseStudy, icon: FileText, label: "Case Study" },
        activity: { fn: generateInteractiveActivity, icon: Lightbulb, label: "Interactive Activity" },
        video: { fn: generateVideoScript, icon: Video, label: "Video Script" }
    };

    const currentGenerator = generators[activeTab];

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-600" />
                    AI Content Generators
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 mb-6">
                        {Object.entries(generators).map(([key, { icon: Icon, label }]) => (
                            <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Topic</label>
                            <Input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Introduction to Machine Learning"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Context (Optional)</label>
                            <Textarea
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                placeholder="Additional context, target audience, specific requirements..."
                                className="min-h-24"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={currentGenerator.fn}
                        disabled={isGenerating || !topic.trim()}
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <currentGenerator.icon className="w-4 h-4 mr-2" />
                                Generate {currentGenerator.label}
                            </>
                        )}
                    </Button>
                </Tabs>
            </CardContent>
        </Card>
    );
}