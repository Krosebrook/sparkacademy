import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, MessageSquare } from "lucide-react";

export default function FeedbackInsights({ instructorEmail }) {
    const [insights, setInsights] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(true);

    useEffect(() => {
        analyzeFeedback();
    }, [instructorEmail]);

    const analyzeFeedback = async () => {
        setIsAnalyzing(true);
        try {
            const courses = await base44.entities.Course.filter({ created_by: instructorEmail });
            const courseIds = courses.map(c => c.id);
            
            const allFeedback = await Promise.all(
                courseIds.map(id => base44.entities.CourseFeedback.filter({ course_id: id }))
            );
            const flatFeedback = allFeedback.flat();

            if (flatFeedback.length === 0) {
                setIsAnalyzing(false);
                return;
            }

            const prompt = `Analyze these course reviews and identify key themes and sentiment:

REVIEWS (${flatFeedback.length} total):
${flatFeedback.slice(0, 50).map(f => `
Rating: ${f.rating}/5
Feedback: ${f.feedback_text}
`).join('\n---\n')}

Provide comprehensive analysis:
1. Overall sentiment distribution
2. Common positive themes
3. Common negative themes
4. Specific strengths mentioned
5. Specific weaknesses/concerns
6. Actionable suggestions from students
7. Sentiment score (0-100)
8. Summary`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        sentiment_distribution: {
                            type: "object",
                            properties: {
                                positive: { type: "number" },
                                neutral: { type: "number" },
                                negative: { type: "number" }
                            }
                        },
                        common_themes: { type: "array", items: { type: "string" } },
                        strengths: { type: "array", items: { type: "string" } },
                        weaknesses: { type: "array", items: { type: "string" } },
                        actionable_suggestions: { type: "array", items: { type: "string" } },
                        sentiment_score: { type: "number" },
                        summary: { type: "string" },
                        positive_keywords: { type: "array", items: { type: "string" } },
                        negative_keywords: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setInsights({ ...result, totalReviews: flatFeedback.length });
        } catch (error) {
            console.error("Error analyzing feedback:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (isAnalyzing) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">Analyzing student feedback...</p>
                </CardContent>
            </Card>
        );
    }

    if (!insights) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600">No reviews yet</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>Review Insights ({insights.totalReviews} reviews)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">Overall Sentiment</h4>
                            <Badge className={
                                insights.sentiment_score >= 70 ? "bg-green-600" :
                                insights.sentiment_score >= 40 ? "bg-amber-600" : "bg-red-600"
                            }>
                                {insights.sentiment_score}/100
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-700">{insights.summary}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                            <p className="text-xs text-green-800 mb-1">Positive</p>
                            <p className="text-2xl font-bold text-green-600">
                                {insights.sentiment_distribution?.positive}%
                            </p>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                            <p className="text-xs text-slate-800 mb-1">Neutral</p>
                            <p className="text-2xl font-bold text-slate-600">
                                {insights.sentiment_distribution?.neutral}%
                            </p>
                        </div>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                            <p className="text-xs text-red-800 mb-1">Negative</p>
                            <p className="text-2xl font-bold text-red-600">
                                {insights.sentiment_distribution?.negative}%
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-0 shadow-lg bg-green-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <TrendingUp className="h-5 w-5" />
                            Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {insights.strengths?.map((strength, idx) => (
                                <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">✓</span>
                                    <span>{strength}</span>
                                </li>
                            ))}
                        </ul>
                        {insights.positive_keywords?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                                <p className="text-xs font-semibold text-green-900 mb-1">Keywords:</p>
                                <div className="flex flex-wrap gap-1">
                                    {insights.positive_keywords.map((kw, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs bg-white">
                                            {kw}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <TrendingDown className="h-5 w-5" />
                            Areas for Improvement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {insights.weaknesses?.map((weakness, idx) => (
                                <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                                    <span className="text-red-600 mt-0.5">•</span>
                                    <span>{weakness}</span>
                                </li>
                            ))}
                        </ul>
                        {insights.negative_keywords?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-red-200">
                                <p className="text-xs font-semibold text-red-900 mb-1">Keywords:</p>
                                <div className="flex flex-wrap gap-1">
                                    {insights.negative_keywords.map((kw, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs bg-white">
                                            {kw}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {insights.actionable_suggestions?.length > 0 && (
                <Card className="border-0 shadow-lg border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardTitle className="text-blue-700">Student Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {insights.actionable_suggestions.map((suggestion, idx) => (
                                <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">→</span>
                                    <span>{suggestion}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <Button onClick={analyzeFeedback} variant="outline" className="w-full">
                Refresh Analysis
            </Button>
        </div>
    );
}