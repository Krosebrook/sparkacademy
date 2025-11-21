import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, AlertTriangle, CheckCircle, Sparkles } from "lucide-react";

export default function AdaptiveLearningEngine({ userEmail, courseId, onPathAdjusted }) {
    const [adaptations, setAdaptations] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [performanceMetrics, setPerformanceMetrics] = useState(null);

    useEffect(() => {
        analyzeAndAdapt();
    }, [userEmail, courseId]);

    const analyzeAndAdapt = async () => {
        setIsAnalyzing(true);
        try {
            const [enrollment, course, analytics] = await Promise.all([
                base44.entities.Enrollment.filter({ student_email: userEmail, course_id: courseId }),
                base44.entities.Course.get(courseId),
                base44.entities.CourseAnalytics.filter({ student_email: userEmail, course_id: courseId })
            ]);

            const currentEnrollment = enrollment[0];
            if (!currentEnrollment) {
                setIsAnalyzing(false);
                return;
            }

            const recentProgress = currentEnrollment.progress?.slice(-5) || [];
            const avgScore = recentProgress.reduce((sum, p) => sum + (p.quiz_score || 0), 0) / (recentProgress.length || 1);
            const completionRate = currentEnrollment.completion_percentage || 0;
            const failedQuizzes = recentProgress.filter(p => p.quiz_score < 70).length;
            
            const analytics_data = analytics[0];
            const engagementScore = analytics_data?.engagement_score || 50;

            setPerformanceMetrics({
                avgScore: avgScore.toFixed(1),
                completionRate,
                failedQuizzes,
                engagementScore,
                totalLessons: course.lessons?.length || 0,
                completedLessons: recentProgress.filter(p => p.completed).length
            });

            const prompt = `Analyze this student's learning performance and adapt their learning path in real-time:

COURSE: ${course.title}
COURSE LEVEL: ${course.level}

STUDENT PERFORMANCE:
- Average Quiz Score: ${avgScore.toFixed(1)}%
- Completion Rate: ${completionRate}%
- Failed Quizzes (recent): ${failedQuizzes}/5
- Engagement Score: ${engagementScore}%
- Completed Lessons: ${recentProgress.filter(p => p.completed).length}/${course.lessons?.length}

RECENT LESSON PERFORMANCE:
${recentProgress.map(p => `- Lesson ${p.lesson_order}: Score ${p.quiz_score || 'N/A'}%, ${p.completed ? 'Completed' : 'In Progress'}`).join('\n')}

Based on this performance data, provide:
1. Performance assessment (struggling, needs_support, on_track, excelling)
2. Specific struggling areas
3. Adaptive recommendations:
   - Should they slow down or speed up?
   - Need remedial content?
   - Ready for advanced content?
   - Should skip/review certain topics?
4. Immediate action items
5. Path adjustments (easier/harder content, more practice, different format)
6. Motivational insights
7. Predicted success rate for next lessons`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        performance_level: { type: "string", enum: ["struggling", "needs_support", "on_track", "excelling"] },
                        performance_summary: { type: "string" },
                        struggling_areas: { type: "array", items: { type: "string" } },
                        pace_adjustment: { type: "string", enum: ["slow_down", "maintain", "speed_up"] },
                        content_difficulty: { type: "string", enum: ["easier", "maintain", "harder", "mixed"] },
                        recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string" },
                                    action: { type: "string" },
                                    reason: { type: "string" },
                                    priority: { type: "string" }
                                }
                            }
                        },
                        immediate_actions: { type: "array", items: { type: "string" } },
                        path_adjustments: {
                            type: "object",
                            properties: {
                                add_remedial: { type: "boolean" },
                                add_practice: { type: "boolean" },
                                skip_topics: { type: "array", items: { type: "string" } },
                                focus_topics: { type: "array", items: { type: "string" } }
                            }
                        },
                        motivational_message: { type: "string" },
                        predicted_success_rate: { type: "number" }
                    }
                }
            });

            setAdaptations(result);
            if (onPathAdjusted) {
                onPathAdjusted(result);
            }
        } catch (error) {
            console.error("Error analyzing performance:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getPerformanceColor = (level) => {
        const colors = {
            struggling: "bg-red-100 text-red-800 border-red-300",
            needs_support: "bg-amber-100 text-amber-800 border-amber-300",
            on_track: "bg-green-100 text-green-800 border-green-300",
            excelling: "bg-blue-100 text-blue-800 border-blue-300"
        };
        return colors[level] || colors.on_track;
    };

    const getPerformanceIcon = (level) => {
        const icons = {
            struggling: AlertTriangle,
            needs_support: TrendingUp,
            on_track: CheckCircle,
            excelling: Sparkles
        };
        return icons[level] || CheckCircle;
    };

    if (isAnalyzing) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-violet-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">Analyzing your performance and adapting learning path...</p>
                </CardContent>
            </Card>
        );
    }

    if (!adaptations) return null;

    const PerformanceIcon = getPerformanceIcon(adaptations.performance_level);

    return (
        <div className="space-y-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-violet-600" />
                        Adaptive Learning Path
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
                            <PerformanceIcon className="h-8 w-8 text-violet-600" />
                        </div>
                        <div className="flex-1">
                            <Badge className={getPerformanceColor(adaptations.performance_level)}>
                                {adaptations.performance_level.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <p className="text-sm text-slate-700 mt-1">{adaptations.performance_summary}</p>
                        </div>
                    </div>

                    {performanceMetrics && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 bg-white rounded-lg border text-center">
                                <p className="text-xs text-slate-600">Avg Score</p>
                                <p className="text-lg font-bold text-violet-600">{performanceMetrics.avgScore}%</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border text-center">
                                <p className="text-xs text-slate-600">Completion</p>
                                <p className="text-lg font-bold text-green-600">{performanceMetrics.completionRate}%</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border text-center">
                                <p className="text-xs text-slate-600">Engagement</p>
                                <p className="text-lg font-bold text-blue-600">{performanceMetrics.engagementScore}%</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border text-center">
                                <p className="text-xs text-slate-600">Success Rate</p>
                                <p className="text-lg font-bold text-orange-600">{adaptations.predicted_success_rate}%</p>
                            </div>
                        </div>
                    )}

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-1">💬 {adaptations.motivational_message}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-base">🎯 Immediate Action Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="space-y-2">
                        {adaptations.immediate_actions?.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="font-bold text-violet-600">{idx + 1}.</span>
                                <span className="text-sm text-slate-700">{action}</span>
                            </li>
                        ))}
                    </ol>
                </CardContent>
            </Card>

            {adaptations.struggling_areas?.length > 0 && (
                <Card className="border-0 shadow-lg border-l-4 border-l-amber-500">
                    <CardHeader>
                        <CardTitle className="text-base text-amber-700">⚠️ Areas Needing Focus</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-1">
                            {adaptations.struggling_areas.map((area, idx) => (
                                <li key={idx} className="text-sm text-slate-700">• {area}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-base">📊 Adaptive Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 border rounded-lg">
                            <p className="text-xs font-semibold text-slate-900 mb-1">Pace</p>
                            <Badge>{adaptations.pace_adjustment.replace('_', ' ')}</Badge>
                        </div>
                        <div className="p-3 bg-slate-50 border rounded-lg">
                            <p className="text-xs font-semibold text-slate-900 mb-1">Content Difficulty</p>
                            <Badge>{adaptations.content_difficulty}</Badge>
                        </div>
                    </div>

                    {adaptations.recommendations?.map((rec, idx) => (
                        <div key={idx} className={`p-3 border-2 rounded-lg ${rec.priority === 'high' ? 'border-red-300 bg-red-50' : rec.priority === 'medium' ? 'border-amber-300 bg-amber-50' : 'border-blue-300 bg-blue-50'}`}>
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-sm">{rec.type}</h4>
                                <Badge variant="outline" className="text-xs">{rec.priority}</Badge>
                            </div>
                            <p className="text-sm text-slate-700 mb-1">{rec.action}</p>
                            <p className="text-xs text-slate-600 italic">{rec.reason}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {adaptations.path_adjustments && (
                <Card className="border-0 shadow-lg bg-green-50">
                    <CardHeader>
                        <CardTitle className="text-base text-green-700">🛤️ Path Adjustments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {adaptations.path_adjustments.add_remedial && (
                            <p className="text-slate-700">✓ Adding remedial content to strengthen foundations</p>
                        )}
                        {adaptations.path_adjustments.add_practice && (
                            <p className="text-slate-700">✓ Including additional practice exercises</p>
                        )}
                        {adaptations.path_adjustments.focus_topics?.length > 0 && (
                            <div>
                                <p className="font-semibold text-green-900 mb-1">Focus Topics:</p>
                                <div className="flex flex-wrap gap-1">
                                    {adaptations.path_adjustments.focus_topics.map((topic, idx) => (
                                        <Badge key={idx} className="bg-green-200 text-green-900">{topic}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-center">
                <Button onClick={analyzeAndAdapt} variant="outline" size="sm">
                    Re-analyze Performance
                </Button>
            </div>
        </div>
    );
}