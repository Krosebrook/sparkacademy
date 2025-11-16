import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trophy, Award, Flame, Target, Star, TrendingUp } from "lucide-react";

export default function GamificationDashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [badges, setBadges] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadGamificationData();
    }, []);

    const loadGamificationData = async () => {
        setIsLoading(true);
        try {
            const userData = await base44.auth.me();
            setUser(userData);

            const enrollments = await base44.entities.Enrollment.filter({ student_email: userData.email });
            
            const totalPoints = enrollments.reduce((sum, e) => sum + (e.points_earned || 0), 0);
            const currentStreak = enrollments.length > 0 
                ? Math.max(...enrollments.map(e => e.current_streak_days || 0))
                : 0;
            
            const completedCourses = enrollments.filter(e => e.completion_percentage === 100).length;
            const totalLessons = enrollments.reduce((sum, e) => 
                (e.progress || []).filter(p => p.completed).length, 0
            );
            const totalQuizzes = enrollments.reduce((sum, e) =>
                (e.progress || []).filter(p => p.quiz_passed).length, 0
            );

            setStats({
                totalPoints,
                currentStreak,
                completedCourses,
                totalLessons,
                totalQuizzes,
            });

            const userBadges = await base44.entities.UserBadge.filter({ user_email: userData.email });
            setBadges(userBadges);

            const allEnrollments = await base44.entities.Enrollment.list();
            const leaderboardData = {};
            
            allEnrollments.forEach(e => {
                if (!leaderboardData[e.student_email]) {
                    leaderboardData[e.student_email] = {
                        email: e.student_email,
                        points: 0,
                        coursesCompleted: 0,
                    };
                }
                leaderboardData[e.student_email].points += e.points_earned || 0;
                if (e.completion_percentage === 100) {
                    leaderboardData[e.student_email].coursesCompleted++;
                }
            });

            const sortedLeaderboard = Object.values(leaderboardData)
                .sort((a, b) => b.points - a.points)
                .slice(0, 10);
            
            setLeaderboard(sortedLeaderboard);

        } catch (error) {
            console.error("Error loading gamification data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    const userRank = leaderboard.findIndex(u => u.email === user.email) + 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Gamification Dashboard</h1>
                    <p className="text-slate-600">Track your points, badges, and compete with other learners</p>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <Trophy className="h-8 w-8" />
                                <span className="text-3xl font-bold">{stats?.totalPoints || 0}</span>
                            </div>
                            <p className="text-white/90 font-semibold">Total Points</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-pink-500 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <Flame className="h-8 w-8" />
                                <span className="text-3xl font-bold">{stats?.currentStreak || 0}</span>
                            </div>
                            <p className="text-white/90 font-semibold">Day Streak</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <Award className="h-8 w-8" />
                                <span className="text-3xl font-bold">{badges?.length || 0}</span>
                            </div>
                            <p className="text-white/90 font-semibold">Badges Earned</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingUp className="h-8 w-8" />
                                <span className="text-3xl font-bold">#{userRank || "-"}</span>
                            </div>
                            <p className="text-white/90 font-semibold">Your Rank</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="stats" className="space-y-6">
                    <TabsList className="bg-white border border-slate-200">
                        <TabsTrigger value="stats">
                            <Target className="h-4 w-4 mr-2" />
                            My Stats
                        </TabsTrigger>
                        <TabsTrigger value="badges">
                            <Award className="h-4 w-4 mr-2" />
                            Badges
                        </TabsTrigger>
                        <TabsTrigger value="leaderboard">
                            <Trophy className="h-4 w-4 mr-2" />
                            Leaderboard
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="stats">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Learning Progress</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-slate-700">Courses Completed</span>
                                            <span className="text-2xl font-bold text-violet-600">{stats?.completedCourses || 0}</span>
                                        </div>
                                        <Progress value={stats?.completedCourses * 10} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-slate-700">Lessons Completed</span>
                                            <span className="text-2xl font-bold text-green-600">{stats?.totalLessons || 0}</span>
                                        </div>
                                        <Progress value={Math.min(stats?.totalLessons * 2, 100)} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-slate-700">Quizzes Passed</span>
                                            <span className="text-2xl font-bold text-blue-600">{stats?.totalQuizzes || 0}</span>
                                        </div>
                                        <Progress value={Math.min(stats?.totalQuizzes * 3, 100)} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Achievement Milestones</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <Trophy className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">First Course</p>
                                            <p className="text-xs text-slate-600">Complete your first course</p>
                                        </div>
                                        {stats?.completedCourses > 0 && <Badge className="ml-auto">✓</Badge>}
                                    </div>

                                    <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                            <Star className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Perfect Week</p>
                                            <p className="text-xs text-slate-600">Maintain a 7-day streak</p>
                                        </div>
                                        {stats?.currentStreak >= 7 && <Badge className="ml-auto">✓</Badge>}
                                    </div>

                                    <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                                        <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
                                            <Target className="h-5 w-5 text-violet-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Quiz Master</p>
                                            <p className="text-xs text-slate-600">Pass 10 quizzes</p>
                                        </div>
                                        {stats?.totalQuizzes >= 10 && <Badge className="ml-auto">✓</Badge>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="badges">
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>My Badge Collection</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {badges.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <Award className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                                        <p className="font-semibold">No badges yet</p>
                                        <p className="text-sm">Complete courses and activities to earn badges!</p>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-3 gap-4">
                                        {badges.map((badge) => (
                                            <div key={badge.id} className="border border-slate-200 rounded-lg p-6 text-center">
                                                <div className="text-4xl mb-3">{badge.badge_icon || "🏆"}</div>
                                                <h4 className="font-semibold text-slate-900 mb-1">{badge.badge_name}</h4>
                                                <p className="text-xs text-slate-600">
                                                    Earned {new Date(badge.earned_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="leaderboard">
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-amber-500" />
                                    Top Learners
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {leaderboard.map((entry, idx) => (
                                        <div
                                            key={entry.email}
                                            className={`flex items-center gap-4 p-4 rounded-lg border ${
                                                entry.email === user.email
                                                    ? "bg-violet-50 border-violet-300"
                                                    : "bg-white border-slate-200"
                                            }`}
                                        >
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-900">
                                                    {entry.email === user.email ? "You" : entry.email.split("@")[0]}
                                                </p>
                                                <p className="text-xs text-slate-600">
                                                    {entry.coursesCompleted} courses completed
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-violet-600">{entry.points}</p>
                                                <p className="text-xs text-slate-600">points</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}