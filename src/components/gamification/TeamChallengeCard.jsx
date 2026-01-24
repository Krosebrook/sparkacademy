import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Clock, CheckCircle2, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function TeamChallengeCard({ challenge, onJoin, onViewDetails }) {
  const timeRemaining = challenge.end_date 
    ? Math.max(0, Math.floor((new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  const completedObjectives = challenge.objectives?.filter(o => o.completed).length || 0;
  const totalObjectives = challenge.objectives?.length || 0;

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30 hover:border-purple-500/60 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${
                challenge.challenge_type === 'competitive' ? 'bg-orange-500' :
                challenge.challenge_type === 'cooperative' ? 'bg-green-500' :
                'bg-purple-600'
              } text-white`}>
                {challenge.challenge_type}
              </Badge>
              {challenge.status === 'active' && (
                <Badge className="bg-green-900/50 text-green-300 border border-green-500/50">
                  Active
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl text-white">{challenge.title}</CardTitle>
            <p className="text-gray-400 text-sm mt-1">{challenge.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Info */}
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold">
              {challenge.team_members?.length || 0} Members
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Trophy className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold">
              {challenge.total_xp_reward} XP
            </span>
          </div>
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold">
                {timeRemaining}d left
              </span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-white font-semibold">
              {completedObjectives}/{totalObjectives} objectives
            </span>
          </div>
          <Progress 
            value={(completedObjectives / totalObjectives) * 100} 
            className="h-2 bg-slate-700"
          />
        </div>

        {/* Objectives Preview */}
        {challenge.objectives && challenge.objectives.slice(0, 2).map((obj, idx) => (
          <div key={idx} className="flex items-start gap-2 text-sm">
            {obj.completed ? (
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            ) : (
              <Target className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            )}
            <span className={obj.completed ? 'text-gray-500 line-through' : 'text-gray-300'}>
              {obj.title}
            </span>
          </div>
        ))}
        {challenge.objectives && challenge.objectives.length > 2 && (
          <p className="text-xs text-gray-500">+{challenge.objectives.length - 2} more objectives</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => onViewDetails(challenge)}
            variant="outline"
            className="flex-1 border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
          >
            View Details
          </Button>
          {onJoin && (
            <Button
              onClick={() => onJoin(challenge)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
            >
              Join Challenge
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}