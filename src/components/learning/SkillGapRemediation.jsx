import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertTriangle, Target, CheckCircle, Star, Zap } from "lucide-react";
import MicroLearningModule from "./MicroLearningModule";

export default function SkillGapRemediation({ userEmail }) {
    const [gaps, setGaps] = useState([]);
    const [remediationPlan, setRemediationPlan] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [completedModules, setCompletedModules] = useState([]);

    useEffect(() => {
        analyzeSkillGaps();
    }, [userEmail]);

    const analyzeSkillGaps = async () => {
        setIsAnalyzing(true);
        try {
            const [enrollments, careerPaths, allCourses] = await Promise.all([
                base44.entities.Enrollment.filter({ student_email: userEmail }),
                base44.entities.CareerPath.filter({ user_email: userEmail }),
                base44.entities.Course.list()
            ]);

            const identifiedGaps = [];

            // Analyze career path skill gaps
            const latestCareerPath = careerPaths.sort((a, b) => 
                new Date(b.created_date) - new Date(a.created_date)
            )[0];

            if (latestCareerPath?.required_skills) {
                latestCareerPath.required_skills.forEach(skill => {
                    if (skill.gap && skill.gap !== "none" && skill.gap !== "None") {
                        identifiedGaps.push({
                            skill: skill.skill,
                            gap_level: skill.gap,
                            current_level: skill.current_level || "beginner",
                            target_level: skill.proficiency_level || "advanced",
                            source: "career_path",
                            priority: "high"
                        });
                    }
                });
            }

            // Analyze quiz performance to identify weak skills
            const quizPerformance = {};
            enrollments.forEach(enrollment => {
                const course = allCourses.find(c => c.id === enrollment.course_id);
                if (!course) return;

                enrollment.progress?.forEach(progress => {
                    if (progress.quiz_score && progress.quiz_score < 70) {
                        const lesson = course.lessons?.find(l => l.order === progress.lesson_order);
                        if (lesson && course.skills_taught) {
                            course.skills_taught.forEach(skill => {
                                if (!quizPerformance[skill]) {
                                    quizPerformance[skill] = { scores: [], courses: [] };
                                }
                                quizPerformance[skill].scores.push(progress.quiz_score);
                                quizPerformance[skill].courses.push(course.title);
                            });
                        }
                    }
                });
            });

            // Add quiz-based gaps
            Object.entries(quizPerformance).forEach(([skill, data]) => {
                const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
                if (avgScore < 70) {
                    identifiedGaps.push({
                        skill,
                        gap_level: avgScore < 50 ? "large" : "moderate",
                        current_level: "needs_improvement",
                        target_level: "proficient",
                        source: "quiz_performance",
                        priority: avgScore < 50 ? "high" : "medium",
                        avg_score: avgScore.toFixed(1),
                        courses_affected: data.courses
                    });
                }
            });

            setGaps(identifiedGaps);

            if (identifiedGaps.length > 0) {
                await generateRemediationPlan(identifiedGaps);
            }
        } catch (error) {
            console.error("Error analyzing skill gaps:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const generateRemediationPlan = async (gaps) => {
        try {
            const prompt = `Create a comprehensive skill gap remediation plan for these identified gaps:

${gaps.map((g, i) => `${i + 1}. ${g.skill}
- Gap Level: ${g.gap_level}
- Current: ${g.current_level}
- Target: ${g.target_level}
- Priority: ${g.priority}
- Source: ${g.source}
${g.avg_score ? `- Avg Quiz Score: ${g.avg_score}%` : ''}
`).join('\n')}

For EACH skill gap, generate:
1. 3-5 micro-learning modules (15-30 min each) with:
   - Clear learning objectives
   - Specific topics to cover
   - Practical exercises
   - Assessment criteria
   - Points reward (50-150 based on difficulty)

2. 2-3 targeted practice exercises with:
   - Real-world scenarios
   - Step-by-step guidance
   - Success criteria
   - Points reward

3. 1-2 bonus challenges for mastery with:
   - Advanced applications
   - Creative problem-solving
   - High point rewards (200-300)

Also provide:
- Overall remediation timeline
- Suggested learning order
- Success metrics`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        skill_remediations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    skill: { type: "string" },
                                    priority: { type: "string" },
                                    micro_modules: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                title: { type: "string" },
                                                description: { type: "string" },
                                                duration_minutes: { type: "number" },
                                                learning_objectives: { type: "array", items: { type: "string" } },
                                                topics: { type: "array", items: { type: "string" } },
                                                exercise: { type: "string" },
                                                assessment: { type: "string" },
                                                points_reward: { type: "number" }
                                            }
                                        }
                                    },
                                    practice_exercises: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                title: { type: "string" },
                                                scenario: { type: "string" },
                                                guidance: { type: "array", items: { type: "string" } },
                                                success_criteria: { type: "array", items: { type: "string" } },
                                                points_reward: { type: "number" }
                                            }
                                        }
                                    },
                                    bonus_challenges: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                title: { type: "string" },
                                                description: { type: "string" },
                                                requirements: { type: "array", items: { type: "string" } },
                                                points_reward: { type: "number" }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        timeline: { type: "string" },
                        learning_order: { type: "array", items: { type: "string" } },
                        success_metrics: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setRemediationPlan(result);
        } catch (error) {
            console.error("Error generating remediation plan:", error);
        }
    };

    const completeModule = async (skill, moduleTitle, pointsReward) => {
        try {
            const enrollments = await base44.entities.Enrollment.filter({ student_email: userEmail });
            
            if (enrollments.length > 0) {
                const enrollment = enrollments[0];
                await base44.entities.Enrollment.update(enrollment.id, {
                    points_earned: (enrollment.points_earned || 0) + pointsReward
                });
            }

            setCompletedModules([...completedModules, `${skill}-${moduleTitle}`]);

            const badges = await base44.entities.Badge.filter({ name: "Gap Closer" });
            if (badges.length > 0 && completedModules.length + 1 >= 5) {
                const userBadges = await base44.entities.UserBadge.filter({ 
                    user_email: userEmail, 
                    badge_id: badges[0].id 
                });
                
                if (userBadges.length === 0) {
                    await base44.entities.UserBadge.create({
                        user_email: userEmail,
                        badge_id: badges[0].id,
                        badge_name: badges[0].name,
                        badge_icon: badges[0].icon,
                        earned_date: new Date().toISOString()
                    });
                }
            }
        } catch (error) {
            console.error("Error completing module:", error);
        }
    };

    if (isAnalyzing) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
                    <p className="text-slate-600">Analyzing your skill gaps and generating personalized remediation plan...</p>
                </CardContent>
            </Card>
        );
    }

    if (gaps.length === 0) {
        return (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-8 text-center">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Skill Gaps Detected!</h3>
                    <p className="text-slate-700">You're performing well across all areas. Keep up the great work!</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        Skill Gap Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-700 mb-4">
                        We've identified {gaps.length} skill gap{gaps.length > 1 ? 's' : ''} in your learning journey. 
                        Complete the targeted modules below to bridge these gaps and earn rewards!
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                        {gaps.map((gap, idx) => (
                            <div key={idx} className="p-3 bg-white border border-amber-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-slate-900">{gap.skill}</h4>
                                    <Badge className={
                                        gap.priority === "high" ? "bg-red-100 text-red-800" :
                                        gap.priority === "medium" ? "bg-amber-100 text-amber-800" :
                                        "bg-blue-100 text-blue-800"
                                    }>
                                        {gap.priority}
                                    </Badge>
                                </div>
                                <div className="text-xs text-slate-600 space-y-1">
                                    <div>Gap: {gap.gap_level}</div>
                                    <div>Source: {gap.source.replace('_', ' ')}</div>
                                    {gap.avg_score && <div>Avg Quiz Score: {gap.avg_score}%</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {remediationPlan && (
                <>
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-violet-600" />
                                Your Personalized Remediation Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 mb-6">
                                <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
                                    <h4 className="font-semibold text-slate-900 mb-2">Timeline</h4>
                                    <p className="text-sm text-slate-700">{remediationPlan.timeline}</p>
                                </div>
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-semibold text-slate-900 mb-2">Recommended Learning Order</h4>
                                    <ol className="text-sm text-slate-700 list-decimal list-inside space-y-1">
                                        {remediationPlan.learning_order?.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ol>
                                </div>
                            </div>

                            {remediationPlan.skill_remediations?.map((remediation, idx) => (
                                <div key={idx} className="mb-8 last:mb-0">
                                    <div className="flex items-center gap-2 mb-4">
                                        <h3 className="text-xl font-bold text-slate-900">{remediation.skill}</h3>
                                        <Badge>{remediation.priority} priority</Badge>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <Star className="h-4 w-4 text-violet-600" />
                                                Micro-Learning Modules
                                            </h4>
                                            <div className="space-y-3">
                                                {remediation.micro_modules?.map((module, midx) => (
                                                    <MicroLearningModule
                                                        key={midx}
                                                        module={module}
                                                        skill={remediation.skill}
                                                        isCompleted={completedModules.includes(`${remediation.skill}-${module.title}`)}
                                                        onComplete={() => completeModule(remediation.skill, module.title, module.points_reward)}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <Zap className="h-4 w-4 text-blue-600" />
                                                Practice Exercises
                                            </h4>
                                            <div className="space-y-3">
                                                {remediation.practice_exercises?.map((exercise, eidx) => (
                                                    <div key={eidx} className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h5 className="font-bold text-slate-900">{exercise.title}</h5>
                                                            <Badge className="bg-blue-600 text-white">
                                                                <Star className="h-3 w-3 mr-1" />
                                                                {exercise.points_reward} pts
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-700 mb-3">{exercise.scenario}</p>
                                                        <div className="mb-3">
                                                            <p className="text-xs font-semibold text-slate-600 mb-1">Guidance:</p>
                                                            <ul className="text-xs text-slate-600 space-y-1">
                                                                {exercise.guidance?.map((guide, gidx) => (
                                                                    <li key={gidx}>• {guide}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-600 mb-1">Success Criteria:</p>
                                                            <ul className="text-xs text-slate-600 space-y-1">
                                                                {exercise.success_criteria?.map((criteria, cidx) => (
                                                                    <li key={cidx}>✓ {criteria}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                <Trophy className="h-4 w-4 text-yellow-600" />
                                                Bonus Challenges
                                            </h4>
                                            <div className="space-y-3">
                                                {remediation.bonus_challenges?.map((challenge, cidx) => (
                                                    <div key={cidx} className="p-4 border-2 border-yellow-300 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h5 className="font-bold text-slate-900">{challenge.title}</h5>
                                                            <Badge className="bg-yellow-600 text-white">
                                                                <Star className="h-3 w-3 mr-1" />
                                                                {challenge.points_reward} pts
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-700 mb-3">{challenge.description}</p>
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-600 mb-1">Requirements:</p>
                                                            <ul className="text-xs text-slate-600 space-y-1">
                                                                {challenge.requirements?.map((req, ridx) => (
                                                                    <li key={ridx}>• {req}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-semibold text-slate-900 mb-2">Success Metrics</h4>
                                <ul className="text-sm text-slate-700 space-y-1">
                                    {remediationPlan.success_metrics?.map((metric, idx) => (
                                        <li key={idx}>• {metric}</li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}