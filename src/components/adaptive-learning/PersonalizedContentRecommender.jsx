import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Video, FileText, Zap, Target, ExternalLink } from "lucide-react";

export default function PersonalizedContentRecommender({ userEmail, courseId, learningStyle }) {
    const [recommendations, setRecommendations] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (learningStyle) {
            generateRecommendations();
        }
    }, [learningStyle, courseId]);

    const generateRecommendations = async () => {
        setIsGenerating(true);
        try {
            const [course, enrollment] = await Promise.all([
                base44.entities.Course.get(courseId),
                base44.entities.Enrollment.filter({ student_email: userEmail, course_id: courseId })
            ]);

            const currentEnrollment = enrollment[0];
            const recentProgress = currentEnrollment?.progress?.slice(-3) || [];
            const avgRecentScore = recentProgress.reduce((sum, p) => sum + (p.quiz_score || 0), 0) / (recentProgress.length || 1);

            const prompt = `Generate personalized learning content recommendations for this student:

STUDENT LEARNING PROFILE:
- Primary Style: ${learningStyle.primary_style}
- Preferred Formats: ${learningStyle.preferred_formats?.join(", ")}
- Learning Pace: ${learningStyle.learning_pace}
- Content Preferences: Videos ${learningStyle.content_preferences?.videos}%, Articles ${learningStyle.content_preferences?.articles}%, Interactive ${learningStyle.content_preferences?.interactive}%, Practice ${learningStyle.content_preferences?.practice}%

COURSE: ${course.title}
RECENT PERFORMANCE: ${avgRecentScore.toFixed(1)}% average on last ${recentProgress.length} lessons

Based on their learning style and performance, recommend:
1. Video content (YouTube tutorials, courses) - 3-5 specific recommendations
2. Articles/Reading materials (blogs, documentation) - 3-5 specific recommendations
3. Interactive exercises (coding platforms, simulations) - 3-5 specific recommendations
4. Practice projects - 2-3 hands-on projects
5. Optimal study schedule for this student
6. Content consumption strategy

Tailor recommendations to their primary learning style and current performance level.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        videos: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    duration: { type: "string" },
                                    relevance: { type: "string" }
                                }
                            }
                        },
                        articles: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    reading_time: { type: "string" },
                                    difficulty: { type: "string" }
                                }
                            }
                        },
                        interactive_exercises: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    platform: { type: "string" },
                                    description: { type: "string" },
                                    estimated_time: { type: "string" }
                                }
                            }
                        },
                        practice_projects: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    skills_practiced: { type: "array", items: { type: "string" } },
                                    difficulty: { type: "string" }
                                }
                            }
                        },
                        study_schedule: {
                            type: "object",
                            properties: {
                                weekly_hours: { type: "number" },
                                sessions_per_week: { type: "number" },
                                optimal_duration: { type: "string" },
                                breakdown: { type: "array", items: { type: "string" } }
                            }
                        },
                        strategy: { type: "string" }
                    }
                }
            });

            setRecommendations(result);
        } catch (error) {
            console.error("Error generating recommendations:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (isGenerating) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-600">Generating personalized recommendations...</p>
                </CardContent>
            </Card>
        );
    }

    if (!recommendations) return null;

    return (
        <div className="space-y-4">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        Personalized Learning Strategy
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-700 mb-4">{recommendations.strategy}</p>
                    {recommendations.study_schedule && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-sm text-blue-900 mb-2">Recommended Study Schedule</h4>
                            <div className="grid grid-cols-3 gap-3 text-xs mb-2">
                                <div>
                                    <p className="text-slate-600">Weekly Hours</p>
                                    <p className="text-lg font-bold text-blue-600">{recommendations.study_schedule.weekly_hours}</p>
                                </div>
                                <div>
                                    <p className="text-slate-600">Sessions/Week</p>
                                    <p className="text-lg font-bold text-blue-600">{recommendations.study_schedule.sessions_per_week}</p>
                                </div>
                                <div>
                                    <p className="text-slate-600">Duration</p>
                                    <p className="text-lg font-bold text-blue-600">{recommendations.study_schedule.optimal_duration}</p>
                                </div>
                            </div>
                            <ul className="text-xs text-slate-700 space-y-1">
                                {recommendations.study_schedule.breakdown?.map((item, idx) => (
                                    <li key={idx}>• {item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Video className="h-5 w-5 text-red-600" />
                        Video Learning Resources
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {recommendations.videos?.map((video, idx) => (
                        <div key={idx} className="p-3 border border-slate-200 rounded-lg hover:border-red-300 transition-colors">
                            <div className="flex items-start justify-between mb-1">
                                <h4 className="font-semibold text-sm">{video.title}</h4>
                                <Badge variant="outline" className="text-xs">{video.duration}</Badge>
                            </div>
                            <p className="text-xs text-slate-600 mb-2">{video.description}</p>
                            <p className="text-xs text-red-700 italic">{video.relevance}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-5 w-5 text-green-600" />
                        Reading Materials
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {recommendations.articles?.map((article, idx) => (
                        <div key={idx} className="p-3 border border-slate-200 rounded-lg hover:border-green-300 transition-colors">
                            <div className="flex items-start justify-between mb-1">
                                <h4 className="font-semibold text-sm">{article.title}</h4>
                                <div className="flex gap-1">
                                    <Badge variant="outline" className="text-xs">{article.reading_time}</Badge>
                                    <Badge className="bg-green-100 text-green-800 text-xs">{article.difficulty}</Badge>
                                </div>
                            </div>
                            <p className="text-xs text-slate-600">{article.description}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Zap className="h-5 w-5 text-violet-600" />
                        Interactive Exercises
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {recommendations.interactive_exercises?.map((exercise, idx) => (
                        <div key={idx} className="p-3 border border-slate-200 rounded-lg hover:border-violet-300 transition-colors">
                            <div className="flex items-start justify-between mb-1">
                                <h4 className="font-semibold text-sm">{exercise.title}</h4>
                                <Badge className="bg-violet-100 text-violet-800 text-xs">{exercise.platform}</Badge>
                            </div>
                            <p className="text-xs text-slate-600 mb-1">{exercise.description}</p>
                            <p className="text-xs text-slate-500">⏱️ {exercise.estimated_time}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Target className="h-5 w-5 text-orange-600" />
                        Hands-On Practice Projects
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {recommendations.practice_projects?.map((project, idx) => (
                        <div key={idx} className="p-4 bg-white border-2 border-orange-200 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-bold text-sm">{project.title}</h4>
                                <Badge className="bg-orange-100 text-orange-800">{project.difficulty}</Badge>
                            </div>
                            <p className="text-xs text-slate-700 mb-2">{project.description}</p>
                            <div className="flex flex-wrap gap-1">
                                {project.skills_practiced?.map((skill, sidx) => (
                                    <Badge key={sidx} variant="outline" className="text-xs">{skill}</Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="flex justify-center">
                <Button onClick={generateRecommendations} variant="outline" size="sm">
                    Refresh Recommendations
                </Button>
            </div>
        </div>
    );
}