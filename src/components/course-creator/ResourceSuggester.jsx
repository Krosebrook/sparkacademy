import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Link2, Sparkles, ExternalLink, BookOpen, Video, FileText, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ResourceSuggester({ onResourcesGenerated }) {
    const [lessonTopic, setLessonTopic] = useState("");
    const [lessonContext, setLessonContext] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [resources, setResources] = useState(null);

    const generateResources = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Suggest comprehensive supplementary resources for:

Lesson Topic: ${lessonTopic}
Context: ${lessonContext}

Generate diverse, high-quality resources including:
1. Video tutorials (YouTube, educational platforms)
2. Articles and blog posts (reputable sources)
3. Interactive tools and simulators
4. Practice exercises and worksheets
5. Books and documentation
6. Code repositories (if applicable)
7. Community forums and discussion groups

For each resource provide:
- Title
- Type (video, article, tool, etc.)
- Description (why it's valuable)
- Difficulty level
- Estimated time to complete
- URL (suggest realistic resource names, but note that URLs are examples)`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        resources: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    type: { 
                                        type: "string",
                                        enum: ["video", "article", "tool", "exercise", "book", "code", "forum"]
                                    },
                                    description: { type: "string" },
                                    url: { type: "string" },
                                    difficulty: { 
                                        type: "string",
                                        enum: ["beginner", "intermediate", "advanced"]
                                    },
                                    estimated_time: { type: "string" }
                                }
                            }
                        },
                        recommended_learning_path: { type: "string" }
                    }
                }
            });

            setResources(result);
        } catch (error) {
            console.error("Error generating resources:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const acceptResources = () => {
        onResourcesGenerated(resources);
        setResources(null);
        setLessonTopic("");
        setLessonContext("");
    };

    const getTypeIcon = (type) => {
        const icons = {
            video: Video,
            article: FileText,
            tool: Link2,
            exercise: BookOpen,
            book: BookOpen,
            code: Code,
            forum: ExternalLink
        };
        return icons[type] || Link2;
    };

    const getTypeColor = (type) => {
        const colors = {
            video: "bg-red-100 text-red-800",
            article: "bg-blue-100 text-blue-800",
            tool: "bg-purple-100 text-purple-800",
            exercise: "bg-green-100 text-green-800",
            book: "bg-amber-100 text-amber-800",
            code: "bg-slate-100 text-slate-800",
            forum: "bg-pink-100 text-pink-800"
        };
        return colors[type] || "bg-slate-100 text-slate-800";
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            beginner: "bg-green-100 text-green-800",
            intermediate: "bg-amber-100 text-amber-800",
            advanced: "bg-red-100 text-red-800"
        };
        return colors[difficulty] || "bg-slate-100 text-slate-800";
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-violet-600" />
                    Resource Suggester
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!resources ? (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Lesson Topic</label>
                            <Input
                                value={lessonTopic}
                                onChange={(e) => setLessonTopic(e.target.value)}
                                placeholder="e.g., Introduction to Machine Learning"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Lesson Context</label>
                            <Textarea
                                value={lessonContext}
                                onChange={(e) => setLessonContext(e.target.value)}
                                placeholder="What are the key concepts? What level is this? Any specific areas to focus on?"
                                className="min-h-20"
                            />
                        </div>
                        <Button
                            onClick={generateResources}
                            disabled={isGenerating || !lessonTopic}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Finding Resources...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Suggest Resources
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
                            <h4 className="font-semibold text-violet-900 mb-2">Recommended Learning Path</h4>
                            <p className="text-sm text-slate-700">{resources.recommended_learning_path}</p>
                        </div>

                        <div className="space-y-3">
                            {resources.resources?.map((resource, idx) => {
                                const Icon = getTypeIcon(resource.type);
                                return (
                                    <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:border-violet-300 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className={`h-10 w-10 rounded-lg ${getTypeColor(resource.type).replace('text-', 'bg-').replace('100', '200')} flex items-center justify-center flex-shrink-0`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="font-semibold text-slate-900">{resource.title}</h4>
                                                    <div className="flex gap-2 ml-2">
                                                        <Badge className={getTypeColor(resource.type)}>
                                                            {resource.type}
                                                        </Badge>
                                                        <Badge className={getDifficultyColor(resource.difficulty)}>
                                                            {resource.difficulty}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-2">{resource.description}</p>
                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <span>⏱️ {resource.estimated_time}</span>
                                                    {resource.url && (
                                                        <a 
                                                            href={resource.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-violet-600 hover:underline"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            View Resource
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={() => setResources(null)} variant="outline" className="flex-1">
                                Regenerate
                            </Button>
                            <Button onClick={acceptResources} className="flex-1 bg-violet-600 hover:bg-violet-700">
                                Add Resources
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}