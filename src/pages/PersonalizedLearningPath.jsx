import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, Target, TrendingUp, BookOpen, Award, Calendar, CheckCircle } from "lucide-react";
import GoalManager from "@/components/learning/GoalManager";
import { createPageUrl } from "@/utils";

export default function PersonalizedLearningPath() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [learningPath, setLearningPath] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [performanceData, setPerformanceData] = useState(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        setIsLoading(true);
        const userData = await base44.auth.me();
        setUser(userData);

        const enrollments = await base44.entities.Enrollment.filter({ student_email: userData.email });
        const courses = await base44.entities.Course.list();
        
        const avgCompletion = enrollments.length > 0
            ? enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / enrollments.length
            : 0;

        const completedCourses = enrollments.filter(e => e.completion_percentage === 100);
        const skillsAcquired = new Set();
        completedCourses.forEach(enrollment => {
            const course = courses.find(c => c.id === enrollment.course_id);
            course?.skills_taught?.forEach(skill => skillsAcquired.add(skill));
        });

        setPerformanceData({
            totalEnrollments: enrollments.length,
            completedCourses: completedCourses.length,
            avgCompletion,
            skillsAcquired: Array.from(skillsAcquired),
            recentActivity: enrollments.sort((a, b) => 
                new Date(b.last_activity_date || 0) - new Date(a.last_activity_date || 0)
            ).slice(0, 3)
        });

        setIsLoading(false);
    };

    const generatePersonalizedPath = async () => {
        setIsGenerating(true);
        try {
            const enrollments = await base44.entities.Enrollment.filter({ student_email: user.email });
            const allCourses = await base44.entities.Course.filter({ is_published: true });
            const goals = await base44.entities.LearningGoal.filter({ 
                user_email: user.email,
                status: "active"
            });

            const enrolledCourseIds = enrollments.map(e => e.course_id);
            const availableCourses = allCourses.filter(c => !enrolledCourseIds.includes(c.id));

            const completedCourses = enrollments
                .filter(e => e.completion_percentage === 100)
                .map(e => {
                    const course = allCourses.find(c => c.id === e.course_id);
                    return course ? `${course.title} (${course.category})` : null;
                })
                .filter(Boolean);

            const inProgressCourses = enrollments
                .filter(e => e.completion_percentage > 0 && e.completion_percentage < 100)
                .map(e => {
                    const course = allCourses.find(c => c.id === e.course_id);
                    return course ? `${course.title} - ${e.completion_percentage}% complete` : null;
                })
                .filter(Boolean);

            const avgQuizScores = enrollments
                .flatMap(e => e.progress || [])
                .filter(p => p.quiz_score !== undefined)
                .map(p => p.quiz_score);

            const avgScore = avgQuizScores.length > 0
                ? avgQuizScores.reduce((a, b) => a + b, 0) / avgQuizScores.length
                : null;

            const activeGoals = goals.map(g => ({
                title: g.title,
                skills: g.target_skills,
                progress: g.progress_percentage
            }));

            const prompt = `Create a comprehensive personalized learning path for this student:

STUDENT PROFILE:
- Total Courses: ${enrollments.length}
- Completed: ${completedCourses.length}
- Average Completion Rate: ${performanceData.avgCompletion.toFixed(1)}%
- Average Quiz Score: ${avgScore ? avgScore.toFixed(1) + '%' : 'N/A'}
- Skills Acquired: ${performanceData.skillsAcquired.join(", ") || "None yet"}

COMPLETED COURSES:
${completedCourses.join("\n") || "None"}

IN PROGRESS:
${inProgressCourses.join("\n") || "None"}

ACTIVE LEARNING GOALS:
${activeGoals.map(g => `${g.title} (${g.progress}% complete) - Target Skills: ${g.skills.join(", ")}`).join("\n") || "None"}

AVAILABLE COURSES:
${availableCourses.map(c => `${c.title} - ${c.category} - ${c.level} - Skills: ${c.skills_taught?.join(", ") || "General"}`).join("\n")}

Based on their performance, goals, and learning patterns, create a personalized learning path with:
1. Primary recommended course (most aligned with goals and skill gaps)
2. Alternative paths (3-4 other relevant courses)
3. Skill development focus areas
4. Learning milestones (5-7 specific achievable milestones)
5. Estimated timeline (in weeks)
6. Success tips and strategies
7. Progress checkpoints

Consider their completion rate and quiz performance to suggest appropriate difficulty levels.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        primary_recommendation: {
                            type: "object",
                            properties: {
                                course_title: { type: "string" },
                                reason: { type: "string" },
                                expected_outcomes: { type: "array", items: { type: "string" } },
                                difficulty_match: { type: "string" }
                            }
                        },
                        alternative_paths: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    course_title: { type: "string" },
                                    reason: { type: "string" },
                                    when_to_take: { type: "string" }
                                }
                            }
                        },
                        skill_focus: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    skill: { type: "string" },
                                    current_level: { type: "string" },
                                    target_level: { type: "string" },
                                    how_to_improve: { type: "string" }
                                }
                            }
                        },
                        milestones: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    estimated_weeks: { type: "number" }
                                }
                            }
                        },
                        timeline: { type: "string" },
                        success_tips: { type: "array", items: { type: "string" } },
                        progress_checkpoints: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    week: { type: "number" },
                                    checkpoint: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            const primaryCourse = availableCourses.find(c => 
                c.title.toLowerCase().includes(result.primary_recommendation.course_title.toLowerCase()) ||
                result.primary_recommendation.course_title.toLowerCase().includes(c.title.toLowerCase())
            );

            result.primary_recommendation.course_id = primaryCourse?.id;
            result.primary_recommendation.course_data = primaryCourse;

            result.alternative_paths = result.alternative_paths.map(alt => {
                const course = availableCourses.find(c => 
                    c.title.toLowerCase().includes(alt.course_title.toLowerCase()) ||
                    alt.course_title.toLowerCase().includes(c.title.toLowerCase())
                );
                return {
                    ...alt,
                    course_id: course?.id,
                    course_data: course
                };
            });

            setLearningPath(result);
        } catch (error) {
            console.error("Error generating learning path:", error);
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
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Your Learning Journey</h1>
                    <p className="text-slate-600">AI-powered personalized learning path based on your goals and performance</p>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                            <p className="text-2xl font-bold text-slate-900">{performanceData?.totalEnrollments || 0}</p>
                            <p className="text-sm text-slate-600">Total Courses</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <Award className="h-8 w-8 text-green-600 mb-2" />
                            <p className="text-2xl font-bold text-slate-900">{performanceData?.completedCourses || 0}</p>
                            <p className="text-sm text-slate-600">Completed</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <TrendingUp className="h-8 w-8 text-violet-600 mb-2" />
                            <p className="text-2xl font-bold text-slate-900">{performanceData?.avgCompletion.toFixed(0)}%</p>
                            <p className="text-sm text-slate-600">Avg Progress</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <Target className="h-8 w-8 text-amber-600 mb-2" />
                            <p className="text-2xl font-bold text-slate-900">{performanceData?.skillsAcquired.length || 0}</p>
                            <p className="text-sm text-slate-600">Skills Acquired</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2">
                        {!learningPath ? (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-12 text-center">
                                    <Sparkles className="h-16 w-16 mx-auto mb-4 text-violet-600" />
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Generate Your Learning Path</h3>
                                    <p className="text-slate-600 mb-6">
                                        AI will analyze your performance, goals, and preferences to create a personalized roadmap
                                    </p>
                                    <Button
                                        onClick={generatePersonalizedPath}
                                        disabled={isGenerating}
                                        size="lg"
                                        className="bg-gradient-to-r from-violet-600 to-purple-600"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Analyzing Your Journey...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                Generate My Learning Path
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                <Card className="border-0 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="h-5 w-5 text-violet-600" />
                                            Recommended Next Step
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg mb-4">
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                                {learningPath.primary_recommendation.course_title}
                                            </h3>
                                            <Badge className="mb-3">{learningPath.primary_recommendation.difficulty_match}</Badge>
                                            <p className="text-slate-700 mb-4">{learningPath.primary_recommendation.reason}</p>
                                            <div className="mb-4">
                                                <p className="font-semibold text-slate-900 mb-2">Expected Outcomes:</p>
                                                <ul className="space-y-1">
                                                    {learningPath.primary_recommendation.expected_outcomes.map((outcome, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                            {outcome}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            {learningPath.primary_recommendation.course_id && (
                                                <Button
                                                    onClick={() => navigate(createPageUrl("CourseViewer") + `?id=${learningPath.primary_recommendation.course_id}`)}
                                                    className="w-full bg-violet-600 hover:bg-violet-700"
                                                >
                                                    Start Learning
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-lg">
                                    <CardHeader>
                                        <CardTitle>Alternative Learning Paths</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {learningPath.alternative_paths.map((alt, idx) => (
                                                <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                                                    <h4 className="font-bold text-slate-900 mb-1">{alt.course_title}</h4>
                                                    <p className="text-sm text-slate-600 mb-2">{alt.reason}</p>
                                                    <p className="text-xs text-violet-600">📅 {alt.when_to_take}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-lg">
                                    <CardHeader>
                                        <CardTitle>Skill Development Focus</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {learningPath.skill_focus.map((skill, idx) => (
                                                <div key={idx}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-semibold text-slate-900">{skill.skill}</span>
                                                        <div className="flex gap-2">
                                                            <Badge variant="outline">{skill.current_level}</Badge>
                                                            <span>→</span>
                                                            <Badge className="bg-violet-100 text-violet-800">{skill.target_level}</Badge>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-slate-600 mb-2">{skill.how_to_improve}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-violet-600" />
                                            Learning Milestones
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-600 mb-4">Estimated Timeline: {learningPath.timeline}</p>
                                        <div className="space-y-3">
                                            {learningPath.milestones.map((milestone, idx) => (
                                                <div key={idx} className="flex gap-3">
                                                    <div className="flex flex-col items-center">
                                                        <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-sm font-bold text-violet-600">{idx + 1}</span>
                                                        </div>
                                                        {idx < learningPath.milestones.length - 1 && (
                                                            <div className="w-0.5 h-12 bg-slate-200 my-1" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pb-8">
                                                        <h4 className="font-semibold text-slate-900 mb-1">{milestone.title}</h4>
                                                        <p className="text-sm text-slate-600 mb-1">{milestone.description}</p>
                                                        <Badge variant="outline" className="text-xs">~{milestone.estimated_weeks} weeks</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-0 shadow-lg">
                                    <CardHeader>
                                        <CardTitle>Success Tips</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {learningPath.success_tips.map((tip, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                                    <span className="text-violet-600 font-bold">💡</span>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Button
                                    onClick={() => setLearningPath(null)}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Regenerate Learning Path
                                </Button>
                            </div>
                        )}
                    </div>

                    <div>
                        <GoalManager userEmail={user?.email} />
                    </div>
                </div>
            </div>
        </div>
    );
}