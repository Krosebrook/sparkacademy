import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, Star } from 'lucide-react';

const LEVELS = [
  { level: 1, title: 'Novice',      min: 0,     max: 999,   color: 'from-gray-400 to-gray-500',       ring: 'border-gray-400' },
  { level: 2, title: 'Apprentice',  min: 1000,  max: 2499,  color: 'from-green-400 to-emerald-500',   ring: 'border-green-400' },
  { level: 3, title: 'Practitioner',min: 2500,  max: 4999,  color: 'from-blue-400 to-cyan-500',       ring: 'border-blue-400' },
  { level: 4, title: 'Expert',      min: 5000,  max: 9999,  color: 'from-purple-400 to-violet-500',   ring: 'border-purple-400' },
  { level: 5, title: 'Master',      min: 10000, max: 19999, color: 'from-orange-400 to-amber-500',    ring: 'border-orange-400' },
  { level: 6, title: 'Legend',      min: 20000, max: Infinity, color: 'from-yellow-400 to-yellow-200', ring: 'border-yellow-400' },
];

export function getLevelInfo(totalPoints) {
  const pts = totalPoints || 0;
  const current = LEVELS.find(l => pts >= l.min && pts <= l.max) || LEVELS[LEVELS.length - 1];
  const next = LEVELS[current.level] || null;
  const progressPct = next
    ? Math.round(((pts - current.min) / (next.min - current.min)) * 100)
    : 100;
  const ptsToNext = next ? next.min - pts : 0;
  return { current, next, progressPct, ptsToNext, pts };
}

export default function LevelProgressCard({ totalPoints = 0 }) {
  const { current, next, progressPct, ptsToNext, pts } = getLevelInfo(totalPoints);

  return (
    <Card className="bg-gradient-to-br from-[#1a0a2e] to-[#0f0618] border-purple-500/30 overflow-hidden relative">
      {/* Background glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${current.color} opacity-5 pointer-events-none`} />
      <CardContent className="p-6">
        <div className="flex items-center gap-5">
          {/* Level badge */}
          <div className={`relative w-20 h-20 rounded-full border-4 ${current.ring} bg-gradient-to-br ${current.color} flex flex-col items-center justify-center flex-shrink-0 shadow-lg`}>
            <span className="text-2xl font-black text-white leading-none">{current.level}</span>
            <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">LVL</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white">{current.title}</h3>
              <Badge className={`bg-gradient-to-r ${current.color} text-black text-xs border-0 font-bold`}>
                Level {current.level}
              </Badge>
            </div>

            <div className="flex items-center gap-1 mb-3">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">{pts.toLocaleString()}</span>
              <span className="text-gray-400 text-sm ml-1">XP</span>
            </div>

            {next ? (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Progress to {next.title}</span>
                  <span className="text-purple-300 font-semibold">{ptsToNext.toLocaleString()} XP to go</span>
                </div>
                <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${current.color} rounded-full transition-all duration-700`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">{progressPct}% to Level {next.level}</div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-400">
                <Star className="w-4 h-4" />
                <span className="text-sm font-semibold">Maximum Level Reached!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}