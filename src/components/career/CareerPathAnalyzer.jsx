import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Briefcase } from "lucide-react";

export default function CareerPathAnalyzer({ userData, onPathGenerated }) {
    const [targetRole, setTargetRole] = useState("");
    const [interests, setInterests] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const generateCareerPath = async () => {
        setIsGenerating(true);
        try {
            const enrollments = await base44.entities.Enrollment.filter({ 
                student_email: userData.email 
            });
            const allCourses = await base44.entities.Course.list();
            const goals = await base44.entities.LearningGoal.filter({ 
                user_email: userData.email 
            });

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

            const skillsAcquired = [...new Set(completedCourses.flatMap(c => c.skills))];
            
            const avgQuizScores = enrollments
                .flatMap(e => e.progress || [])
                .filter(p => p.quiz_score !== undefined)
                .map(p => p.quiz_score);
            const avgPerformance = avgQuizScores.length > 0
                ? avgQuizScores.reduce((a, b) => a + b, 0) / avgQuizScores.length
                : 0;

            const availableCourses = allCourses
                .filter(c => c.is_published)
                .map(c => ({
                    id: c.id,
                    title: c.title,
                    category: c.category,
                    level: c.level,
                    skills: c.skills_taught || []
                }));

            const prompt = `Analyze this student's profile and create a comprehensive career path:

STUDENT PROFILE:
- Target Role: ${targetRole}
- Interests: ${interests}
- Completed Courses: ${completedCourses.map(c => c.title).join(", ") || "None"}
- Skills Acquired: ${skillsAcquired.join(", ") || "None"}
- Average Performance: ${avgPerformance.toFixed(1)}%
- Learning Goals: ${goals.map(g => g.title).join(", ") || "None"}

AVAILABLE COURSES:
${availableCourses.map(c => `${c.title} (${c.category}, ${c.level}) - Skills: ${c.skills.join(", ")}`).join("\n")}

Create a detailed career path including:
1. Comprehensive analysis of the target role
2. Required skills with proficiency levels and current gaps
3. Prioritized course recommendations (with IDs from available courses)
4. Career milestones with realistic timelines
5. Salary expectations and job outlook
6. Alternative related career roles
7. Readiness score (0-100)
8. Immediate next steps

Consider their current skill level and performance to suggest appropriate difficulty progression.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        role_analysis: {
                            type: "object",
                            properties: {
                                description: { type: "string" },
                                typical_responsibilities: { type: "array", items: { type: "string" } },
                                work_environment: { type: "string" },
                                career_growth: { type: "string" }
                            }
                        },
                        required_skills: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    skill: { type: "string" },
                                    proficiency_level: { type: "string" },
                                    current_level: { type: "string" },
                                    gap: { type: "string" },
                                    importance: { type: "string" }
                                }
                            }
                        },
                        recommended_courses: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    course_title: { type: "string" },
                                    priority: { type: "string" },
                                    skills_gained: { type: "array", items: { type: "string" } },
                                    reason: { type: "string" },
                                    order: { type: "number" }
                                }
                            }
                        },
                        career_milestones: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    timeline_months: { type: "number" }
                                }
                            }
                        },
                        salary_range: {
                            type: "object",
                            properties: {
                                min: { type: "number" },
                                max: { type: "number" },
                                experience_level: { type: "string" }
                            }
                        },
                        job_outlook: { type: "string" },
                        alternative_roles: { type: "array", items: { type: "string" } },
                        readiness_score: { type: "number" },
                        next_steps: { type: "array", items: { type: "string" } },
                        total_timeline_months: { type: "number" }
                    }
                }
            });

            const mappedCourses = result.recommended_courses.map(rec => {
                const course = availableCourses.find(c => 
                    c.title.toLowerCase().includes(rec.course_title.toLowerCase()) ||
                    rec.course_title.toLowerCase().includes(c.title.toLowerCase())
                );
                return {
                    course_id: course?.id,
                    course_title: rec.course_title,
                    priority: rec.priority,
                    skills_gained: rec.skills_gained,
                    reason: rec.reason,
                    order: rec.order
                };
            });

            const careerPath = await base44.entities.CareerPath.create({
                user_email: userData.email,
                target_role: targetRole,
                role_category: result.role_analysis?.description || targetRole,
                current_skills: skillsAcquired,
                required_skills: result.required_skills,
                recommended_courses: mappedCourses,
                career_milestones: result.career_milestones,
                salary_range: {
                    min: result.salary_range.min,
                    max: result.salary_range.max,
                    currency: "USD"
                },
                job_outlook: result.job_outlook,
                alternative_roles: result.alternative_roles,
                total_timeline_months: result.total_timeline_months,
                readiness_score: result.readiness_score,
                next_steps: result.next_steps
            });

            onPathGenerated({ ...careerPath, role_analysis: result.role_analysis });
        } catch (error) {
            console.error("Error generating career path:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-violet-600" />
                    AI Career Path Generator
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">
                            Target Job Role
                        </label>
                        <Input
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="e.g., Data Scientist, UX Designer, Full Stack Developer"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">
                            Your Interests & Preferences
                        </label>
                        <Textarea
                            value={interests}
                            onChange={(e) => setInterests(e.target.value)}
                            placeholder="What aspects of this role interest you most? Any specific industries or technologies?"
                            className="min-h-24"
                        />
                    </div>
                    <Button
                        onClick={generateCareerPath}
                        disabled={isGenerating || !targetRole}
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing Career Path...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate Career Path
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}