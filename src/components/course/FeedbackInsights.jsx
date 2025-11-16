import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, TrendingDown, Lightbulb, MessageSquare, Star, RefreshCw } from "lucide-react";

export default function FeedbackInsights({ courseId }) {
    const [insights, setInsights] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [feedbackCount, setFeedbackCount] = useState(0);

    useEffect(() => {
        loadInsights();
    }, [courseId]);

    const loadInsights = async () => {
        const course = await base44.entities.Course.get(courseId);
        if (course.feedback_insights) {
            setInsights(course.feedback_insights);
        }
        
        const feedback = await base44.entities.CourseFeedback.filter({ course_id: courseId });
        setFeedbackCount(feedback.length);
    };

    const analyzeFeedback = async () => {
        setIsAnalyzing(true);
        try {
            const allFeedback = await base44.entities.CourseFeedback.filter({ course_id: courseId });
            
            if (allFeedback.length === 0) {
                alert("No feedback to analyze yet.");
                setIsAnalyzing(false);
                return;
            }

            const feedbackTexts = allFeedback.map(f => 
                `Rating: ${f.rating}/5\nFeedback: ${f.feedback_text}`
            ).join("\n\n---\n\n");

            const prompt = `Analyze the following student feedback for a course and provide comprehensive insights:

${feedbackTexts}

Analyze and provide:
1. Overall sentiment distribution (positive, neutral, negative percentages)
2. Common themes mentioned (list 5-8 key themes with frequency)
3. Strengths (what students loved - 3-5 points)
4. Weaknesses (areas needing improvement - 3-5 points)
5. Actionable suggestions (specific recommendations for the instructor - 5-7 items)
6. Average sentiment score (1-10)
7. Key insights summary (2-3 sentences)`;

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
                        common_themes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    theme: { type: "string" },
                                    frequency: { type: "string" }
                                }
                            }
                        },
                        strengths: {
                            type: "array",
                            items: { type: "string" }
                        },
                        weaknesses: {
                            type: "array",
                            items: { type: "string" }
                        },
                        actionable_suggestions: {
                            type: "array",
                            items: { type: "string" }
                        },
                        sentiment_score: { type: "number" },
                        summary: { type: "string" }
                    }
                }
            });

            result.analyzed_date = new Date().toISOString();
            result.feedback_count = allFeedback.length;

            await base44.entities.Course.update(courseId, {
                feedback_insights: result
            });

            for (const feedback of allFeedback) {
                if (!feedback.is_analyzed) {
                    await base44.entities.CourseFeedback.update(feedback.id, {
                        is_analyzed: true
                    });
                }
            }

            setInsights(result);
        } catch (error) {
            console.error("Error analyzing feedback:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getSentimentColor = (score) => {
        if (score >= 7) return "text-green-600";
        if (score >= 4) return "text-amber-600";
        return "text-red-600";
    };

    if (!insights && feedbackCount === 0) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No Feedback Yet</h3>
                    <p className="text-slate-600">Student feedback will appear here once submitted.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-violet-600" />
                            Student Feedback Insights
                        </CardTitle>
                        <Button
                            onClick={analyzeFeedback}
                            disabled={isAnalyzing}
                            variant="outline"
                            size="sm"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    {insights ? "Refresh" : "Analyze"} ({feedbackCount} responses)
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                {insights && (
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    <span className="text-sm font-semibold text-green-900">Positive</span>
                                </div>
                                <p className="text-3xl font-bold text-green-700">
                                    {insights.sentiment_distribution?.positive || 0}%
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="h-5 w-5 text-slate-600" />
                                    <span className="text-sm font-semibold text-slate-900">Neutral</span>
                                </div>
                                <p className="text-3xl font-bold text-slate-700">
                                    {insights.sentiment_distribution?.neutral || 0}%
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                    <span className="text-sm font-semibold text-red-900">Negative</span>
                                </div>
                                <p className="text-3xl font-bold text-red-700">
                                    {insights.sentiment_distribution?.negative || 0}%
                                </p>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-slate-900">Overall Sentiment</h4>
                                <span className={`text-2xl font-bold ${getSentimentColor(insights.sentiment_score)}`}>
                                    {insights.sentiment_score}/10
                                </span>
                            </div>
                            <Progress value={insights.sentiment_score * 10} className="h-3" />
                            <p className="text-sm text-slate-600 mt-2">{insights.summary}</p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                Strengths
                            </h4>
                            <ul className="space-y-2">
                                {insights.strengths?.map((strength, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 mt-0.5">✓</Badge>
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-amber-600" />
                                Areas for Improvement
                            </h4>
                            <ul className="space-y-2">
                                {insights.weaknesses?.map((weakness, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 mt-0.5">!</Badge>
                                        {weakness}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-violet-600" />
                                Actionable Suggestions
                            </h4>
                            <div className="space-y-2">
                                {insights.actionable_suggestions?.map((suggestion, idx) => (
                                    <div key={idx} className="p-3 bg-violet-50 border border-violet-200 rounded-lg">
                                        <p className="text-sm text-slate-700">{suggestion}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3">Common Themes</h4>
                            <div className="flex flex-wrap gap-2">
                                {insights.common_themes?.map((theme, idx) => (
                                    <Badge key={idx} variant="outline" className="text-sm">
                                        {theme.theme} ({theme.frequency})
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t text-xs text-slate-500">
                            Analyzed {insights.feedback_count} responses on {new Date(insights.analyzed_date).toLocaleDateString()}
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}