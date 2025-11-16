import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Trophy } from "lucide-react";
import PointsTracker from "@/components/gamification/PointsTracker";
import AILeaderboard from "@/components/gamification/AILeaderboard";
import PersonalizedChallenges from "@/components/gamification/PersonalizedChallenges";
import BadgeShowcase from "@/components/gamification/BadgeShowcase";

export default function GamificationDashboard() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        setIsLoading(true);
        const userData = await base44.auth.me();
        setUser(userData);
        setIsLoading(false);
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
                        <Trophy className="h-8 w-8 text-violet-600" />
                        Gamification Hub
                    </h1>
                    <p className="text-slate-600">
                        Track your progress, compete with peers, and complete personalized challenges
                    </p>
                </div>

                <div className="space-y-6">
                    <PointsTracker userEmail={user.email} />

                    <div className="grid lg:grid-cols-2 gap-6">
                        <PersonalizedChallenges userEmail={user.email} />
                        <BadgeShowcase userEmail={user.email} />
                    </div>

                    <AILeaderboard userEmail={user.email} />
                </div>
            </div>
        </div>
    );
}