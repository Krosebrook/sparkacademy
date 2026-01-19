import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Trophy, Medal, Crown } from 'lucide-react';

export default function CourseLeaderboard({ courseId, studentEmail }) {
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard', courseId],
    queryFn: () => base44.entities.LeaderboardEntry.filter({ course_id: courseId }, '-score', 10)
  });

  const currentUserRank = leaderboard.findIndex(entry => entry.student_email === studentEmail) + 1;

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="text-gray-500 text-sm font-semibold">{rank}</span>;
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Course Leaderboard
        </CardTitle>
        {currentUserRank > 0 && (
          <p className="text-sm text-gray-400">You're ranked #{currentUserRank}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map((entry, idx) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                entry.student_email === studentEmail
                  ? 'bg-cyan-900/30 border border-cyan-500/30'
                  : 'bg-gray-800/30'
              }`}
            >
              <div className="w-8 flex items-center justify-center">
                {getRankIcon(idx + 1)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white text-sm">
                  {entry.student_name || 'Student'}
                  {entry.student_email === studentEmail && (
                    <Badge className="ml-2 bg-cyan-500/20 text-cyan-300 text-xs">You</Badge>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {entry.score} points • {entry.completion_percentage}% complete
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}