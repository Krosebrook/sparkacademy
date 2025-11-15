import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, BookOpen, Brain, Globe } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

export default function AIContentGenerator({ onGenerate, type = "outline" }) {
    const [topic, setTopic] = useState("");
    const [context, setContext] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const config = {
        outline: {
            icon: BookOpen,
            title: "Generate Course Outline",
            placeholder: "e.g., Introduction to Machine Learning",
            contextPlaceholder: "Add context: target audience, depth level, specific focus areas...",
            color: "from-violet-500 to-purple-600"
        },
        quiz: {
            icon: Brain,
            title: "Generate Quiz Questions",
            placeholder: "e.g., Basics of Neural Networks",
            contextPlaceholder: "Lesson content or key points to test...",
            color: "from-blue-500 to-indigo-600"
        },
        resources: {
            icon: Globe,
            title: "Find Learning Resources",
            placeholder: "e.g., Deep Learning Fundamentals",
            contextPlaceholder: "Specify resource types: articles, videos, documentation...",
            color: "from-emerald-500 to-teal-600"
        }
    }[type];

    const Icon = config.icon;

    const handleGenerate = async () => {
        if (!topic.trim()) return;

        setIsGenerating(true);
        try {
            let prompt = "";
            let schema = {};

            if (type === "outline") {
                prompt = `Generate a comprehensive course outline for: "${topic}".
                
Context: ${context || "General audience"}

Create 5-8 well-structured lessons. Each lesson should have:
- A clear, engaging title
- Detailed content description (what will be taught)
- Realistic duration in minutes
- Logical order (progressive learning)

Make it educational, engaging, and practical.`;

                schema = {
                    type: "object",
                    properties: {
                        lessons: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    content: { type: "string" },
                                    duration_minutes: { type: "number" },
                                    order: { type: "number" }
                                }
                            }
                        }
                    }
                };
            } else if (type === "quiz") {
                prompt = `Generate quiz questions for this lesson: "${topic}".

Context/Content: ${context || "General knowledge level"}

Create 5 multiple-choice questions that:
- Test understanding of key concepts
- Have 4 options each
- Include one correct answer
- Are clear and unambiguous
- Progress from easier to harder

Return the questions in a structured format.`;

                schema = {
                    type: "object",
                    properties: {
                        questions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    question_text: { type: "string" },
                                    options: {
                                        type: "array",
                                        items: { type: "string" }
                                    },
                                    correct_option_index: { type: "number" }
                                }
                            }
                        }
                    }
                };
            } else if (type === "resources") {
                prompt = `Find and suggest relevant learning resources for: "${topic}".

Context: ${context || "General learning resources"}

Suggest 5-7 high-quality resources including:
- Title of the resource
- Brief description (why it's valuable)
- Type (article, video, documentation, course, book)
- Estimated value/quality indicator

Focus on freely accessible, reputable sources.`;

                schema = {
                    type: "object",
                    properties: {
                        resources: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    type: { type: "string" },
                                    url: { type: "string" }
                                }
                            }
                        }
                    }
                };
            }

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: schema,
                add_context_from_internet: type === "resources"
            });

            onGenerate(result);
            setTopic("");
            setContext("");
        } catch (error) {
            console.error("Generation error:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900">{config.title}</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <Input
                            placeholder={config.placeholder}
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="h-12 text-base border-slate-200 focus:border-slate-400 transition-colors"
                            disabled={isGenerating}
                        />
                    </div>

                    <div>
                        <Textarea
                            placeholder={config.contextPlaceholder}
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            className="min-h-24 text-base border-slate-200 focus:border-slate-400 transition-colors resize-none"
                            disabled={isGenerating}
                        />
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={!topic.trim() || isGenerating}
                        className={`w-full h-12 text-base bg-gradient-to-r ${config.color} hover:opacity-90 transition-all shadow-lg hover:shadow-xl`}
                    >
                        <AnimatePresence mode="wait">
                            {isGenerating ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Generating...
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <Sparkles className="h-5 w-5" />
                                    Generate with AI
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}