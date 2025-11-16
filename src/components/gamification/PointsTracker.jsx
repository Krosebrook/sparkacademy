import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Zap, TrendingUp } from "lucide-react";

export default function PointsTracker({ userEmail }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadStats();
    }, [userEmail]);

    const loadStats = async () => {
        const enrollments = await base44.entities.Enrollment.filter({ student_email: userEmail });
        const userBadges = await base44.entities.UserBadge.filter({ user_email: userEmail });

        const totalPoints = enrollments.reduce((sum, e) => sum + (e.points_earned || 0), 0);
        const currentStreak = Math.max(...enrollments.map(e => e.current_streak_days || 0));
        const completedCourses = enrollments.filter(e => e.completion_percentage === 100).length;

        setStats({
            totalPoints,
            currentStreak,
            completedCourses,
            badgesEarned: userBadges.length
        });
    };

    if (!stats) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Star className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600">Total Points</p>
                            <p className="text-xl font-bold text-slate-900">{stats.totalPoints}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600">Current Streak</p>
                            <p className="text-xl font-bold text-slate-900">{stats.currentStreak} days</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600">Badges</p>
                            <p className="text-xl font-bold text-slate-900">{stats.badgesEarned}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-600">Completed</p>
                            <p className="text-xl font-bold text-slate-900">{stats.completedCourses}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}