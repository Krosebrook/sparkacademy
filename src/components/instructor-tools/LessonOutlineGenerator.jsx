import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Copy } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function LessonOutlineGenerator({ onOutlineGenerated }) {
    const [topic, setTopic] = useState("");
    const [duration, setDuration] = useState("30");
    const [level, setLevel] = useState("intermediate");
    const [learningObjectives, setLearningObjectives] = useState("");
    const [outline, setOutline] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateOutline = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Create a detailed lesson outline for instructors:

TOPIC: ${topic}
DURATION: ${duration} minutes
LEVEL: ${level}
LEARNING OBJECTIVES: ${learningObjectives}

Generate a comprehensive lesson outline with:
1. Lesson title and description
2. Learning objectives (3-5 specific, measurable outcomes)
3. Prerequisites (if any)
4. Detailed content structure with timing:
   - Introduction/Hook (how to engage students)
   - Main content sections (key concepts, examples)
   - Activities/Exercises (hands-on learning)
   - Assessment/Check for understanding
   - Conclusion/Summary
5. Teaching notes and tips
6. Suggested resources
7. Common student challenges and how to address them
8. Extension activities for advanced students

Make it practical and instructor-friendly.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        learning_objectives: { type: "array", items: { type: "string" } },
                        prerequisites: { type: "array", items: { type: "string" } },
                        content_sections: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    duration_minutes: { type: "number" },
                                    content: { type: "string" },
                                    teaching_tips: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        teaching_notes: { type: "array", items: { type: "string" } },
                        resources: { type: "array", items: { type: "string" } },
                        common_challenges: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    challenge: { type: "string" },
                                    solution: { type: "string" }
                                }
                            }
                        },
                        extension_activities: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setOutline(result);
        } catch (error) {
            console.error("Error generating outline:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        const text = JSON.stringify(outline, null, 2);
        navigator.clipboard.writeText(text);
        alert("Outline copied to clipboard!");
    };

    return (
        <div className="space-y-4">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Lesson Outline Generator
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Lesson topic (e.g., Introduction to Machine Learning)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold mb-2 block">Duration (minutes)</label>
                            <Select value={duration} onValueChange={setDuration}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 min</SelectItem>
                                    <SelectItem value="30">30 min</SelectItem>
                                    <SelectItem value="45">45 min</SelectItem>
                                    <SelectItem value="60">60 min</SelectItem>
                                    <SelectItem value="90">90 min</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold mb-2 block">Level</label>
                            <Select value={level} onValueChange={setLevel}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Textarea
                        placeholder="Learning objectives (optional - what should students be able to do after this lesson?)"
                        value={learningObjectives}
                        onChange={(e) => setLearningObjectives(e.target.value)}
                        rows={3}
                    />
                    <Button 
                        onClick={generateOutline}
                        disabled={!topic || isGenerating}
                        className="w-full"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating Outline...
                            </>
                        ) : (
                            "Generate Lesson Outline"
                        )}
                    </Button>
                </CardContent>
            </Card>

            {outline && (
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{outline.title}</CardTitle>
                        <Button variant="outline" size="sm" onClick={copyToClipboard}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-slate-700">{outline.description}</p>

                        <div>
                            <h4 className="font-semibold mb-2">Learning Objectives:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {outline.learning_objectives?.map((obj, idx) => (
                                    <li key={idx} className="text-sm text-slate-700">{obj}</li>
                                ))}
                            </ul>
                        </div>

                        {outline.prerequisites?.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Prerequisites:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {outline.prerequisites.map((pre, idx) => (
                                        <li key={idx} className="text-sm text-slate-700">{pre}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div>
                            <h4 className="font-semibold mb-3">Content Structure:</h4>
                            <div className="space-y-4">
                                {outline.content_sections?.map((section, idx) => (
                                    <div key={idx} className="p-4 border rounded-lg bg-slate-50">
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-semibold">{section.title}</h5>
                                            <span className="text-sm text-slate-600">{section.duration_minutes} min</span>
                                        </div>
                                        <p className="text-sm text-slate-700 mb-2">{section.content}</p>
                                        {section.teaching_tips?.length > 0 && (
                                            <div className="mt-2 p-2 bg-blue-50 rounded">
                                                <p className="text-xs font-semibold text-blue-900 mb-1">💡 Teaching Tips:</p>
                                                <ul className="text-xs text-blue-800 space-y-0.5">
                                                    {section.teaching_tips.map((tip, tidx) => (
                                                        <li key={tidx}>• {tip}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {outline.common_challenges?.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Common Student Challenges:</h4>
                                <div className="space-y-2">
                                    {outline.common_challenges.map((item, idx) => (
                                        <div key={idx} className="p-3 border border-amber-200 rounded-lg bg-amber-50">
                                            <p className="text-sm font-semibold text-amber-900">{item.challenge}</p>
                                            <p className="text-sm text-amber-800 mt-1">→ {item.solution}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {outline.extension_activities?.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Extension Activities:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {outline.extension_activities.map((activity, idx) => (
                                        <li key={idx} className="text-sm text-slate-700">{activity}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {onOutlineGenerated && (
                            <Button onClick={() => onOutlineGenerated(outline)} className="w-full">
                                Use This Outline
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}