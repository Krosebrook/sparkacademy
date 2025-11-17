import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Target, TrendingUp, BookOpen, ExternalLink, MessageSquare, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SkillGapAnalysis({ userEmail }) {
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        performAnalysis();
    }, [userEmail]);

    const performAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const [enrollments, courses, careerPaths, learningPaths, savedResources] = await Promise.all([
                base44.entities.Enrollment.filter({ student_email: userEmail }),
                base44.entities.Course.list(),
                base44.entities.CareerPath.filter({ user_email: userEmail }),
                base44.entities.LearningPath.list(),
                base44.entities.SavedResource.filter({ user_email: userEmail })
            ]);

            const completedCourses = enrollments
                .filter(e => e.completion_percentage === 100)
                .map(e => courses.find(c => c.id === e.course_id))
                .filter(Boolean);

            const skillsAcquired = [...new Set(
                completedCourses.flatMap(c => c.skills_taught || [])
            )];

            const avgQuizScore = enrollments
                .flatMap(e => e.progress || [])
                .filter(p => p.quiz_score)
                .reduce((sum, p, _, arr) => sum + p.quiz_score / arr.length, 0) || 0;

            const projectsCompleted = enrollments
                .flatMap(e => e.progress || [])
                .filter(p => p.project_submitted).length;

            const latestCareerPath = careerPaths.sort((a, b) => 
                new Date(b.created_date) - new Date(a.created_date)
            )[0];

            if (!latestCareerPath) {
                setAnalysis({ noCareerPath: true });
                setIsAnalyzing(false);
                return;
            }

            const prompt = `Analyze this student's learning profile against their career goal and provide a comprehensive skill gap report.

CAREER GOAL: ${latestCareerPath.target_role}
TARGET ROLE CATEGORY: ${latestCareerPath.role_category}

STUDENT'S CURRENT PROFILE:
- Completed Courses: ${completedCourses.map(c => c.title).join(", ") || "None"}
- Skills Acquired: ${skillsAcquired.join(", ") || "None"}
- Average Assessment Score: ${avgQuizScore.toFixed(1)}%
- Projects Completed: ${projectsCompleted}
- Current Skills from Career Path: ${latestCareerPath.current_skills?.join(", ") || "None"}

REQUIRED SKILLS FOR TARGET ROLE:
${latestCareerPath.required_skills?.map(s => `- ${s.skill} (Target: ${s.proficiency_level}, Current: ${s.current_level || "None"})`).join("\n")}

AVAILABLE INTERNAL COURSES:
${courses.filter(c => c.is_published).map(c => `- ${c.title} (${c.level}) - Skills: ${c.skills_taught?.join(", ") || "General"}`).join("\n")}

Provide a detailed skill gap analysis with:
1. Overall readiness score (0-100) for the target role
2. Critical skill gaps that need immediate attention
3. Intermediate gaps for mid-term development
4. Advanced skills to pursue later
5. For each gap, recommend:
   - Specific internal courses (from available list)
   - Types of external resources needed
   - Whether AI mentor sessions would help
   - Estimated time to bridge the gap
6. A structured learning roadmap with priority order
7. Career readiness insights and next steps`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        readiness_score: { type: "number" },
                        readiness_level: { type: "string" },
                        summary: { type: "string" },
                        critical_gaps: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    skill: { type: "string" },
                                    current_level: { type: "string" },
                                    target_level: { type: "string" },
                                    priority: { type: "string" },
                                    impact: { type: "string" },
                                    recommendations: {
                                        type: "object",
                                        properties: {
                                            internal_courses: { type: "array", items: { type: "string" } },
                                            external_resources: { type: "array", items: { type: "string" } },
                                            mentor_topics: { type: "array", items: { type: "string" } },
                                            estimated_weeks: { type: "number" }
                                        }
                                    }
                                }
                            }
                        },
                        intermediate_gaps: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    skill: { type: "string" },
                                    current_level: { type: "string" },
                                    target_level: { type: "string" },
                                    recommendations: {
                                        type: "object",
                                        properties: {
                                            internal_courses: { type: "array", items: { type: "string" } },
                                            external_resources: { type: "array", items: { type: "string" } },
                                            estimated_weeks: { type: "number" }
                                        }
                                    }
                                }
                            }
                        },
                        advanced_skills: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    skill: { type: "string" },
                                    purpose: { type: "string" },
                                    when_to_learn: { type: "string" }
                                }
                            }
                        },
                        learning_roadmap: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    phase: { type: "string" },
                                    duration: { type: "string" },
                                    focus_areas: { type: "array", items: { type: "string" } },
                                    milestones: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        next_steps: { type: "array", items: { type: "string" } },
                        career_insights: { type: "string" }
                    }
                }
            });

            const enrichedAnalysis = {
                ...result,
                careerGoal: latestCareerPath.target_role,
                currentSkills: skillsAcquired,
                completedCoursesCount: completedCourses.length,
                avgScore: avgQuizScore
            };

            setAnalysis(enrichedAnalysis);
        } catch (error) {
            console.error("Error performing analysis:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            critical: "bg-red-100 text-red-800 border-red-300",
            high: "bg-orange-100 text-orange-800 border-orange-300",
            medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
            low: "bg-blue-100 text-blue-800 border-blue-300"
        };
        return colors[priority?.toLowerCase()] || colors.medium;
    };

    if (isAnalyzing) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
                    <p className="text-slate-600">Analyzing your learning profile and career goals...</p>
                </CardContent>
            </Card>
        );
    }

    if (analysis?.noCareerPath) {
        return (
            <Card className="border-0 shadow-lg bg-amber-50">
                <CardContent className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-600" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Career Goal Set</h3>
                    <p className="text-slate-700 mb-4">
                        Set a career goal first to receive personalized skill gap analysis
                    </p>
                    <Button onClick={() => navigate(createPageUrl("CareerPathing"))}>
                        Set Career Goal
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!analysis) return null;

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-6 w-6 text-violet-600" />
                        Skill Gap Report: {analysis.careerGoal}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Career Readiness</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-bold text-violet-600">
                                        {analysis.readiness_score}%
                                    </span>
                                    <Badge className="bg-violet-600 text-white">
                                        {analysis.readiness_level}
                                    </Badge>
                                </div>
                                <Progress value={analysis.readiness_score} className="h-3" />
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Your Progress</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-slate-600">Courses Completed</p>
                                    <p className="text-2xl font-bold text-slate-900">{analysis.completedCoursesCount}</p>
                                </div>
                                <div>
                                    <p className="text-slate-600">Avg Score</p>
                                    <p className="text-2xl font-bold text-slate-900">{analysis.avgScore.toFixed(0)}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-white border border-violet-200 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-2">Summary</h4>
                        <p className="text-sm text-slate-700">{analysis.summary}</p>
                    </div>
                </CardContent>
            </Card>

            {analysis.critical_gaps?.length > 0 && (
                <Card className="border-0 shadow-lg border-l-4 border-l-red-500">
                    <CardHeader>
                        <CardTitle className="text-red-700">🚨 Critical Skill Gaps</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {analysis.critical_gaps.map((gap, idx) => (
                            <div key={idx} className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-900">{gap.skill}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                                Current: {gap.current_level}
                                            </Badge>
                                            <span className="text-slate-400">→</span>
                                            <Badge variant="outline" className="text-xs">
                                                Target: {gap.target_level}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Badge className={getPriorityColor(gap.priority)}>
                                        {gap.priority}
                                    </Badge>
                                </div>

                                <p className="text-sm text-slate-700 mb-3">{gap.impact}</p>

                                {gap.recommendations && (
                                    <div className="space-y-3">
                                        {gap.recommendations.internal_courses?.length > 0 && (
                                            <div>
                                                <h5 className="text-xs font-semibold text-slate-900 mb-1 flex items-center gap-1">
                                                    <BookOpen className="h-3 w-3" />
                                                    Recommended Courses
                                                </h5>
                                                <div className="flex flex-wrap gap-1">
                                                    {gap.recommendations.internal_courses.map((course, cidx) => (
                                                        <Badge key={cidx} variant="secondary" className="text-xs">
                                                            {course}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {gap.recommendations.external_resources?.length > 0 && (
                                            <div>
                                                <h5 className="text-xs font-semibold text-slate-900 mb-1 flex items-center gap-1">
                                                    <ExternalLink className="h-3 w-3" />
                                                    External Resources
                                                </h5>
                                                <ul className="text-xs text-slate-700 space-y-1">
                                                    {gap.recommendations.external_resources.map((resource, ridx) => (
                                                        <li key={ridx}>• {resource}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {gap.recommendations.mentor_topics?.length > 0 && (
                                            <div>
                                                <h5 className="text-xs font-semibold text-slate-900 mb-1 flex items-center gap-1">
                                                    <MessageSquare className="h-3 w-3" />
                                                    AI Mentor Sessions
                                                </h5>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => navigate(createPageUrl("AIMentor"))}
                                                    className="text-xs"
                                                >
                                                    Start Mentor Session on {gap.skill}
                                                </Button>
                                            </div>
                                        )}

                                        {gap.recommendations.estimated_weeks && (
                                            <p className="text-xs text-slate-600">
                                                ⏱️ Estimated: {gap.recommendations.estimated_weeks} weeks
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {analysis.intermediate_gaps?.length > 0 && (
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-amber-700">⚡ Intermediate Development Areas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {analysis.intermediate_gaps.map((gap, idx) => (
                            <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-slate-900">{gap.skill}</h4>
                                    <div className="flex items-center gap-1 text-xs text-slate-600">
                                        {gap.current_level} → {gap.target_level}
                                    </div>
                                </div>
                                {gap.recommendations?.internal_courses?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {gap.recommendations.internal_courses.map((course, cidx) => (
                                            <Badge key={cidx} variant="outline" className="text-xs">
                                                {course}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Your Learning Roadmap
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analysis.learning_roadmap?.map((phase, idx) => (
                            <div key={idx} className="relative pl-8 pb-4 border-l-2 border-blue-200 last:border-0">
                                <div className="absolute -left-3 top-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {idx + 1}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{phase.phase}</h4>
                                    <p className="text-sm text-slate-600 mb-2">Duration: {phase.duration}</p>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-slate-700">Focus Areas:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {phase.focus_areas?.map((area, aidx) => (
                                                <Badge key={aidx} variant="secondary" className="text-xs">
                                                    {area}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-green-50">
                <CardHeader>
                    <CardTitle className="text-green-700">🎯 Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {analysis.next_steps?.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="font-bold text-green-600">{idx + 1}.</span>
                                <span className="text-slate-700">{step}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {analysis.career_insights && (
                <Card className="border-0 shadow-lg bg-blue-50">
                    <CardHeader>
                        <CardTitle>💡 Career Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-700">{analysis.career_insights}</p>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-center">
                <Button onClick={performAnalysis} variant="outline">
                    Refresh Analysis
                </Button>
            </div>
        </div>
    );
}