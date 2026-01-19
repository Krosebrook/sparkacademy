import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Target, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

export default function PersonalizedChallenges({ studentEmail, courseId }) {
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges', studentEmail, courseId],
    queryFn: () => base44.entities.DailyChallenge.filter({
      student_email: studentEmail,
      course_id: courseId,
      status: 'active'
    })
  });

  const generateChallengeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('generatePersonalizedChallenge', {
        course_id: courseId
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    }
  });

  const completeChallengeMutation = useMutation({
    mutationFn: async (challengeId) => {
      await base44.entities.DailyChallenge.update(challengeId, {
        status: 'completed',
        completed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['studentPoints'] });
    }
  });

  const generateChallenge = async () => {
    setGenerating(true);
    try {
      await generateChallengeMutation.mutateAsync();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            Your Challenges
          </CardTitle>
          <Button
            size="sm"
            onClick={generateChallenge}
            disabled={generating}
            className="btn-secondary"
          >
            {generating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
            New Challenge
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="font-medium text-white text-sm mb-1">{challenge.title}</div>
                <p className="text-xs text-gray-400">{challenge.description}</p>
              </div>
              <Badge className="bg-green-500/20 text-green-300 text-xs">
                +{challenge.points} pts
              </Badge>
            </div>
            {challenge.status === 'active' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => completeChallengeMutation.mutate(challenge.id)}
                disabled={completeChallengeMutation.isPending}
                className="text-xs"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Mark Complete
              </Button>
            )}
          </div>
        ))}
        {challenges.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-sm">
            No active challenges. Generate one to boost your learning!
          </div>
        )}
      </CardContent>
    </Card>
  );
}