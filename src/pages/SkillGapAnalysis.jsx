import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Target, BookOpen, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SkillGapAnalysis() {
    const [user, setUser] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        setIsLoading(true);
        const userData = await base44.auth.me();
        setUser(userData);
        setIsLoading(false);
    };

    const generateAnalysis = async () => {
        setIsGenerating(true);
        try {
            const enrollments = await base44.entities.Enrollment.filter({ student_email: user.email });
            const allCourses = await base44.entities.Course.list();
            const enrolledCourses = allCourses.filter(c => enrollments.some(e => e.course_id === c.id));

            const enrollmentData = enrollments.map(e => {
                const course = enrolledCourses.find(c => c.id === e.course_id);
                return {
                    courseTitle: course?.title,
                    category: course?.category,
                    completionPercentage: e.completion_percentage || 0,
                    progress: e.progress || [],
                    skillsTaught: course?.skills_taught || []
                };
            });

            const prompt = `Analyze this student's learning performance and identify skill gaps:

Student Learning Data:
${JSON.stringify(enrollmentData, null, 2)}

Provide:
1. Strengths: Skills they excel at (based on high quiz scores and completion)
2. Weaknesses: Skills needing improvement (based on low scores or incomplete lessons)
3. Skill gaps: Missing skills they should develop
4. Targeted recommendations: Specific lessons or external resources to address gaps
5. Overall proficiency score (0-100)

Be specific and actionable.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        strengths: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    skill: { type: "string" },
                                    proficiency: { type: "number" },
                                    evidence: { type: "string" }
                                }
                            }
                        },
                        weaknesses: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    skill: { type: "string" },
                                    proficiency: { type: "number" },
                                    issue: { type: "string" }
                                }
                            }
                        },
                        skill_gaps: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    skill: { type: "string" },
                                    importance: { type: "string" },
                                    reason: { type: "string" }
                                }
                            }
                        },
                        recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    type: { type: "string" },
                                    description: { type: "string" },
                                    link: { type: "string" }
                                }
                            }
                        },
                        overall_proficiency: { type: "number" },
                        summary: { type: "string" }
                    }
                }
            });

            setAnalysis(result);
        } catch (error) {
            console.error("Error generating analysis:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Skill Gap Analysis</h1>
                    <p className="text-slate-600">Discover your strengths and areas for improvement</p>
                </div>

                {!analysis ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <Target className="h-16 w-16 mx-auto mb-6 text-violet-600" />
                            <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                                Get Your Personalized Skill Analysis
                            </h3>
                            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                                Our AI will analyze your course progress, quiz performance, and completed lessons to identify your strengths, weaknesses, and skill gaps. You'll receive targeted recommendations to enhance your learning.
                            </p>
                            <Button
                                onClick={generateAnalysis}
                                disabled={isGenerating}
                                size="lg"
                                className="bg-gradient-to-r from-violet-600 to-purple-600"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Analyzing Your Skills...
                                    </>
                                ) : (
                                    <>
                                        <Target className="w-5 h-5 mr-2" />
                                        Generate Analysis
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <Card className="border-0 shadow-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-2xl font-bold">Overall Proficiency</h3>
                                    <div className="text-4xl font-bold">{analysis.overall_proficiency}%</div>
                                </div>
                                <Progress value={analysis.overall_proficiency} className="h-3 mb-4 bg-white/20" />
                                <p className="text-white/90">{analysis.summary}</p>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-600">
                                        <TrendingUp className="h-5 w-5" />
                                        Strengths
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {analysis.strengths?.map((strength, idx) => (
                                        <div key={idx} className="border-l-4 border-green-500 pl-4 py-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-slate-900">{strength.skill}</h4>
                                                <Badge className="bg-green-100 text-green-800">
                                                    {strength.proficiency}%
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600">{strength.evidence}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-amber-600">
                                        <TrendingDown className="h-5 w-5" />
                                        Areas for Improvement
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {analysis.weaknesses?.map((weakness, idx) => (
                                        <div key={idx} className="border-l-4 border-amber-500 pl-4 py-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-slate-900">{weakness.skill}</h4>
                                                <Badge className="bg-amber-100 text-amber-800">
                                                    {weakness.proficiency}%
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600">{weakness.issue}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-600">
                                    <Target className="h-5 w-5" />
                                    Skill Gaps to Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {analysis.skill_gaps?.map((gap, idx) => (
                                        <div key={idx} className="border border-red-200 rounded-lg p-4 bg-red-50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-semibold text-slate-900">{gap.skill}</h4>
                                                <Badge variant="outline" className="text-red-600 border-red-600">
                                                    {gap.importance}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600">{gap.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-violet-600">
                                    <BookOpen className="h-5 w-5" />
                                    Recommended Learning Path
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {analysis.recommendations?.map((rec, idx) => (
                                        <div key={idx} className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:border-violet-300 hover:shadow-md transition-all">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                                                    <Badge variant="secondary">{rec.type}</Badge>
                                                </div>
                                                <p className="text-sm text-slate-600">{rec.description}</p>
                                            </div>
                                            {rec.link && (
                                                <a
                                                    href={rec.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-violet-600 hover:text-violet-700"
                                                >
                                                    <ExternalLink className="h-5 w-5" />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="text-center">
                            <Button
                                onClick={generateAnalysis}
                                variant="outline"
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Regenerating...
                                    </>
                                ) : (
                                    "Regenerate Analysis"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}