import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, AlertTriangle, TrendingUp } from "lucide-react";

export default function ContentPerformanceAnalyzer({ instructorEmail }) {
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(true);

    useEffect(() => {
        analyzeContent();
    }, [instructorEmail]);

    const analyzeContent = async () => {
        setIsAnalyzing(true);
        try {
            const courses = await base44.entities.Course.filter({ created_by: instructorEmail });
            const courseIds = courses.map(c => c.id);
            
            const enrollments = await Promise.all(
                courseIds.map(id => base44.entities.Enrollment.filter({ course_id: id }))
            );
            const flatEnrollments = enrollments.flat();

            // Analyze lesson performance across all courses
            const lessonPerformance = [];
            courses.forEach(course => {
                const courseEnrollments = flatEnrollments.filter(e => e.course_id === course.id);
                
                course.lessons?.forEach(lesson => {
                    const lessonProgress = courseEnrollments.map(e => 
                        e.progress?.find(p => p.lesson_order === lesson.order)
                    ).filter(Boolean);

                    const completed = lessonProgress.filter(p => p.completed).length;
                    const quizScores = lessonProgress.filter(p => p.quiz_score).map(p => p.quiz_score);
                    const avgQuizScore = quizScores.length > 0 
                        ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length 
                        : null;

                    lessonPerformance.push({
                        courseName: course.title,
                        lessonTitle: lesson.title,
                        lessonOrder: lesson.order,
                        completionRate: courseEnrollments.length > 0 
                            ? (completed / courseEnrollments.length) * 100 
                            : 0,
                        avgQuizScore,
                        quizAttempts: quizScores.length,
                        totalStudents: courseEnrollments.length
                    });
                });
            });

            const prompt = `Analyze this content performance data and provide insights:

CONTENT PERFORMANCE:
${lessonPerformance.map(lp => `
Course: ${lp.courseName}
Lesson: ${lp.lessonTitle}
- Completion Rate: ${lp.completionRate.toFixed(1)}%
- Quiz Score: ${lp.avgQuizScore ? lp.avgQuizScore.toFixed(1) : 'N/A'}
- Students: ${lp.totalStudents}
`).join('\n')}

Identify:
1. Top 5 performing lessons (high completion + quiz scores)
2. Bottom 5 lessons needing improvement
3. Drop-off points (where completion rates drop significantly)
4. Content that resonates well with students
5. Specific recommendations for each underperforming lesson`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        top_performers: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    course: { type: "string" },
                                    lesson: { type: "string" },
                                    why_successful: { type: "string" }
                                }
                            }
                        },
                        needs_improvement: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    course: { type: "string" },
                                    lesson: { type: "string" },
                                    issues: { type: "array", items: { type: "string" } },
                                    recommendations: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        drop_off_points: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    location: { type: "string" },
                                    severity: { type: "string" },
                                    likely_cause: { type: "string" }
                                }
                            }
                        },
                        successful_patterns: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setAnalysis(result);
        } catch (error) {
            console.error("Error analyzing content:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (isAnalyzing) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">Analyzing content performance...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                        <Star className="h-5 w-5" />
                        Top Performing Content
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {analysis?.top_performers?.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white border-2 border-green-200 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-semibold text-sm">{item.lesson}</p>
                                    <p className="text-xs text-slate-600">{item.course}</p>
                                </div>
                                <Badge className="bg-green-600">#{idx + 1}</Badge>
                            </div>
                            <p className="text-sm text-slate-700">{item.why_successful}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {analysis?.needs_improvement?.length > 0 && (
                <Card className="border-0 shadow-lg border-l-4 border-l-red-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5" />
                            Content Needing Improvement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {analysis.needs_improvement.map((item, idx) => (
                            <div key={idx} className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                                <div className="mb-2">
                                    <p className="font-semibold">{item.lesson}</p>
                                    <p className="text-xs text-slate-600">{item.course}</p>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs font-semibold text-red-900 mb-1">Issues:</p>
                                        <ul className="text-sm space-y-0.5">
                                            {item.issues?.map((issue, iidx) => (
                                                <li key={iidx} className="text-red-800">• {issue}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-green-900 mb-1">Recommendations:</p>
                                        <ul className="text-sm space-y-0.5">
                                            {item.recommendations?.map((rec, ridx) => (
                                                <li key={ridx} className="text-green-800">→ {rec}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {analysis?.drop_off_points?.length > 0 && (
                <Card className="border-0 shadow-lg border-l-4 border-l-amber-500">
                    <CardHeader>
                        <CardTitle className="text-amber-700">Drop-off Points</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {analysis.drop_off_points.map((point, idx) => (
                            <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-semibold text-sm">{point.location}</p>
                                    <Badge className={
                                        point.severity === 'high' ? 'bg-red-600' :
                                        point.severity === 'medium' ? 'bg-amber-600' : 'bg-blue-600'
                                    }>
                                        {point.severity}
                                    </Badge>
                                </div>
                                <p className="text-sm text-amber-800">{point.likely_cause}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {analysis?.successful_patterns?.length > 0 && (
                <Card className="border-0 shadow-lg bg-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <TrendingUp className="h-5 w-5" />
                            Successful Patterns
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {analysis.successful_patterns.map((pattern, idx) => (
                                <li key={idx} className="text-sm text-blue-900 flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">✓</span>
                                    <span>{pattern}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}