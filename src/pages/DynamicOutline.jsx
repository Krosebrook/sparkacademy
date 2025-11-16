import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, BookOpen, Clock, Target } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function DynamicOutline() {
    const location = useLocation();
    const courseId = new URLSearchParams(location.search).get('id');
    
    const [course, setCourse] = useState(null);
    const [customOutline, setCustomOutline] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [learningPace, setLearningPace] = useState([3]); // 1-5 scale
    const [priorKnowledge, setPriorKnowledge] = useState([2]); // 1-5 scale
    const [selectedTopics, setSelectedTopics] = useState([]);

    useEffect(() => {
        if (courseId) loadCourse();
    }, [courseId]);

    const loadCourse = async () => {
        const courseData = await base44.entities.Course.get(courseId);
        setCourse(courseData);
        setSelectedTopics(courseData.lessons?.map((_, idx) => idx) || []);
    };

    const generateCustomOutline = async () => {
        setIsGenerating(true);
        try {
            const paceLabels = ["Very Slow", "Slow", "Moderate", "Fast", "Very Fast"];
            const knowledgeLabels = ["Beginner", "Some Knowledge", "Intermediate", "Advanced", "Expert"];

            const prompt = `Create a personalized learning outline for this course:

Course: ${course.title}
Original Lessons: ${course.lessons?.map(l => l.title).join(", ")}

Student Profile:
- Learning Pace: ${paceLabels[learningPace[0] - 1]}
- Prior Knowledge: ${knowledgeLabels[priorKnowledge[0] - 1]}
- Focus Areas: ${selectedTopics.map(idx => course.lessons[idx].title).join(", ")}

Generate a customized outline that:
1. Adjusts lesson depth based on prior knowledge
2. Suggests optimal lesson order
3. Estimates realistic time per lesson based on pace
4. Identifies lessons that can be skipped or reviewed quickly
5. Adds supplementary topics if needed

Return a structured outline with recommendations.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        outline: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    lesson_title: { type: "string" },
                                    recommended_order: { type: "number" },
                                    estimated_hours: { type: "number" },
                                    depth_level: { type: "string" },
                                    can_skip: { type: "boolean" },
                                    focus_areas: { type: "array", items: { type: "string" } },
                                    supplementary_resources: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        total_estimated_hours: { type: "number" },
                        learning_path_summary: { type: "string" }
                    }
                }
            });

            setCustomOutline(result);
        } catch (error) {
            console.error("Error generating outline:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleTopic = (index) => {
        setSelectedTopics(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Personalized Learning Outline</h1>
                    <p className="text-slate-600">Customize your learning path for {course.title}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-violet-600" />
                                Learning Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                    Learning Pace: {["Very Slow", "Slow", "Moderate", "Fast", "Very Fast"][learningPace[0] - 1]}
                                </label>
                                <Slider
                                    value={learningPace}
                                    onValueChange={setLearningPace}
                                    min={1}
                                    max={5}
                                    step={1}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                    Prior Knowledge: {["Beginner", "Some Knowledge", "Intermediate", "Advanced", "Expert"][priorKnowledge[0] - 1]}
                                </label>
                                <Slider
                                    value={priorKnowledge}
                                    onValueChange={setPriorKnowledge}
                                    min={1}
                                    max={5}
                                    step={1}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-3 block">
                                    Focus Topics
                                </label>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {course.lessons?.map((lesson, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <Checkbox
                                                checked={selectedTopics.includes(idx)}
                                                onCheckedChange={() => toggleTopic(idx)}
                                            />
                                            <span className="text-sm text-slate-700">{lesson.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={generateCustomOutline}
                                disabled={isGenerating}
                                className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate Custom Outline
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-violet-600" />
                                Your Personalized Path
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!customOutline ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                    <p>Configure your preferences and generate your custom outline</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-violet-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-4 w-4 text-violet-600" />
                                            <span className="font-semibold text-slate-900">
                                                Estimated Time: {customOutline.total_estimated_hours}h
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600">{customOutline.learning_path_summary}</p>
                                    </div>

                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {customOutline.outline?.map((item, idx) => (
                                            <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-white">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-bold text-violet-600">
                                                                #{item.recommended_order}
                                                            </span>
                                                            <h4 className="font-semibold text-slate-900">{item.lesson_title}</h4>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                                            <Clock className="h-3 w-3" />
                                                            {item.estimated_hours}h
                                                        </div>
                                                    </div>
                                                    <Badge variant={item.can_skip ? "outline" : "default"}>
                                                        {item.depth_level}
                                                    </Badge>
                                                </div>
                                                
                                                {item.can_skip && (
                                                    <p className="text-xs text-amber-600 mb-2">Optional - Can be skipped</p>
                                                )}
                                                
                                                {item.focus_areas?.length > 0 && (
                                                    <div className="mb-2">
                                                        <p className="text-xs font-semibold text-slate-700 mb-1">Focus:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {item.focus_areas.map((area, i) => (
                                                                <Badge key={i} variant="secondary" className="text-xs">
                                                                    {area}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {item.supplementary_resources?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-700 mb-1">Resources:</p>
                                                        <ul className="text-xs text-slate-600 space-y-1">
                                                            {item.supplementary_resources.map((resource, i) => (
                                                                <li key={i}>• {resource}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}