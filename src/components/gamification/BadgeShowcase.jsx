import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Lock } from "lucide-react";

export default function BadgeShowcase({ userEmail }) {
    const [earnedBadges, setEarnedBadges] = useState([]);
    const [availableBadges, setAvailableBadges] = useState([]);

    useEffect(() => {
        loadBadges();
    }, [userEmail]);

    const loadBadges = async () => {
        const allBadges = await base44.entities.Badge.list();
        const userBadges = await base44.entities.UserBadge.filter({ user_email: userEmail });

        const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
        const earned = allBadges.filter(b => earnedBadgeIds.includes(b.id));
        const available = allBadges.filter(b => !earnedBadgeIds.includes(b.id));

        setEarnedBadges(earned);
        setAvailableBadges(available);
    };

    const getRarityColor = (rarity) => {
        const colors = {
            common: "bg-slate-100 text-slate-800 border-slate-300",
            rare: "bg-blue-100 text-blue-800 border-blue-300",
            epic: "bg-purple-100 text-purple-800 border-purple-300",
            legendary: "bg-yellow-100 text-yellow-800 border-yellow-300"
        };
        return colors[rarity] || colors.common;
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-violet-600" />
                    Badge Collection
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-3">
                            Earned Badges ({earnedBadges.length})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {earnedBadges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className={`p-4 rounded-lg border-2 text-center ${getRarityColor(badge.rarity)}`}
                                >
                                    <div className="text-4xl mb-2">{badge.icon}</div>
                                    <h5 className="font-bold text-sm mb-1">{badge.name}</h5>
                                    <p className="text-xs text-slate-600">{badge.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {availableBadges.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3">
                                Locked Badges ({availableBadges.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {availableBadges.map((badge) => (
                                    <div
                                        key={badge.id}
                                        className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50 text-center opacity-60"
                                    >
                                        <div className="text-4xl mb-2 filter grayscale">
                                            <Lock className="h-8 w-8 mx-auto text-slate-400" />
                                        </div>
                                        <h5 className="font-bold text-sm mb-1 text-slate-700">{badge.name}</h5>
                                        <Badge variant="outline" className="text-xs mb-2">
                                            {badge.rarity}
                                        </Badge>
                                        <p className="text-xs text-slate-600">{badge.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}