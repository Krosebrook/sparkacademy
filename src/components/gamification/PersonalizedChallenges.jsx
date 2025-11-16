import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Zap, Star, CheckCircle, Trophy } from "lucide-react";

export default function PersonalizedChallenges({ userEmail }) {
    const [challenges, setChallenges] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        generateChallenges();
    }, [userEmail]);

    const generateChallenges = async () => {
        setIsGenerating(true);
        try {
            const enrollments = await base44.entities.Enrollment.filter({ student_email: userEmail });
            const allCourses = await base44.entities.Course.list();

            const completedCourses = enrollments.filter(e => e.completion_percentage === 100).length;
            const inProgressCourses = enrollments.filter(e => e.completion_percentage > 0 && e.completion_percentage < 100);
            
            const avgQuizScore = enrollments
                .flatMap(e => e.progress || [])
                .filter(p => p.quiz_score)
                .reduce((sum, p, _, arr) => sum + p.quiz_score / arr.length, 0) || 0;

            const currentStreak = Math.max(...enrollments.map(e => e.current_streak_days || 0));
            const totalPoints = enrollments.reduce((sum, e) => sum + (e.points_earned || 0), 0);

            const prompt = `Create personalized learning challenges for this student:

STUDENT PROFILE:
- Completed Courses: ${completedCourses}
- In Progress: ${inProgressCourses.length}
- Avg Quiz Score: ${avgQuizScore.toFixed(1)}%
- Current Streak: ${currentStreak} days
- Total Points: ${totalPoints}

Generate 5 personalized challenges:
1. 2 skill-building challenges (based on weak areas)
2. 1 streak/consistency challenge
3. 1 achievement challenge (course completion)
4. 1 bonus challenge (creative/fun)

Each challenge should:
- Be achievable within 1-2 weeks
- Offer meaningful rewards (50-200 points)
- Have clear, measurable goals
- Feel personalized and motivating`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        challenges: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    type: { type: "string" },
                                    goal: { type: "string" },
                                    reward_points: { type: "number" },
                                    difficulty: { type: "string" },
                                    time_frame: { type: "string" },
                                    current_progress: { type: "number" },
                                    target_progress: { type: "number" }
                                }
                            }
                        }
                    }
                }
            });

            setChallenges(result.challenges);
        } catch (error) {
            console.error("Error generating challenges:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        if (difficulty?.toLowerCase().includes("easy")) return "bg-green-100 text-green-800";
        if (difficulty?.toLowerCase().includes("medium")) return "bg-amber-100 text-amber-800";
        if (difficulty?.toLowerCase().includes("hard")) return "bg-red-100 text-red-800";
        return "bg-slate-100 text-slate-800";
    };

    const getTypeIcon = (type) => {
        if (type?.toLowerCase().includes("skill")) return <Star className="h-4 w-4" />;
        if (type?.toLowerCase().includes("streak")) return <Zap className="h-4 w-4" />;
        if (type?.toLowerCase().includes("achievement")) return <Trophy className="h-4 w-4" />;
        return <CheckCircle className="h-4 w-4" />;
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-violet-600" />
                    Your Personalized Challenges
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isGenerating ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {challenges.map((challenge, idx) => {
                            const progress = (challenge.current_progress / challenge.target_progress) * 100;
                            const isCompleted = progress >= 100;

                            return (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-lg border-2 ${
                                        isCompleted 
                                            ? 'bg-green-50 border-green-300' 
                                            : 'bg-white border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getTypeIcon(challenge.type)}
                                                <h4 className="font-bold text-slate-900">{challenge.title}</h4>
                                                {isCompleted && (
                                                    <Badge className="bg-green-600 text-white">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Completed
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-700 mb-2">{challenge.description}</p>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Badge className={getDifficultyColor(challenge.difficulty)}>
                                                    {challenge.difficulty}
                                                </Badge>
                                                <Badge variant="outline">{challenge.time_frame}</Badge>
                                                <Badge className="bg-yellow-100 text-yellow-800">
                                                    <Star className="h-3 w-3 mr-1" />
                                                    {challenge.reward_points} pts
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-slate-600">Progress</span>
                                            <span className="font-semibold text-slate-900">
                                                {challenge.current_progress} / {challenge.target_progress}
                                            </span>
                                        </div>
                                        <Progress value={Math.min(progress, 100)} className="h-2" />
                                    </div>

                                    <p className="text-xs text-slate-600">
                                        <strong>Goal:</strong> {challenge.goal}
                                    </p>
                                </div>
                            );
                        })}

                        <Button
                            onClick={generateChallenges}
                            variant="outline"
                            className="w-full"
                            disabled={isGenerating}
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Refresh Challenges
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}