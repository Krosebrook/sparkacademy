import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, BarChart, Sparkles } from "lucide-react";

export default function PerformanceTrendsSummary({ courses, enrollments }) {
    const [summary, setSummary] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateSummary = async () => {
        setIsGenerating(true);
        try {
            const courseData = courses.map(course => {
                const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
                const avgCompletion = courseEnrollments.length > 0
                    ? courseEnrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / courseEnrollments.length
                    : 0;
                
                const avgQuizScores = courseEnrollments
                    .flatMap(e => e.progress || [])
                    .filter(p => p.quiz_score !== undefined)
                    .map(p => p.quiz_score);
                
                const avgQuizScore = avgQuizScores.length > 0
                    ? avgQuizScores.reduce((a, b) => a + b, 0) / avgQuizScores.length
                    : 0;

                const recentActivity = courseEnrollments.filter(e => {
                    const lastActivity = new Date(e.last_activity_date || 0);
                    const daysSince = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
                    return daysSince <= 7;
                }).length;

                return {
                    title: course.title,
                    category: course.category,
                    totalStudents: courseEnrollments.length,
                    avgCompletion: avgCompletion.toFixed(1),
                    avgQuizScore: avgQuizScore.toFixed(1),
                    completedStudents: courseEnrollments.filter(e => e.completion_percentage === 100).length,
                    activeLastWeek: recentActivity,
                    rating: course.rating || 0
                };
            });

            const prompt = `Analyze these instructor's course performance metrics and generate a comprehensive trend summary:

${courseData.map(c => `Course: ${c.title}
- Category: ${c.category}
- Total Students: ${c.totalStudents}
- Avg Completion: ${c.avgCompletion}%
- Avg Quiz Score: ${c.avgQuizScore}%
- Completed: ${c.completedStudents}
- Active Last Week: ${c.activeLastWeek}
- Rating: ${c.rating}/5
`).join("\n")}

Provide:
1. Overall performance assessment (paragraph)
2. Key trends (4-6 bullet points)
3. Best performing courses (top 3 with reasons)
4. Courses needing attention (with specific issues)
5. Month-over-month insights
6. Actionable recommendations (5-7 specific items)`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overall_assessment: { type: "string" },
                        key_trends: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    trend: { type: "string" },
                                    direction: { type: "string", enum: ["up", "down", "stable"] },
                                    impact: { type: "string" }
                                }
                            }
                        },
                        best_performing: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    course_title: { type: "string" },
                                    reason: { type: "string" },
                                    metrics: { type: "string" }
                                }
                            }
                        },
                        needs_attention: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    course_title: { type: "string" },
                                    issue: { type: "string" },
                                    priority: { type: "string" }
                                }
                            }
                        },
                        insights: {
                            type: "array",
                            items: { type: "string" }
                        },
                        recommendations: {
                            type: "array",
                            items: { type: "string" }
                        }
                    }
                }
            });

            setSummary(result);
        } catch (error) {
            console.error("Error generating summary:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const getTrendIcon = (direction) => {
        if (direction === "up") return <TrendingUp className="h-4 w-4 text-green-600" />;
        if (direction === "down") return <TrendingDown className="h-4 w-4 text-red-600" />;
        return <BarChart className="h-4 w-4 text-slate-600" />;
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-violet-600" />
                        AI Performance Trends Analysis
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
                                Generate Summary
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            {summary && (
                <CardContent className="space-y-6">
                    <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-2">Overall Assessment</h4>
                        <p className="text-slate-700">{summary.overall_assessment}</p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Key Trends</h4>
                        <div className="space-y-2">
                            {summary.key_trends?.map((trend, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                                    {getTrendIcon(trend.direction)}
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900">{trend.trend}</p>
                                        <p className="text-sm text-slate-600">{trend.impact}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                Best Performing Courses
                            </h4>
                            <div className="space-y-3">
                                {summary.best_performing?.map((course, idx) => (
                                    <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <h5 className="font-semibold text-slate-900 mb-1">{course.course_title}</h5>
                                        <p className="text-sm text-slate-700 mb-1">{course.reason}</p>
                                        <p className="text-xs text-green-700 font-semibold">{course.metrics}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-amber-600" />
                                Needs Attention
                            </h4>
                            <div className="space-y-3">
                                {summary.needs_attention?.map((course, idx) => (
                                    <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-start justify-between mb-1">
                                            <h5 className="font-semibold text-slate-900">{course.course_title}</h5>
                                            <Badge className={
                                                course.priority === "high" ? "bg-red-100 text-red-800" :
                                                course.priority === "medium" ? "bg-amber-100 text-amber-800" :
                                                "bg-blue-100 text-blue-800"
                                            }>
                                                {course.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-700">{course.issue}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Strategic Insights</h4>
                        <ul className="space-y-2">
                            {summary.insights?.map((insight, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="text-violet-600 font-bold">💡</span>
                                    {insight}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-3">Recommended Actions</h4>
                        <ol className="space-y-2">
                            {summary.recommendations?.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="font-bold text-blue-600">{idx + 1}.</span>
                                    {rec}
                                </li>
                            ))}
                        </ol>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}