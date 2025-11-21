import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Eye, Headphones, Users, BookOpen } from "lucide-react";

export default function LearningStyleAnalyzer({ userEmail, onStyleIdentified }) {
    const [learningStyle, setLearningStyle] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        analyzeLearningStyle();
    }, [userEmail]);

    const analyzeLearningStyle = async () => {
        setIsAnalyzing(true);
        try {
            const [enrollments, courses, analytics] = await Promise.all([
                base44.entities.Enrollment.filter({ student_email: userEmail }),
                base44.entities.Course.list(),
                base44.entities.CourseAnalytics.filter({ student_email: userEmail })
            ]);

            const engagementData = analytics.map(a => ({
                courseId: a.course_id,
                lessonViews: a.lesson_views || [],
                totalTime: a.total_time_in_course || 0,
                engagementScore: a.engagement_score || 0
            }));

            const performanceData = enrollments.map(e => ({
                courseId: e.course_id,
                progress: e.progress || [],
                completionRate: e.completion_percentage || 0,
                avgQuizScore: (e.progress?.reduce((sum, p) => sum + (p.quiz_score || 0), 0) / (e.progress?.length || 1)) || 0
            }));

            const prompt = `Analyze this student's learning behavior and identify their learning style:

ENGAGEMENT PATTERNS:
${engagementData.map(e => `- Course: ${e.courseId}, Time spent: ${Math.round(e.totalTime / 60)}min, Engagement: ${e.engagementScore}%`).join('\n')}

PERFORMANCE DATA:
${performanceData.map(p => `- Course: ${p.courseId}, Completion: ${p.completionRate}%, Avg Score: ${p.avgQuizScore.toFixed(1)}%`).join('\n')}

Based on VARK learning styles (Visual, Auditory, Reading/Writing, Kinesthetic) and engagement patterns, identify:
1. Primary learning style
2. Secondary learning style
3. Preferred content formats
4. Optimal learning pace
5. Best times for learning (if detectable)
6. Strengths and areas for improvement
7. Personalized study recommendations`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        primary_style: { type: "string", enum: ["visual", "auditory", "reading", "kinesthetic", "mixed"] },
                        secondary_style: { type: "string" },
                        style_description: { type: "string" },
                        preferred_formats: {
                            type: "array",
                            items: { type: "string" }
                        },
                        learning_pace: { type: "string", enum: ["fast", "moderate", "slow", "self-paced"] },
                        optimal_session_length: { type: "string" },
                        strengths: { type: "array", items: { type: "string" } },
                        improvement_areas: { type: "array", items: { type: "string" } },
                        study_recommendations: { type: "array", items: { type: "string" } },
                        content_preferences: {
                            type: "object",
                            properties: {
                                videos: { type: "number" },
                                articles: { type: "number" },
                                interactive: { type: "number" },
                                practice: { type: "number" }
                            }
                        }
                    }
                }
            });

            setLearningStyle(result);
            if (onStyleIdentified) {
                onStyleIdentified(result);
            }
        } catch (error) {
            console.error("Error analyzing learning style:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getStyleIcon = (style) => {
        const icons = {
            visual: Eye,
            auditory: Headphones,
            reading: BookOpen,
            kinesthetic: Users,
            mixed: Brain
        };
        return icons[style] || Brain;
    };

    const getStyleColor = (style) => {
        const colors = {
            visual: "bg-blue-100 text-blue-800 border-blue-300",
            auditory: "bg-purple-100 text-purple-800 border-purple-300",
            reading: "bg-green-100 text-green-800 border-green-300",
            kinesthetic: "bg-orange-100 text-orange-800 border-orange-300",
            mixed: "bg-violet-100 text-violet-800 border-violet-300"
        };
        return colors[style] || colors.mixed;
    };

    if (isAnalyzing) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-violet-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">Analyzing your learning style...</p>
                </CardContent>
            </Card>
        );
    }

    if (!learningStyle) return null;

    const StyleIcon = getStyleIcon(learningStyle.primary_style);

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-violet-600" />
                    Your Learning Style Profile
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
                        <StyleIcon className="h-8 w-8 text-violet-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className={getStyleColor(learningStyle.primary_style)}>
                                {learningStyle.primary_style?.toUpperCase()}
                            </Badge>
                            {learningStyle.secondary_style && (
                                <Badge variant="outline">{learningStyle.secondary_style}</Badge>
                            )}
                        </div>
                        <p className="text-sm text-slate-700">{learningStyle.style_description}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border">
                        <h4 className="text-xs font-semibold text-slate-900 mb-2">Preferred Formats</h4>
                        <div className="flex flex-wrap gap-1">
                            {learningStyle.preferred_formats?.map((format, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">{format}</Badge>
                            ))}
                        </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                        <h4 className="text-xs font-semibold text-slate-900 mb-2">Learning Pace</h4>
                        <Badge className="bg-blue-100 text-blue-800">{learningStyle.learning_pace}</Badge>
                        <p className="text-xs text-slate-600 mt-1">
                            Session: {learningStyle.optimal_session_length}
                        </p>
                    </div>
                </div>

                {learningStyle.content_preferences && (
                    <div className="p-3 bg-white rounded-lg border">
                        <h4 className="text-xs font-semibold text-slate-900 mb-2">Content Preference Scores</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div className="text-center">
                                <p className="text-slate-600">Videos</p>
                                <p className="text-lg font-bold text-violet-600">{learningStyle.content_preferences.videos}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-slate-600">Articles</p>
                                <p className="text-lg font-bold text-green-600">{learningStyle.content_preferences.articles}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-slate-600">Interactive</p>
                                <p className="text-lg font-bold text-blue-600">{learningStyle.content_preferences.interactive}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-slate-600">Practice</p>
                                <p className="text-lg font-bold text-orange-600">{learningStyle.content_preferences.practice}%</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="text-xs font-semibold text-green-900 mb-1">✓ Strengths</h4>
                        <ul className="text-xs text-slate-700 space-y-0.5">
                            {learningStyle.strengths?.map((s, idx) => (
                                <li key={idx}>• {s}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <h4 className="text-xs font-semibold text-amber-900 mb-1">⚡ Growth Areas</h4>
                        <ul className="text-xs text-slate-700 space-y-0.5">
                            {learningStyle.improvement_areas?.map((a, idx) => (
                                <li key={idx}>• {a}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-xs font-semibold text-blue-900 mb-1">💡 Study Recommendations</h4>
                    <ul className="text-xs text-slate-700 space-y-0.5">
                        {learningStyle.study_recommendations?.map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}