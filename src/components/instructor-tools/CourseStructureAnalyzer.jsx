import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart, TrendingUp, AlertTriangle } from "lucide-react";

export default function CourseStructureAnalyzer({ courseId }) {
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const analyzeCourse = async () => {
        setIsAnalyzing(true);
        try {
            const [course, enrollments, discussions, feedback] = await Promise.all([
                base44.entities.Course.get(courseId),
                base44.entities.Enrollment.filter({ course_id: courseId }),
                base44.entities.CourseDiscussion.filter({ course_id: courseId }),
                base44.entities.CourseFeedback.filter({ course_id: courseId })
            ]);

            const completionRates = enrollments.map(e => e.completion_percentage || 0);
            const avgCompletion = completionRates.reduce((a, b) => a + b, 0) / (completionRates.length || 1);
            
            const quizScores = enrollments.flatMap(e => 
                (e.progress || []).filter(p => p.quiz_score).map(p => p.quiz_score)
            );
            const avgQuizScore = quizScores.reduce((a, b) => a + b, 0) / (quizScores.length || 1);

            const prompt = `Analyze this course structure and provide comprehensive feedback:

COURSE: ${course.title}
LEVEL: ${course.level}
TOTAL LESSONS: ${course.lessons?.length || 0}

LESSON BREAKDOWN:
${course.lessons?.map((l, i) => `${i + 1}. ${l.title} (${l.duration_minutes}min, Quiz: ${l.quiz ? 'Yes' : 'No'})`).join('\n')}

ENGAGEMENT DATA:
- Total Enrollments: ${enrollments.length}
- Average Completion Rate: ${avgCompletion.toFixed(1)}%
- Average Quiz Score: ${avgQuizScore.toFixed(1)}%
- Discussion Posts: ${discussions.length}
- Feedback Submissions: ${feedback.length}

Provide detailed analysis:
1. Overall structure assessment (score 0-100)
2. Strengths of the course structure
3. Critical issues that need immediate attention
4. Pacing analysis (is progression logical?)
5. Content balance (theory vs practice)
6. Engagement optimization suggestions
7. Lesson-specific recommendations
8. Learning path flow assessment
9. Assessment strategy feedback
10. Actionable improvement plan`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overall_score: { type: "number" },
                        summary: { type: "string" },
                        strengths: { type: "array", items: { type: "string" } },
                        critical_issues: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    issue: { type: "string" },
                                    severity: { type: "string" },
                                    solution: { type: "string" }
                                }
                            }
                        },
                        pacing_analysis: { type: "string" },
                        content_balance: {
                            type: "object",
                            properties: {
                                theory_percentage: { type: "number" },
                                practice_percentage: { type: "number" },
                                assessment: { type: "string" }
                            }
                        },
                        engagement_suggestions: { type: "array", items: { type: "string" } },
                        lesson_recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    lesson_number: { type: "number" },
                                    lesson_title: { type: "string" },
                                    recommendation: { type: "string" }
                                }
                            }
                        },
                        improvement_plan: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    priority: { type: "string" },
                                    action: { type: "string" },
                                    expected_impact: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            setAnalysis({ ...result, courseData: { avgCompletion, avgQuizScore, enrollments: enrollments.length } });
        } catch (error) {
            console.error("Error analyzing course:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getSeverityColor = (severity) => {
        const colors = {
            high: "bg-red-100 text-red-800 border-red-300",
            medium: "bg-amber-100 text-amber-800 border-amber-300",
            low: "bg-blue-100 text-blue-800 border-blue-300"
        };
        return colors[severity?.toLowerCase()] || colors.medium;
    };

    return (
        <div className="space-y-4">
            {!analysis && (
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-8 text-center">
                        <BarChart className="h-12 w-12 text-violet-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Analyze Course Structure</h3>
                        <p className="text-slate-600 mb-6">
                            Get AI-powered insights on your course structure, pacing, and engagement
                        </p>
                        <Button 
                            onClick={analyzeCourse}
                            disabled={isAnalyzing}
                            size="lg"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Analyzing Course...
                                </>
                            ) : (
                                "Start Analysis"
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {analysis && (
                <>
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-50">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Course Structure Analysis</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-bold text-violet-600">{analysis.overall_score}</span>
                                    <span className="text-sm text-slate-600">/100</span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-700">{analysis.summary}</p>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-3 bg-white rounded-lg border text-center">
                                    <p className="text-xs text-slate-600">Enrollments</p>
                                    <p className="text-2xl font-bold text-violet-600">{analysis.courseData?.enrollments}</p>
                                </div>
                                <div className="p-3 bg-white rounded-lg border text-center">
                                    <p className="text-xs text-slate-600">Avg Completion</p>
                                    <p className="text-2xl font-bold text-green-600">{analysis.courseData?.avgCompletion.toFixed(0)}%</p>
                                </div>
                                <div className="p-3 bg-white rounded-lg border text-center">
                                    <p className="text-xs text-slate-600">Avg Quiz Score</p>
                                    <p className="text-2xl font-bold text-blue-600">{analysis.courseData?.avgQuizScore.toFixed(0)}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {analysis.critical_issues?.length > 0 && (
                        <Card className="border-0 shadow-lg border-l-4 border-l-red-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-700">
                                    <AlertTriangle className="h-5 w-5" />
                                    Critical Issues
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {analysis.critical_issues.map((issue, idx) => (
                                    <div key={idx} className={`p-4 border-2 rounded-lg ${getSeverityColor(issue.severity)}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold">{issue.issue}</h4>
                                            <Badge>{issue.severity} priority</Badge>
                                        </div>
                                        <p className="text-sm">→ {issue.solution}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-base">✓ Strengths</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {analysis.strengths?.map((strength, idx) => (
                                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                            <span className="text-green-600 mt-0.5">•</span>
                                            <span>{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-base">Content Balance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span>Theory</span>
                                            <span className="font-bold">{analysis.content_balance?.theory_percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-600"
                                                style={{ width: `${analysis.content_balance?.theory_percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span>Practice</span>
                                            <span className="font-bold">{analysis.content_balance?.practice_percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-green-600"
                                                style={{ width: `${analysis.content_balance?.practice_percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-2">{analysis.content_balance?.assessment}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-base">Pacing Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-700">{analysis.pacing_analysis}</p>
                        </CardContent>
                    </Card>

                    {analysis.lesson_recommendations?.length > 0 && (
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-base">Lesson-Specific Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {analysis.lesson_recommendations.map((rec, idx) => (
                                    <div key={idx} className="p-3 border rounded-lg">
                                        <p className="font-semibold text-sm mb-1">
                                            Lesson {rec.lesson_number}: {rec.lesson_title}
                                        </p>
                                        <p className="text-sm text-slate-700">{rec.recommendation}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-0 shadow-lg bg-green-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-700">
                                <TrendingUp className="h-5 w-5" />
                                Improvement Action Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {analysis.improvement_plan?.map((item, idx) => (
                                <div key={idx} className="p-4 bg-white border-2 border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className={item.priority === 'high' ? 'bg-red-600' : item.priority === 'medium' ? 'bg-amber-600' : 'bg-blue-600'}>
                                            {item.priority}
                                        </Badge>
                                        <h4 className="font-semibold text-sm">{item.action}</h4>
                                    </div>
                                    <p className="text-sm text-slate-600">Impact: {item.expected_impact}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Button onClick={analyzeCourse} variant="outline" className="w-full">
                        Re-analyze Course
                    </Button>
                </>
            )}
        </div>
    );
}