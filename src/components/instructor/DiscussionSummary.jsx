import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, TrendingUp, AlertCircle, HelpCircle, Sparkles } from "lucide-react";

export default function DiscussionSummary({ courseId }) {
    const [discussions, setDiscussions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        loadDiscussions();
    }, [courseId]);

    const loadDiscussions = async () => {
        const allDiscussions = await base44.entities.CourseDiscussion.filter({ course_id: courseId });
        setDiscussions(allDiscussions);
    };

    const generateSummary = async () => {
        setIsGenerating(true);
        try {
            const discussionTexts = discussions.map(d => 
                `[${d.author_name}]: ${d.message}`
            ).join('\n\n');

            const prompt = `Analyze these student discussion forum posts and provide a comprehensive summary:

${discussionTexts}

Generate:
1. Key questions asked by students (top 5-7 questions)
2. Common themes and topics (3-5 major themes)
3. Student sentiment (overall tone and engagement level)
4. Misconceptions identified (if any - 2-3 points)
5. Most engaged topics (what students discuss most)
6. Recommendations for instructor (what to address, clarify, or expand on)`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        key_questions: { type: "array", items: { type: "string" } },
                        themes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    theme: { type: "string" },
                                    frequency: { type: "string" }
                                }
                            }
                        },
                        sentiment: {
                            type: "object",
                            properties: {
                                overall: { type: "string" },
                                engagement_level: { type: "string" }
                            }
                        },
                        misconceptions: { type: "array", items: { type: "string" } },
                        engaged_topics: { type: "array", items: { type: "string" } },
                        instructor_recommendations: { type: "array", items: { type: "string" } }
                    }
                }
            });

            result.analyzed_date = new Date().toISOString();
            result.discussion_count = discussions.length;
            setSummary(result);
        } catch (error) {
            console.error("Error generating summary:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (discussions.length === 0) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-600">No discussions yet</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-violet-600" />
                        Discussion Forum Summary
                    </CardTitle>
                    <Button
                        onClick={generateSummary}
                        disabled={isGenerating}
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                {summary ? "Refresh" : "Generate"} Summary
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {!summary ? (
                    <div className="text-center py-8">
                        <p className="text-slate-600 mb-4">
                            Analyze {discussions.length} discussion posts to identify key questions, themes, and insights
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-violet-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-slate-900">Student Sentiment</h4>
                                <Badge variant="secondary">{summary.sentiment?.engagement_level}</Badge>
                            </div>
                            <p className="text-slate-700">{summary.sentiment?.overall}</p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <HelpCircle className="h-4 w-4 text-blue-600" />
                                Key Questions from Students
                            </h4>
                            <div className="space-y-2">
                                {summary.key_questions?.map((question, idx) => (
                                    <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-slate-700">{question}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                Common Themes
                            </h4>
                            <div className="grid md:grid-cols-2 gap-3">
                                {summary.themes?.map((theme, idx) => (
                                    <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-green-900">{theme.theme}</p>
                                            <Badge variant="outline">{theme.frequency}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {summary.misconceptions?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    Identified Misconceptions
                                </h4>
                                <div className="space-y-2">
                                    {summary.misconceptions.map((misc, idx) => (
                                        <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <p className="text-sm text-slate-700">{misc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3">Most Engaged Topics</h4>
                            <div className="flex flex-wrap gap-2">
                                {summary.engaged_topics?.map((topic, idx) => (
                                    <Badge key={idx} className="bg-violet-100 text-violet-800">
                                        {topic}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
                            <h4 className="font-semibold text-violet-900 mb-3">Recommendations for You</h4>
                            <ul className="space-y-2">
                                {summary.instructor_recommendations?.map((rec, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                        <span className="text-violet-600 font-bold">→</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <p className="text-xs text-slate-500 text-center">
                            Analyzed {summary.discussion_count} posts on {new Date(summary.analyzed_date).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}