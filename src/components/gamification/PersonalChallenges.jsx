import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Target, Clock, Trophy, TrendingUp } from 'lucide-react';

export default function PersonalChallenges({ userEmail }) {
  const { data: challenges } = useQuery({
    queryKey: ['personal-challenges', userEmail],
    queryFn: () => base44.entities.PersonalChallenge.filter({
      user_email: userEmail,
      status: 'active'
    })
  });

  if (!challenges || challenges.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No active challenges</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => {
        const progress = (challenge.goal.current_progress / challenge.goal.target) * 100;
        const daysLeft = Math.ceil(
          (new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24)
        );

        return (
          <Card key={challenge.id} className="border-l-4 border-purple-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                </div>
                <Badge className="bg-purple-100 text-purple-700">
                  {challenge.reward_xp} XP
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">
                    {challenge.goal.current_progress} / {challenge.goal.target}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{daysLeft} days left</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="capitalize">{challenge.goal.metric.replace('_', ' ')}</span>
                </div>
              </div>

              {progress >= 100 && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">
                    Challenge Complete! 🎉
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}