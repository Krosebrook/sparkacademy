import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Award, Flame } from 'lucide-react';

export default function GamificationStats({ points = 1250, streak = 7, rank = 12, badges = 12 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="bg-yellow-900/20 border-yellow-500/30">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-400">{points.toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-400">XP Points</p>
        </CardContent>
      </Card>
      
      <Card className="bg-orange-900/20 border-orange-500/30">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-2xl font-bold text-orange-400">{streak}</span>
          </div>
          <p className="text-xs text-gray-400">Day Streak</p>
        </CardContent>
      </Card>
      
      <Card className="bg-purple-900/20 border-purple-500/30">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="text-2xl font-bold text-purple-400">{badges}</span>
          </div>
          <p className="text-xs text-gray-400">Badges</p>
        </CardContent>
      </Card>
      
      <Card className="bg-emerald-900/20 border-emerald-500/30">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-2xl font-bold text-emerald-400">#{rank}</span>
          </div>
          <p className="text-xs text-gray-400">Leaderboard</p>
        </CardContent>
      </Card>
    </div>
  );
}