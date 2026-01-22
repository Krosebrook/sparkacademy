import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, TrendingUp } from 'lucide-react';

export default function LeaderboardWidget({ compact = false }) {
  const topLearners = [
    { name: 'Sarah Chen', points: 2840, streak: 15, position: 1 },
    { name: 'Marcus Johnson', points: 2650, streak: 12, position: 2 },
    { name: 'You', points: 1250, streak: 7, position: 12, isCurrentUser: true },
    { name: 'Emma Davis', points: 1180, streak: 5, position: 13 },
    { name: 'Alex Thompson', points: 1050, streak: 4, position: 14 }
  ];

  const getPositionColor = (pos) => {
    if (pos === 1) return 'text-yellow-400';
    if (pos === 2) return 'text-gray-400';
    if (pos === 3) return 'text-orange-400';
    return 'text-gray-500';
  };

  const getPositionIcon = (pos) => {
    if (pos === 1) return <Trophy className="w-4 h-4 text-yellow-400" />;
    if (pos === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (pos === 3) return <Medal className="w-4 h-4 text-orange-400" />;
    return <span className="text-xs font-bold text-gray-500">#{pos}</span>;
  };

  return (
    <Card className="bg-purple-900/20 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Weekly Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {topLearners.map((learner, idx) => (
          <div 
            key={idx}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              learner.isCurrentUser 
                ? 'bg-purple-500/20 border border-purple-500/40 shadow-[0_0_15px_rgba(139,92,246,0.2)]' 
                : 'bg-purple-900/10 hover:bg-purple-900/20'
            }`}
          >
            <div className="w-8 flex items-center justify-center">
              {getPositionIcon(learner.position)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={`font-semibold text-sm ${learner.isCurrentUser ? 'text-purple-300' : ''}`}>
                  {learner.name}
                </p>
                {learner.isCurrentUser && (
                  <Badge className="bg-purple-500/30 text-purple-200 text-xs border-0">You</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{learner.points.toLocaleString()} XP</span>
                <span className="flex items-center gap-1">
                  🔥 {learner.streak} days
                </span>
              </div>
            </div>

            {learner.position <= 3 && !learner.isCurrentUser && (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}