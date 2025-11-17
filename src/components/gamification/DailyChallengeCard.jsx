import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, CheckCircle } from "lucide-react";

export default function DailyChallengeCard({ challenge, isCompleted, onComplete }) {
    const difficultyColors = {
        easy: "bg-green-100 text-green-800",
        medium: "bg-yellow-100 text-yellow-800",
        hard: "bg-red-100 text-red-800"
    };

    return (
        <Card className={`border-0 shadow-lg ${isCompleted ? 'bg-green-50' : ''}`}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            {challenge.title}
                        </CardTitle>
                    </div>
                    <Badge className={difficultyColors[challenge.difficulty]}>
                        {challenge.difficulty}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-slate-600 mb-4">{challenge.description}</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span className="font-semibold text-slate-900">
                            {challenge.points_reward} points
                        </span>
                    </div>
                    {isCompleted ? (
                        <Badge className="bg-green-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                        </Badge>
                    ) : (
                        <Button onClick={onComplete} size="sm">
                            Complete Challenge
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}