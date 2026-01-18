import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trophy, Medal, Award } from 'lucide-react';

export default function MiniLeaderboard({ userEmail }) {
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => base44.entities.LeaderboardEntry?.list('-score', 10)
  });

  const userRank = leaderboard?.findIndex(entry => entry.student_email === userEmail) + 1 || null;

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return <Award className="w-4 h-4 text-gray-500" />;
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Leaderboard
          </CardTitle>
          {userRank && (
            <Badge variant="outline">Your Rank: #{userRank}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard?.slice(0, 5).map((entry, idx) => {
            const isCurrentUser = entry.student_email === userEmail;
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  isCurrentUser ? 'bg-purple-600/20 border border-purple-500/30' : 'bg-gray-800/30'
                }`}
              >
                <div className="flex-shrink-0 w-8 text-center">
                  {getRankIcon(idx + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">
                    {entry.student_name || 'Anonymous'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {entry.courses_completed || 0} courses
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-400">{entry.score || 0}</div>
                  <div className="text-xs text-gray-500">pts</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}