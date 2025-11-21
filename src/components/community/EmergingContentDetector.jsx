import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, MessageSquare, Lightbulb } from "lucide-react";

export default function EmergingContentDetector({ courseId }) {
    const [insights, setInsights] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        analyzeDiscussions();
    }, [courseId]);

    const analyzeDiscussions = async () => {
        setIsAnalyzing(true);
        try {
            const discussions = await base44.entities.CourseDiscussion.filter({ course_id: courseId });
            
            if (discussions.length === 0) {
                setIsAnalyzing(false);
                return;
            }

            const prompt = `Analyze these course discussions to identify emerging trends and valuable student-generated content:

DISCUSSIONS (${discussions.length} total):
${discussions.slice(0, 50).map(d => `
- By ${d.author_name}: "${d.message}"
  Likes: ${d.likes_count || 0}, Lesson: ${d.lesson_order || 'General'}
`).join('\n')}

Identify:
1. Trending topics (what students are talking about most)
2. Common confusion points (repeated questions/struggles)
3. Valuable student insights (unique perspectives, helpful explanations)
4. Potential new FAQ items
5. Topics needing more course content
6. Student-generated resources or tips worth highlighting
7. Engagement patterns (what drives discussion)

Provide actionable insights for instructors.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        trending_topics: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    topic: { type: "string" },
                                    discussion_count: { type: "number" },
                                    sentiment: { type: "string" },
                                    key_points: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        confusion_points: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    topic: { type: "string" },
                                    frequency: { type: "number" },
                                    suggested_solution: { type: "string" }
                                }
                            }
                        },
                        valuable_insights: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    insight: { type: "string" },
                                    author_hint: { type: "string" },
                                    why_valuable: { type: "string" }
                                }
                            }
                        },
                        new_faq_items: { type: "array", items: { type: "string" } },
                        content_gaps: { type: "array", items: { type: "string" } },
                        engagement_drivers: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setInsights(result);
        } catch (error) {
            console.error("Error analyzing discussions:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (isAnalyzing) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">Analyzing community discussions...</p>
                </CardContent>
            </Card>
        );
    }

    if (!insights) return null;

    return (
        <div className="space-y-4">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                        Trending Topics
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {insights.trending_topics?.map((topic, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{topic.topic}</h4>
                                <Badge className="bg-orange-100 text-orange-800">
                                    {topic.discussion_count} discussions
                                </Badge>
                            </div>
                            <Badge variant="outline" className="mb-2">{topic.sentiment}</Badge>
                            <ul className="text-sm text-slate-700 space-y-1">
                                {topic.key_points?.map((point, pidx) => (
                                    <li key={pidx}>• {point}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {insights.confusion_points?.length > 0 && (
                <Card className="border-0 shadow-lg border-l-4 border-l-amber-500">
                    <CardHeader>
                        <CardTitle className="text-amber-700">Common Confusion Points</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {insights.confusion_points.map((point, idx) => (
                            <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                    <h5 className="font-semibold text-amber-900">{point.topic}</h5>
                                    <Badge className="bg-amber-200 text-amber-900">
                                        {point.frequency}x asked
                                    </Badge>
                                </div>
                                <p className="text-sm text-amber-800">→ {point.suggested_solution}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {insights.valuable_insights?.length > 0 && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <Lightbulb className="h-5 w-5" />
                            Valuable Student Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {insights.valuable_insights.map((insight, idx) => (
                            <div key={idx} className="p-3 bg-white border-2 border-green-200 rounded-lg">
                                <p className="text-sm text-slate-900 mb-2">"{insight.insight}"</p>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">— {insight.author_hint}</span>
                                    <Badge variant="outline" className="text-xs">
                                        {insight.why_valuable}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {insights.content_gaps?.length > 0 && (
                <Card className="border-0 shadow-lg border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardTitle className="text-blue-700">Content Gaps to Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {insights.content_gaps.map((gap, idx) => (
                                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>{gap}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <Button onClick={analyzeDiscussions} variant="outline" className="w-full">
                Refresh Analysis
            </Button>
        </div>
    );
}