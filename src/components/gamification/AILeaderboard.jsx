import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Crown, Medal, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AILeaderboard({ userEmail }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        generateLeaderboard();
    }, []);

    const generateLeaderboard = async () => {
        setIsGenerating(true);
        try {
            const enrollments = await base44.entities.Enrollment.list();
            const allUsers = await base44.entities.User.list();

            const studentStats = {};
            enrollments.forEach(e => {
                if (!studentStats[e.student_email]) {
                    studentStats[e.student_email] = {
                        email: e.student_email,
                        totalPoints: 0,
                        coursesCompleted: 0,
                        avgCompletion: 0,
                        maxStreak: 0,
                        totalEnrollments: 0,
                        avgQuizScore: 0,
                        quizScores: []
                    };
                }

                const stats = studentStats[e.student_email];
                stats.totalPoints += e.points_earned || 0;
                stats.totalEnrollments += 1;
                stats.avgCompletion += e.completion_percentage || 0;
                stats.maxStreak = Math.max(stats.maxStreak, e.current_streak_days || 0);
                
                if (e.completion_percentage === 100) stats.coursesCompleted += 1;

                const quizScores = e.progress?.filter(p => p.quiz_score).map(p => p.quiz_score) || [];
                stats.quizScores.push(...quizScores);
            });

            Object.values(studentStats).forEach(stats => {
                stats.avgCompletion = stats.totalEnrollments > 0 
                    ? stats.avgCompletion / stats.totalEnrollments 
                    : 0;
                stats.avgQuizScore = stats.quizScores.length > 0
                    ? stats.quizScores.reduce((a, b) => a + b, 0) / stats.quizScores.length
                    : 0;
            });

            const topStudents = Object.values(studentStats)
                .sort((a, b) => {
                    const scoreA = a.totalPoints + (a.coursesCompleted * 100) + (a.avgQuizScore * 10);
                    const scoreB = b.totalPoints + (b.coursesCompleted * 100) + (b.avgQuizScore * 10);
                    return scoreB - scoreA;
                })
                .slice(0, 20);

            const prompt = `Analyze these student engagement metrics and create an AI-powered ranking with insights:

${topStudents.map((s, i) => `${i + 1}. ${s.email}
- Points: ${s.totalPoints}
- Completed: ${s.coursesCompleted}
- Avg Completion: ${s.avgCompletion.toFixed(1)}%
- Quiz Score: ${s.avgQuizScore.toFixed(1)}%
- Streak: ${s.maxStreak} days
`).join("\n")}

For top 10 students, provide:
1. Final ranking score (0-100)
2. Achievement title (creative, personalized)
3. Strength description (what they excel at)`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        rankings: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    email: { type: "string" },
                                    ranking_score: { type: "number" },
                                    achievement_title: { type: "string" },
                                    strength: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            const enrichedLeaderboard = result.rankings.map((rank, idx) => {
                const stats = topStudents.find(s => s.email === rank.email);
                const user = allUsers.find(u => u.email === rank.email);
                return {
                    ...rank,
                    ...stats,
                    rank: idx + 1,
                    name: user?.full_name || rank.email
                };
            });

            setLeaderboard(enrichedLeaderboard);
        } catch (error) {
            console.error("Error generating leaderboard:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
        if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
        return <Trophy className="h-5 w-5 text-slate-400" />;
    };

    const getRankColor = (rank) => {
        if (rank === 1) return "from-yellow-50 to-amber-50 border-yellow-300";
        if (rank === 2) return "from-slate-50 to-gray-50 border-slate-300";
        if (rank === 3) return "from-orange-50 to-amber-50 border-orange-300";
        return "from-white to-slate-50 border-slate-200";
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-violet-600" />
                        AI-Powered Leaderboard
                    </CardTitle>
                    <Button
                        onClick={generateLeaderboard}
                        disabled={isGenerating}
                        size="sm"
                        variant="outline"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isGenerating ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaderboard.map((student) => (
                            <div
                                key={student.email}
                                className={`p-4 rounded-lg border-2 bg-gradient-to-r ${getRankColor(student.rank)} ${
                                    student.email === userEmail ? 'ring-2 ring-violet-400' : ''
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        {getRankIcon(student.rank)}
                                        <span className="text-2xl font-bold text-slate-900 w-8">
                                            #{student.rank}
                                        </span>
                                    </div>
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-violet-600 text-white">
                                            {student.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-slate-900">{student.name}</h4>
                                            {student.email === userEmail && (
                                                <Badge className="bg-violet-600 text-white">You</Badge>
                                            )}
                                        </div>
                                        <Badge variant="outline" className="mb-2">
                                            {student.achievement_title}
                                        </Badge>
                                        <p className="text-sm text-slate-700">{student.strength}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-violet-600">
                                            {Math.round(student.ranking_score)}
                                        </p>
                                        <p className="text-xs text-slate-600">AI Score</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4 mt-3 text-center text-sm">
                                    <div>
                                        <p className="font-semibold text-slate-900">{student.totalPoints}</p>
                                        <p className="text-xs text-slate-600">Points</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{student.coursesCompleted}</p>
                                        <p className="text-xs text-slate-600">Completed</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{student.avgQuizScore.toFixed(0)}%</p>
                                        <p className="text-xs text-slate-600">Avg Quiz</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{student.maxStreak}</p>
                                        <p className="text-xs text-slate-600">Streak</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}