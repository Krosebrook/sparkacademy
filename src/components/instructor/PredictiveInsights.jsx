import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, TrendingDown, Brain } from "lucide-react";

export default function PredictiveInsights({ instructorEmail }) {
    const [insights, setInsights] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(true);

    useEffect(() => {
        generateInsights();
    }, [instructorEmail]);

    const generateInsights = async () => {
        setIsAnalyzing(true);
        try {
            const courses = await base44.entities.Course.filter({ created_by: instructorEmail });
            const courseIds = courses.map(c => c.id);
            
            const enrollments = await Promise.all(
                courseIds.map(id => base44.entities.Enrollment.filter({ course_id: id }))
            );
            const flatEnrollments = enrollments.flat();

            // Calculate risk indicators
            const atRiskStudents = flatEnrollments.filter(e => {
                const daysSinceActivity = e.last_activity_date 
                    ? (new Date() - new Date(e.last_activity_date)) / (1000 * 60 * 60 * 24)
                    : 999;
                const lowCompletion = (e.completion_percentage || 0) < 30;
                const lowStreak = (e.current_streak_days || 0) === 0;
                const poorQuizPerformance = e.progress?.some(p => p.quiz_score && p.quiz_score < 60);

                return daysSinceActivity > 7 || (lowCompletion && (lowStreak || poorQuizPerformance));
            });

            const prompt = `You are a predictive analytics AI. Analyze this educational data and provide insights:

ENROLLMENT DATA:
- Total Students: ${flatEnrollments.length}
- At-Risk Students: ${atRiskStudents.length}
- Average Completion: ${flatEnrollments.reduce((s, e) => s + (e.completion_percentage || 0), 0) / (flatEnrollments.length || 1)}%

AT-RISK INDICATORS:
${atRiskStudents.slice(0, 20).map(e => `
- Student: ${e.student_email}
  Completion: ${e.completion_percentage}%
  Streak: ${e.current_streak_days || 0} days
  Last Activity: ${e.last_activity_date || 'Never'}
`).join('\n')}

Provide:
1. Predicted drop-off rate for next 30 days
2. Early warning signs to watch for
3. Students most likely to succeed (identify patterns)
4. Intervention strategies for at-risk students
5. Optimal timing for instructor interventions
6. Course completion predictions
7. Factors most correlated with success`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        predicted_drop_off_rate: { type: "number" },
                        early_warning_signs: { type: "array", items: { type: "string" } },
                        success_patterns: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    pattern: { type: "string" },
                                    correlation_strength: { type: "string" }
                                }
                            }
                        },
                        intervention_strategies: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    risk_level: { type: "string" },
                                    strategy: { type: "string" },
                                    timing: { type: "string" },
                                    expected_impact: { type: "string" }
                                }
                            }
                        },
                        completion_forecast: {
                            type: "object",
                            properties: {
                                next_30_days: { type: "number" },
                                next_60_days: { type: "number" },
                                next_90_days: { type: "number" }
                            }
                        },
                        success_factors: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setInsights({ ...result, atRiskCount: atRiskStudents.length, totalStudents: flatEnrollments.length });
        } catch (error) {
            console.error("Error generating insights:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (isAnalyzing) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">Generating predictive insights...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        Risk Assessment
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-white border-2 border-red-200 rounded-lg text-center">
                            <p className="text-sm text-slate-600 mb-1">At-Risk Students</p>
                            <p className="text-4xl font-bold text-red-600">{insights?.atRiskCount || 0}</p>
                            <p className="text-xs text-slate-500">
                                {((insights?.atRiskCount / insights?.totalStudents) * 100).toFixed(1)}% of total
                            </p>
                        </div>
                        <div className="p-4 bg-white border-2 border-orange-200 rounded-lg text-center">
                            <p className="text-sm text-slate-600 mb-1">Predicted Drop-off (30d)</p>
                            <p className="text-4xl font-bold text-orange-600">{insights?.predicted_drop_off_rate || 0}%</p>
                            <p className="text-xs text-slate-500">Next month forecast</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Early Warning Signs:</h4>
                        <ul className="space-y-1">
                            {insights?.early_warning_signs?.map((sign, idx) => (
                                <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                                    <span className="text-red-600 mt-0.5">⚠</span>
                                    <span>{sign}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>Intervention Strategies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {insights?.intervention_strategies?.map((strategy, idx) => (
                        <div key={idx} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className={
                                    strategy.risk_level === 'high' ? 'bg-red-600' :
                                    strategy.risk_level === 'medium' ? 'bg-amber-600' : 'bg-blue-600'
                                }>
                                    {strategy.risk_level} risk
                                </Badge>
                                <span className="text-xs text-slate-600">{strategy.timing}</span>
                            </div>
                            <p className="font-semibold text-sm mb-1">{strategy.strategy}</p>
                            <p className="text-xs text-slate-600">Expected: {strategy.expected_impact}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-green-50">
                <CardHeader>
                    <CardTitle className="text-green-700">Success Patterns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {insights?.success_patterns?.map((pattern, idx) => (
                        <div key={idx} className="p-3 bg-white border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">{pattern.pattern}</p>
                                <Badge variant="outline">{pattern.correlation_strength}</Badge>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {insights?.completion_forecast && (
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-purple-600" />
                            Completion Forecast
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-600 mb-1">30 Days</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {insights.completion_forecast.next_30_days}
                                </p>
                                <p className="text-xs text-slate-500">completions</p>
                            </div>
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-600 mb-1">60 Days</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {insights.completion_forecast.next_60_days}
                                </p>
                                <p className="text-xs text-slate-500">completions</p>
                            </div>
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-600 mb-1">90 Days</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {insights.completion_forecast.next_90_days}
                                </p>
                                <p className="text-xs text-slate-500">completions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Button onClick={generateInsights} variant="outline" className="w-full">
                Refresh Predictions
            </Button>
        </div>
    );
}