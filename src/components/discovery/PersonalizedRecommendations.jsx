import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Target, TrendingUp, BookOpen } from "lucide-react";
import RecommendedContent from "./RecommendedContent";

export default function PersonalizedRecommendations({ userEmail }) {
    const [recommendations, setRecommendations] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        generateRecommendations();
    }, [userEmail]);

    const generateRecommendations = async () => {
        setIsGenerating(true);
        try {
            const [enrollments, goals, careerPaths, allCourses] = await Promise.all([
                base44.entities.Enrollment.filter({ student_email: userEmail }),
                base44.entities.LearningGoal.filter({ user_email: userEmail }),
                base44.entities.CareerPath.filter({ user_email: userEmail }),
                base44.entities.Course.filter({ is_published: true })
            ]);

            const completedCourses = enrollments
                .filter(e => e.completion_percentage === 100)
                .map(e => {
                    const course = allCourses.find(c => c.id === e.course_id);
                    return course ? {
                        title: course.title,
                        category: course.category,
                        skills: course.skills_taught || []
                    } : null;
                })
                .filter(Boolean);

            const inProgressCourses = enrollments
                .filter(e => e.completion_percentage > 0 && e.completion_percentage < 100)
                .map(e => {
                    const course = allCourses.find(c => c.id === e.course_id);
                    return course ? {
                        title: course.title,
                        category: course.category,
                        progress: e.completion_percentage
                    } : null;
                })
                .filter(Boolean);

            const skillsAcquired = [...new Set(completedCourses.flatMap(c => c.skills))];
            const enrolledCourseIds = enrollments.map(e => e.course_id);
            const availableCourses = allCourses.filter(c => !enrolledCourseIds.includes(c.id));

            const activeGoals = goals.filter(g => g.status === "active");
            const latestCareerPath = careerPaths.sort((a, b) => 
                new Date(b.created_date) - new Date(a.created_date)
            )[0];

            const avgPerformance = enrollments
                .flatMap(e => e.progress || [])
                .filter(p => p.quiz_score !== undefined)
                .reduce((sum, p, _, arr) => sum + p.quiz_score / arr.length, 0) || 0;

            const prompt = `Analyze this student's learning profile and recommend personalized content:

STUDENT PROFILE:
- Completed Courses: ${completedCourses.map(c => `${c.title} (${c.category})`).join(", ") || "None"}
- Skills Acquired: ${skillsAcquired.join(", ") || "None"}
- In Progress: ${inProgressCourses.map(c => `${c.title} (${c.progress}%)`).join(", ") || "None"}
- Active Goals: ${activeGoals.map(g => `${g.title} - Target skills: ${g.target_skills.join(", ")}`).join(" | ") || "None"}
- Career Target: ${latestCareerPath?.target_role || "Not set"}
- Skill Gaps: ${latestCareerPath?.required_skills?.map(s => `${s.skill} (${s.gap})`).join(", ") || "None"}
- Avg Performance: ${avgPerformance.toFixed(1)}%

AVAILABLE COURSES:
${availableCourses.slice(0, 50).map(c => `${c.title} - ${c.category} - ${c.level} - Skills: ${c.skills_taught?.join(", ") || "General"}`).join("\n")}

Generate personalized recommendations including:
1. Top 5 recommended courses (from available courses) with detailed reasoning
2. Skill development priorities (3-5 skills to focus on)
3. External learning resources (5-7 articles, videos, or tutorials)
4. Learning path suggestions
5. Quick wins (2-3 short courses or resources for immediate impact)`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        recommended_courses: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    course_title: { type: "string" },
                                    reason: { type: "string" },
                                    relevance_score: { type: "number" },
                                    skills_gained: { type: "array", items: { type: "string" } },
                                    addresses_goals: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        skill_priorities: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    skill: { type: "string" },
                                    priority: { type: "string" },
                                    why_important: { type: "string" },
                                    resources_needed: { type: "string" }
                                }
                            }
                        },
                        external_resources: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    type: { type: "string" },
                                    description: { type: "string" },
                                    url: { type: "string" },
                                    estimated_time: { type: "string" }
                                }
                            }
                        },
                        learning_paths: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    path_name: { type: "string" },
                                    description: { type: "string" },
                                    courses: { type: "array", items: { type: "string" } },
                                    timeline: { type: "string" }
                                }
                            }
                        },
                        quick_wins: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    time_required: { type: "string" },
                                    impact: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            const enrichedCourses = result.recommended_courses.map(rec => {
                const course = availableCourses.find(c => 
                    c.title.toLowerCase().includes(rec.course_title.toLowerCase()) ||
                    rec.course_title.toLowerCase().includes(c.title.toLowerCase())
                );
                return { ...rec, course_data: course };
            });

            setRecommendations({ ...result, recommended_courses: enrichedCourses });
        } catch (error) {
            console.error("Error generating recommendations:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (isGenerating) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
                    <p className="text-slate-600">Analyzing your profile and generating personalized recommendations...</p>
                </CardContent>
            </Card>
        );
    }

    if (!recommendations) return null;

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-violet-600" />
                        Your Personalized Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600">
                        Based on your learning history, goals, and career aspirations, we've curated content specifically for you.
                    </p>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-violet-600" />
                        Skill Development Priorities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        {recommendations.skill_priorities?.map((skill, idx) => (
                            <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-slate-900">{skill.skill}</h4>
                                    <Badge className={
                                        skill.priority === "high" ? "bg-red-100 text-red-800" :
                                        skill.priority === "medium" ? "bg-amber-100 text-amber-800" :
                                        "bg-blue-100 text-blue-800"
                                    }>
                                        {skill.priority}
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-700 mb-2">{skill.why_important}</p>
                                <p className="text-xs text-slate-600">{skill.resources_needed}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-violet-600" />
                        Recommended Courses
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recommendations.recommended_courses?.map((course, idx) => (
                            <RecommendedContent key={idx} content={course} type="course" />
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>External Learning Resources</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        {recommendations.external_resources?.map((resource, idx) => (
                            <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:border-violet-300 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-slate-900">{resource.title}</h4>
                                    <Badge variant="outline">{resource.type}</Badge>
                                </div>
                                <p className="text-sm text-slate-700 mb-3">{resource.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-600">{resource.estimated_time}</span>
                                    <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-violet-600 hover:text-violet-700 font-semibold"
                                    >
                                        View Resource →
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-violet-600" />
                        Quick Wins
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recommendations.quick_wins?.map((win, idx) => (
                            <div key={idx} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-bold text-slate-900 mb-1">{win.title}</h4>
                                <p className="text-sm text-slate-700 mb-2">{win.description}</p>
                                <div className="flex items-center gap-4 text-xs">
                                    <span className="text-slate-600">⏱️ {win.time_required}</span>
                                    <span className="text-green-700 font-semibold">Impact: {win.impact}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>Suggested Learning Paths</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recommendations.learning_paths?.map((path, idx) => (
                            <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                                <h4 className="font-bold text-slate-900 mb-2">{path.path_name}</h4>
                                <p className="text-sm text-slate-700 mb-3">{path.description}</p>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {path.courses.map((course, cidx) => (
                                        <Badge key={cidx} variant="secondary">{course}</Badge>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-600">Timeline: {path.timeline}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center">
                <Button
                    onClick={generateRecommendations}
                    variant="outline"
                    size="sm"
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Refresh Recommendations
                </Button>
            </div>
        </div>
    );
}