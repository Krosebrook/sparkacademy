import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";

export default function AIAssignmentGenerator({ lessonContent, lessonTitle, onAssignmentGenerated }) {
    const [difficulty, setDifficulty] = useState("medium");
    const [projectType, setProjectType] = useState("practical");
    const [generatedAssignment, setGeneratedAssignment] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateAssignment = async () => {
        setIsGenerating(true);
        try {
            const prompt = `Create a comprehensive project assignment based on this lesson:

LESSON: ${lessonTitle}
CONTENT: ${lessonContent.substring(0, 2500)}

Generate a ${difficulty} difficulty ${projectType} project that:
- Tests understanding of key concepts
- Includes practical application
- Has clear, measurable requirements
- Provides guidance without giving away the solution
- Takes 2-8 hours to complete

Include:
1. Project title
2. Clear description and objectives
3. Detailed requirements (5-8 items)
4. Evaluation criteria
5. Estimated completion time
6. Helpful hints`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        objectives: { type: "array", items: { type: "string" } },
                        requirements: { type: "array", items: { type: "string" } },
                        evaluation_criteria: { type: "array", items: { type: "string" } },
                        estimated_time: { type: "string" },
                        difficulty: { type: "string" },
                        hints: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setGeneratedAssignment(result);
        } catch (error) {
            console.error("Error generating assignment:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApply = () => {
        if (generatedAssignment) {
            onAssignmentGenerated(generatedAssignment);
            setGeneratedAssignment(null);
        }
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    AI Assignment Generator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                        <label className="text-sm font-semibold mb-2 block">Project Type</label>
                        <Select value={projectType} onValueChange={setProjectType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="practical">Practical Build</SelectItem>
                                <SelectItem value="research">Research Project</SelectItem>
                                <SelectItem value="analysis">Case Analysis</SelectItem>
                                <SelectItem value="creative">Creative Work</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button 
                    onClick={generateAssignment}
                    disabled={isGenerating}
                    className="w-full"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating Assignment...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Assignment
                        </>
                    )}
                </Button>

                {generatedAssignment && (
                    <div className="space-y-4 pt-4 border-t max-h-[500px] overflow-y-auto">
                        <div>
                            <h4 className="font-bold text-lg mb-1">{generatedAssignment.title}</h4>
                            <Badge>{generatedAssignment.difficulty}</Badge>
                            <p className="text-sm text-slate-700 mt-2">{generatedAssignment.description}</p>
                        </div>

                        <div>
                            <h5 className="font-semibold text-sm mb-2">Learning Objectives:</h5>
                            <ul className="space-y-1">
                                {generatedAssignment.objectives?.map((obj, idx) => (
                                    <li key={idx} className="text-sm text-slate-700">• {obj}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-semibold text-sm mb-2">Requirements:</h5>
                            <ul className="space-y-1">
                                {generatedAssignment.requirements?.map((req, idx) => (
                                    <li key={idx} className="text-sm text-slate-700">{idx + 1}. {req}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-semibold text-sm mb-2">Evaluation Criteria:</h5>
                            <ul className="space-y-1">
                                {generatedAssignment.evaluation_criteria?.map((crit, idx) => (
                                    <li key={idx} className="text-sm text-slate-700">✓ {crit}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-xs text-slate-600">⏱️ Estimated time: {generatedAssignment.estimated_time}</p>
                        </div>

                        <Button onClick={handleApply} className="w-full">
                            Apply Assignment to Lesson
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}