import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, TrendingUp, Filter, Crown } from 'lucide-react';

export default function EnhancedLeaderboard() {
  const [filterType, setFilterType] = useState('overall');
  const [timeRange, setTimeRange] = useState('week');

  const leaderboards = {
    overall: [
      { name: 'Sarah Chen', points: 2840, streak: 15, position: 1, courses: 12, avatar: 'SC' },
      { name: 'Marcus Johnson', points: 2650, streak: 12, position: 2, courses: 10, avatar: 'MJ' },
      { name: 'Emma Davis', points: 2420, streak: 18, position: 3, courses: 11, avatar: 'ED' },
      { name: 'You', points: 1250, streak: 7, position: 12, isCurrentUser: true, courses: 5, avatar: 'U' },
      { name: 'Alex Thompson', points: 1180, streak: 5, position: 13, courses: 6, avatar: 'AT' }
    ],
    course: [
      { name: 'David Lee', points: 980, course: 'ML Fundamentals', position: 1, avatar: 'DL' },
      { name: 'You', points: 850, course: 'ML Fundamentals', position: 2, isCurrentUser: true, avatar: 'U' },
      { name: 'Lisa Wang', points: 820, course: 'ML Fundamentals', position: 3, avatar: 'LW' }
    ],
    skill: [
      { name: 'Jordan Kim', points: 1450, skill: 'React Development', position: 1, avatar: 'JK' },
      { name: 'Taylor Brown', points: 1280, skill: 'React Development', position: 2, avatar: 'TB' },
      { name: 'You', points: 950, skill: 'React Development', position: 5, isCurrentUser: true, avatar: 'U' }
    ]
  };

  const currentLeaderboard = leaderboards[filterType] || leaderboards.overall;

  const getPositionBadge = (pos) => {
    if (pos === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (pos === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (pos === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="text-sm font-bold text-gray-500">#{pos}</span>;
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/10 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Leaderboard
          </CardTitle>
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
            {timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'All Time'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Controls */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              onClick={() => setFilterType('overall')}
              variant={filterType === 'overall' ? 'default' : 'outline'}
              size="sm"
              className={filterType === 'overall' 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'border-purple-500/30 hover:bg-purple-500/10'
              }
            >
              Overall
            </Button>
            <Button
              onClick={() => setFilterType('course')}
              variant={filterType === 'course' ? 'default' : 'outline'}
              size="sm"
              className={filterType === 'course' 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'border-purple-500/30 hover:bg-purple-500/10'
              }
            >
              By Course
            </Button>
            <Button
              onClick={() => setFilterType('skill')}
              variant={filterType === 'skill' ? 'default' : 'outline'}
              size="sm"
              className={filterType === 'skill' 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'border-purple-500/30 hover:bg-purple-500/10'
              }
            >
              By Skill
            </Button>
          </div>

          <div className="flex gap-2">
            {['week', 'month', 'alltime'].map(range => (
              <Button
                key={range}
                onClick={() => setTimeRange(range)}
                variant="ghost"
                size="sm"
                className={`text-xs ${timeRange === range ? 'text-purple-400' : 'text-gray-500'}`}
              >
                {range === 'alltime' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-2">
          {currentLeaderboard.map((entry, idx) => (
            <div 
              key={idx}
              className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
                entry.isCurrentUser 
                  ? 'bg-purple-500/20 border-2 border-purple-500/40 shadow-[0_0_20px_rgba(139,92,246,0.2)]' 
                  : entry.position <= 3
                  ? 'bg-yellow-900/10 border border-yellow-500/20'
                  : 'bg-gray-900/20 border border-gray-700/20 hover:bg-gray-900/40'
              }`}
            >
              <div className="w-10 flex items-center justify-center">
                {getPositionBadge(entry.position)}
              </div>
              
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold flex-shrink-0">
                {entry.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`font-semibold truncate ${entry.isCurrentUser ? 'text-purple-300' : ''}`}>
                    {entry.name}
                  </p>
                  {entry.isCurrentUser && (
                    <Badge className="bg-purple-500/30 text-purple-200 text-xs border-0">You</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="font-bold text-purple-400">{entry.points.toLocaleString()} XP</span>
                  {entry.streak && (
                    <span className="flex items-center gap-1">
                      🔥 {entry.streak} days
                    </span>
                  )}
                  {entry.courses && (
                    <span>{entry.courses} courses</span>
                  )}
                  {entry.course && (
                    <span className="text-cyan-400">{entry.course}</span>
                  )}
                  {entry.skill && (
                    <span className="text-blue-400">{entry.skill}</span>
                  )}
                </div>
              </div>

              {entry.position === 1 && (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}