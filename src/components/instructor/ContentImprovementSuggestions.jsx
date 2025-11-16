import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lightbulb, TrendingDown, AlertTriangle, CheckCircle, Sparkles } from "lucide-react";

export default function ContentImprovementSuggestions({ courseId }) {
    const [course, setCourse] = useState(null);
    const [suggestions, setSuggestions] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        loadCourse();
    }, [courseId]);

    const loadCourse = async () => {
        const courseData = await base44.entities.Course.get(courseId);
        setCourse(courseData);
    };

    const generateSuggestions = async () => {
        setIsGenerating(true);
        try {
            const enrollments = await base44.entities.Enrollment.filter({ course_id: courseId });
            const feedback = await base44.entities.CourseFeedback.filter({ course_id: courseId });
            const discussions = await base44.entities.CourseDiscussion.filter({ course_id: courseId });

            const dropoffPoints = {};
            const lowScoreLessons = {};
            
            enrollments.forEach(e => {
                const progress = e.progress || [];
                const lastLesson = Math.max(...progress.map(p => p.lesson_order), 0);
                if (lastLesson < (course.lessons?.length || 0)) {
                    dropoffPoints[lastLesson] = (dropoffPoints[lastLesson] || 0) + 1;
                }

                progress.forEach(p => {
                    if (p.quiz_score && p.quiz_score < 70) {
                        lowScoreLessons[p.lesson_order] = (lowScoreLessons[p.lesson_order] || 0) + 1;
                    }
                });
            });

            const analyticsData = {
                total_students: enrollments.length,
                avg_completion: enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / enrollments.length,
                dropoff_points: Object.entries(dropoffPoints).map(([lesson, count]) => ({ lesson: parseInt(lesson), count })),
                low_score_lessons: Object.entries(lowScoreLessons).map(([lesson, count]) => ({ lesson: parseInt(lesson), count })),
                feedback_count: feedback.length,
                discussion_count: discussions.length
            };

            const feedbackSummary = feedback.map(f => f.feedback_text).join('\n');
            const courseLessons = course.lessons?.map(l => `Lesson ${l.order}: ${l.title}`).join('\n');

            const prompt = `Analyze this course performance data and provide specific content improvement suggestions:

Course: ${course.title}
Lessons:
${courseLessons}

Analytics:
${JSON.stringify(analyticsData, null, 2)}

Recent Student Feedback:
${feedbackSummary}

Generate:
1. High-priority improvements (lessons needing immediate attention - 3-5 items with specific lesson numbers)
2. Content clarity issues (where students struggle - 3-4 specific points)
3. Engagement opportunities (ways to make content more interactive - 3-4 suggestions)
4. Content additions (topics students want more of - 3-4 items)
5. Quick wins (easy improvements with high impact - 3-4 actionable items)
6. Overall content strategy recommendations`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        high_priority: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    lesson_number: { type: "number" },
                                    issue: { type: "string" },
                                    suggestion: { type: "string" },
                                    impact: { type: "string" }
                                }
                            }
                        },
                        clarity_issues: { type: "array", items: { type: "string" } },
                        engagement_opportunities: { type: "array", items: { type: "string" } },
                        content_additions: { type: "array", items: { type: "string" } },
                        quick_wins: { type: "array", items: { type: "string" } },
                        strategy_recommendations: { type: "string" }
                    }
                }
            });

            result.analyzed_date = new Date().toISOString();
            setSuggestions(result);
        } catch (error) {
            console.error("Error generating suggestions:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!course) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-violet-600" />
                        AI Content Improvement Suggestions
                    </CardTitle>
                    <Button
                        onClick={generateSuggestions}
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
                                {suggestions ? "Refresh" : "Generate"} Suggestions
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {!suggestions ? (
                    <div className="text-center py-8">
                        <p className="text-slate-600">
                            Generate AI-powered suggestions to improve your course content based on student performance and feedback
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {suggestions.high_priority?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    High Priority Improvements
                                </h4>
                                <div className="space-y-3">
                                    {suggestions.high_priority.map((item, idx) => (
                                        <div key={idx} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex items-start justify-between mb-2">
                                                <Badge className="bg-red-600">Lesson {item.lesson_number}</Badge>
                                                <Badge variant="outline">{item.impact} Impact</Badge>
                                            </div>
                                            <p className="font-semibold text-red-900 mb-2">{item.issue}</p>
                                            <p className="text-sm text-slate-700">{item.suggestion}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-amber-600" />
                                Content Clarity Issues
                            </h4>
                            <div className="space-y-2">
                                {suggestions.clarity_issues?.map((issue, idx) => (
                                    <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="text-sm text-slate-700">{issue}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-blue-600" />
                                Engagement Opportunities
                            </h4>
                            <div className="space-y-2">
                                {suggestions.engagement_opportunities?.map((opp, idx) => (
                                    <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-slate-700">{opp}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-purple-600" />
                                Suggested Content Additions
                            </h4>
                            <div className="space-y-2">
                                {suggestions.content_additions?.map((add, idx) => (
                                    <div key={idx} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                        <p className="text-sm text-slate-700">{add}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Quick Wins
                            </h4>
                            <ul className="space-y-2">
                                {suggestions.quick_wins?.map((win, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                        <span className="text-green-600 font-bold">✓</span>
                                        {win}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg">
                            <h4 className="font-semibold text-violet-900 mb-2">Overall Strategy</h4>
                            <p className="text-sm text-slate-700">{suggestions.strategy_recommendations}</p>
                        </div>

                        <p className="text-xs text-slate-500 text-center">
                            Generated on {new Date(suggestions.analyzed_date).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}