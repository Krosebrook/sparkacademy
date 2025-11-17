import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy, Flame } from "lucide-react";
import DailyChallengeCard from "@/components/gamification/DailyChallengeCard";
import StreakTracker from "@/components/gamification/StreakTracker";

export default function DailyChallenges() {
    const [user, setUser] = useState(null);
    const [challenges, setChallenges] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const userData = await base44.auth.me();
            setUser(userData);

            const today = new Date().toISOString().split('T')[0];
            const todayChallenges = await base44.entities.DailyChallenge.filter({ date: today });

            if (todayChallenges.length === 0) {
                await generateDailyChallenges(today);
                const newChallenges = await base44.entities.DailyChallenge.filter({ date: today });
                setChallenges(newChallenges);
            } else {
                setChallenges(todayChallenges);
            }

            setUserStats(userData.gamification || {
                current_streak: 0,
                longest_streak: 0,
                xp_multiplier: 1
            });
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateDailyChallenges = async (date) => {
        const challengeTypes = [
            {
                type: "learning_streak",
                title: "Daily Learner",
                description: "Complete at least one lesson today",
                difficulty: "easy",
                points: 50
            },
            {
                type: "quiz",
                title: "Quiz Master",
                description: "Pass a quiz with 80% or higher",
                difficulty: "medium",
                points: 100
            },
            {
                type: "discussion",
                title: "Community Helper",
                description: "Post a helpful response in course discussions",
                difficulty: "medium",
                points: 75
            }
        ];

        for (const challenge of challengeTypes) {
            await base44.entities.DailyChallenge.create({
                date,
                challenge_type: challenge.type,
                title: challenge.title,
                description: challenge.description,
                difficulty: challenge.difficulty,
                points_reward: challenge.points,
                completed_by: []
            });
        }
    };

    const completeChallenge = async (challenge) => {
        try {
            const updatedCompletedBy = [
                ...(challenge.completed_by || []),
                {
                    user_email: user.email,
                    completed_at: new Date().toISOString(),
                    bonus_earned: false
                }
            ];

            await base44.entities.DailyChallenge.update(challenge.id, {
                completed_by: updatedCompletedBy
            });

            const newStreak = (userStats.current_streak || 0) + 1;
            const multiplier = Math.min(1 + (newStreak / 7) * 0.5, 3);

            await base44.auth.updateMe({
                gamification: {
                    ...userStats,
                    total_points: (userStats.total_points || 0) + challenge.points_reward,
                    current_streak: newStreak,
                    longest_streak: Math.max(newStreak, userStats.longest_streak || 0),
                    xp_multiplier: multiplier,
                    last_activity_date: new Date().toISOString().split('T')[0]
                }
            });

            loadData();
        } catch (error) {
            console.error("Error completing challenge:", error);
        }
    };

    const isChallengeCompleted = (challenge) => {
        return challenge.completed_by?.some(c => c.user_email === user?.email);
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
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Trophy className="h-8 w-8 text-amber-500" />
                        Daily Challenges
                    </h1>
                    <p className="text-slate-600">
                        Complete challenges to earn points and maintain your streak
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    <StreakTracker
                        currentStreak={userStats?.current_streak || 0}
                        longestStreak={userStats?.longest_streak || 0}
                        xpMultiplier={userStats?.xp_multiplier || 1}
                    />
                    
                    <Card className="border-0 shadow-lg lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Your Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-violet-600">
                                        {userStats?.total_points || 0}
                                    </p>
                                    <p className="text-sm text-slate-600">Total Points</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-amber-600">
                                        {userStats?.level || 1}
                                    </p>
                                    <p className="text-sm text-slate-600">Level</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-green-600">
                                        {challenges.filter(c => isChallengeCompleted(c)).length}/{challenges.length}
                                    </p>
                                    <p className="text-sm text-slate-600">Today's Progress</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Today's Challenges</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {challenges.map(challenge => (
                            <DailyChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                isCompleted={isChallengeCompleted(challenge)}
                                onComplete={() => completeChallenge(challenge)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}