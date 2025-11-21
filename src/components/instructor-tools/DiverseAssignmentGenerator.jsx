import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileEdit, Code, BookOpen, Briefcase } from "lucide-react";

export default function DiverseAssignmentGenerator({ courseTopic }) {
    const [topic, setTopic] = useState(courseTopic || "");
    const [assignmentType, setAssignmentType] = useState("essay");
    const [difficulty, setDifficulty] = useState("medium");
    const [assignment, setAssignment] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const assignmentTypes = {
        essay: { icon: FileEdit, label: "Essay/Written", color: "blue" },
        coding: { icon: Code, label: "Coding Challenge", color: "green" },
        case_study: { icon: Briefcase, label: "Case Study", color: "purple" },
        research: { icon: BookOpen, label: "Research Project", color: "orange" }
    };

    const generateAssignment = async () => {
        setIsGenerating(true);
        try {
            const prompts = {
                essay: `Create a comprehensive essay assignment on: ${topic}
                
Difficulty: ${difficulty}

Generate:
1. Assignment title
2. Clear prompt/question
3. Required word count
4. Key points to address (5-7)
5. Grading rubric with criteria and point distribution
6. Resources students should reference
7. Common mistakes to avoid
8. Tips for excellence`,

                coding: `Create a coding challenge on: ${topic}
                
Difficulty: ${difficulty}

Generate:
1. Challenge title and description
2. Problem statement
3. Input/output specifications
4. Starter code template
5. Test cases (3-5)
6. Constraints and requirements
7. Evaluation criteria
8. Hints for students
9. Time/space complexity expectations`,

                case_study: `Create a case study assignment on: ${topic}
                
Difficulty: ${difficulty}

Generate:
1. Case study title
2. Background scenario (realistic and detailed)
3. Key stakeholders and their perspectives
4. Problems/challenges to analyze
5. Questions students must answer (4-6)
6. Required deliverables
7. Analysis framework to use
8. Evaluation criteria`,

                research: `Create a research project on: ${topic}
                
Difficulty: ${difficulty}

Generate:
1. Project title
2. Research question/hypothesis
3. Required sections (abstract, intro, methodology, etc.)
4. Minimum sources required
5. Data collection methods
6. Analysis requirements
7. Presentation format
8. Grading rubric
9. Timeline/milestones`
            };

            const result = await base44.integrations.Core.InvokeLLM({
                prompt: prompts[assignmentType],
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        instructions: { type: "array", items: { type: "string" } },
                        requirements: { type: "array", items: { type: "string" } },
                        grading_rubric: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    criterion: { type: "string" },
                                    points: { type: "number" },
                                    description: { type: "string" }
                                }
                            }
                        },
                        resources: { type: "array", items: { type: "string" } },
                        tips: { type: "array", items: { type: "string" } },
                        estimated_time: { type: "string" },
                        deliverables: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setAssignment(result);
        } catch (error) {
            console.error("Error generating assignment:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const TypeIcon = assignmentTypes[assignmentType].icon;

    return (
        <div className="space-y-4">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TypeIcon className={`h-5 w-5 text-${assignmentTypes[assignmentType].color}-600`} />
                        Assignment Generator
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Assignment topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold mb-2 block">Assignment Type</label>
                            <Select value={assignmentType} onValueChange={setAssignmentType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(assignmentTypes).map(([key, { label }]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                    </div>
                    <Button 
                        onClick={generateAssignment}
                        disabled={!topic || isGenerating}
                        className="w-full"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating Assignment...
                            </>
                        ) : (
                            "Generate Assignment"
                        )}
                    </Button>
                </CardContent>
            </Card>

            {assignment && (
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{assignment.title}</CardTitle>
                            <Badge>{assignmentTypes[assignmentType].label}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-slate-700">{assignment.description}</p>

                        <div>
                            <h4 className="font-semibold mb-2">Instructions:</h4>
                            <ol className="list-decimal list-inside space-y-1">
                                {assignment.instructions?.map((inst, idx) => (
                                    <li key={idx} className="text-sm text-slate-700">{inst}</li>
                                ))}
                            </ol>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Requirements:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {assignment.requirements?.map((req, idx) => (
                                    <li key={idx} className="text-sm text-slate-700">{req}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Grading Rubric:</h4>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="text-left p-3 text-sm font-semibold">Criterion</th>
                                            <th className="text-left p-3 text-sm font-semibold">Points</th>
                                            <th className="text-left p-3 text-sm font-semibold">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignment.grading_rubric?.map((item, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="p-3 text-sm font-medium">{item.criterion}</td>
                                                <td className="p-3 text-sm">{item.points}</td>
                                                <td className="p-3 text-sm text-slate-600">{item.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {assignment.deliverables?.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Deliverables:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {assignment.deliverables.map((del, idx) => (
                                        <li key={idx} className="text-sm text-slate-700">{del}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {assignment.resources?.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Recommended Resources:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {assignment.resources.map((res, idx) => (
                                        <li key={idx} className="text-sm text-slate-700">{res}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-2">Tips for Success:</h4>
                            <ul className="space-y-1">
                                {assignment.tips?.map((tip, idx) => (
                                    <li key={idx} className="text-sm text-green-800">• {tip}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>Estimated Time: {assignment.estimated_time}</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}