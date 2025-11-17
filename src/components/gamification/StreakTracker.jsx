import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Zap } from "lucide-react";

export default function StreakTracker({ currentStreak, longestStreak, xpMultiplier }) {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-600" />
                    Learning Streak
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-4xl font-bold text-orange-600">
                                {currentStreak}
                            </span>
                            <span className="text-slate-600">days</span>
                        </div>
                        <p className="text-sm text-slate-600">Current streak</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{longestStreak}</p>
                            <p className="text-xs text-slate-600">Longest streak</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-1">
                                <Zap className="h-4 w-4 text-yellow-600" />
                                <span className="text-2xl font-bold text-slate-900">
                                    {xpMultiplier}x
                                </span>
                            </div>
                            <p className="text-xs text-slate-600">XP Multiplier</p>
                        </div>
                    </div>

                    {currentStreak >= 7 && (
                        <Badge className="bg-orange-600 text-white w-full justify-center">
                            🔥 You're on fire! Keep it up!
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}