import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Lightbulb, CheckCircle } from "lucide-react";

export default function ActionableRecommendations({ instructorEmail }) {
    const [recommendations, setRecommendations] = useState(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [completedActions, setCompletedActions] = useState([]);

    useEffect(() => {
        generateRecommendations();
    }, [instructorEmail]);

    const generateRecommendations = async () => {
        setIsGenerating(true);
        try {
            const courses = await base44.entities.Course.filter({ created_by: instructorEmail });
            const courseIds = courses.map(c => c.id);
            
            const [enrollments, discussions, feedback] = await Promise.all([
                Promise.all(courseIds.map(id => base44.entities.Enrollment.filter({ course_id: id }))),
                Promise.all(courseIds.map(id => base44.entities.CourseDiscussion.filter({ course_id: id }))),
                Promise.all(courseIds.map(id => base44.entities.CourseFeedback.filter({ course_id: id })))
            ]);

            const flatEnrollments = enrollments.flat();
            const flatDiscussions = discussions.flat();
            const flatFeedback = feedback.flat();

            const prompt = `Based on this teaching data, provide specific actionable recommendations:

COURSES: ${courses.length}
STUDENTS: ${flatEnrollments.length}
AVG COMPLETION: ${flatEnrollments.reduce((s, e) => s + (e.completion_percentage || 0), 0) / (flatEnrollments.length || 1)}%
DISCUSSIONS: ${flatDiscussions.length}
FEEDBACK: ${flatFeedback.length}

STUDENT ENGAGEMENT PATTERNS:
${flatEnrollments.slice(0, 30).map(e => `
Progress: ${e.completion_percentage}%, Streak: ${e.current_streak_days || 0}d
`).join('')}

FEEDBACK SAMPLES:
${flatFeedback.slice(0, 10).map(f => `Rating: ${f.rating}/5 - ${f.feedback_text?.substring(0, 100)}`).join('\n')}

Provide 8-12 specific, actionable recommendations prioritized by impact:
- What to do (specific action)
- Why it matters (expected outcome)
- How to implement (concrete steps)
- Time investment required
- Priority level`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        immediate_actions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    action: { type: "string" },
                                    why: { type: "string" },
                                    how: { type: "array", items: { type: "string" } },
                                    time_required: { type: "string" },
                                    expected_impact: { type: "string" }
                                }
                            }
                        },
                        short_term_improvements: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    action: { type: "string" },
                                    why: { type: "string" },
                                    how: { type: "array", items: { type: "string" } },
                                    time_required: { type: "string" },
                                    expected_impact: { type: "string" }
                                }
                            }
                        },
                        long_term_strategies: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    action: { type: "string" },
                                    why: { type: "string" },
                                    how: { type: "array", items: { type: "string" } },
                                    time_required: { type: "string" },
                                    expected_impact: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            setRecommendations(result);
        } catch (error) {
            console.error("Error generating recommendations:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const markComplete = (section, index) => {
        const key = `${section}-${index}`;
        if (!completedActions.includes(key)) {
            setCompletedActions([...completedActions, key]);
        }
    };

    const renderRecommendation = (rec, section, idx) => {
        const key = `${section}-${idx}`;
        const isComplete = completedActions.includes(key);

        return (
            <div key={idx} className={`p-4 border-2 rounded-lg ${isComplete ? 'bg-green-50 border-green-300' : 'bg-white border-slate-200'}`}>
                <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-bold ${isComplete ? 'line-through text-slate-500' : ''}`}>{rec.action}</h4>
                    <Button
                        size="sm"
                        variant={isComplete ? "outline" : "default"}
                        onClick={() => markComplete(section, idx)}
                        disabled={isComplete}
                    >
                        {isComplete ? <CheckCircle className="h-4 w-4" /> : "Mark Done"}
                    </Button>
                </div>
                
                <p className="text-sm text-slate-700 mb-3">{rec.why}</p>
                
                <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Implementation:</p>
                    <ol className="text-xs text-slate-700 space-y-0.5 list-decimal list-inside">
                        {rec.how?.map((step, sidx) => (
                            <li key={sidx}>{step}</li>
                        ))}
                    </ol>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">⏱ {rec.time_required}</Badge>
                    <Badge className="text-xs bg-blue-100 text-blue-800">Impact: {rec.expected_impact}</Badge>
                </div>
            </div>
        );
    };

    if (isGenerating) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">Generating personalized recommendations...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card className="border-0 shadow-lg border-l-4 border-l-red-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                        <Lightbulb className="h-5 w-5" />
                        Immediate Actions (Do Today)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {recommendations?.immediate_actions?.map((rec, idx) => 
                        renderRecommendation(rec, 'immediate', idx)
                    )}
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg border-l-4 border-l-amber-500">
                <CardHeader>
                    <CardTitle className="text-amber-700">Short-term Improvements (This Week)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {recommendations?.short_term_improvements?.map((rec, idx) => 
                        renderRecommendation(rec, 'short-term', idx)
                    )}
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg border-l-4 border-l-blue-500">
                <CardHeader>
                    <CardTitle className="text-blue-700">Long-term Strategies (This Month)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {recommendations?.long_term_strategies?.map((rec, idx) => 
                        renderRecommendation(rec, 'long-term', idx)
                    )}
                </CardContent>
            </Card>

            <Button onClick={generateRecommendations} variant="outline" className="w-full">
                Refresh Recommendations
            </Button>
        </div>
    );
}