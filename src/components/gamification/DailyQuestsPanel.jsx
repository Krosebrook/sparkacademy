import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Users, Lightbulb, Coffee, CheckCircle2, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DailyQuestsPanel({ quests, onClaimRewards }) {
  const completedQuests = quests?.filter(q => q.completed).length || 0;
  const totalQuests = quests?.length || 5;
  const progressPercentage = (completedQuests / totalQuests) * 100;
  const streakDays = 5; // Could be passed as prop

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-slate-700 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <CardHeader className="relative pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <span>Your Daily Climb</span>
          </CardTitle>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="1.5"/>
              <circle cx="10" cy="5" r="1.5"/>
              <circle cx="10" cy="15" r="1.5"/>
            </svg>
          </Button>
        </div>

        {/* Progress Circle */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
                fill="none"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (440 * progressPercentage) / 100 }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{
                  strokeDasharray: 440,
                }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold">{completedQuests}/{totalQuests}</div>
              <div className="text-sm text-amber-400 font-semibold uppercase tracking-wide">Quests</div>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-3">Daily Goal Progress</p>
        </div>

        {/* Streak Badge */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl p-4 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <div className="font-bold text-lg">{streakDays} Day Streak</div>
              <div className="text-sm text-gray-400">You're on fire! Keep going.</div>
            </div>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${i < streakDays ? 'bg-amber-500' : 'bg-gray-600'}`}
              />
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-3">
        <h3 className="text-lg font-bold mb-4">Today's Quests</h3>

        {/* Quest Cards */}
        {(quests || [
          { id: 1, title: 'Team Cheer', description: 'Send 3 recognitions', xp: 50, progress: 2, total: 3, icon: Users, completed: false },
          { id: 2, title: 'Insight Explorer', description: 'Read the weekly AI Insight', xp: 100, badge: 'RARE BADGE', icon: Lightbulb, completed: false },
          { id: 3, title: 'Morning Standup', description: 'Participate in daily sync', xp: 75, icon: Coffee, completed: true }
        ]).map((quest, idx) => {
          const Icon = quest.icon;
          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className={`bg-gradient-to-r from-slate-800/60 to-slate-800/40 backdrop-blur-sm rounded-2xl p-4 border transition-all ${
                quest.completed 
                  ? 'border-emerald-500/30 bg-emerald-900/20' 
                  : 'border-slate-700/50 hover:border-slate-600'
              }`}>
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    quest.completed 
                      ? 'bg-emerald-900/40' 
                      : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
                  }`}>
                    {quest.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Icon className="w-6 h-6 text-amber-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold">{quest.title}</h4>
                      <div className="flex items-center gap-2">
                        {quest.badge && (
                          <span className="px-2 py-0.5 bg-amber-500 text-amber-950 text-xs font-bold rounded uppercase">
                            {quest.badge}
                          </span>
                        )}
                        <span className="text-amber-400 font-bold text-sm">{quest.xp} XP</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{quest.description}</p>
                    
                    {/* Progress bar */}
                    {quest.progress !== undefined && !quest.completed && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                            style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{quest.progress}/{quest.total}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Claim Rewards Button */}
        <Button
          onClick={onClaimRewards}
          disabled={completedQuests === 0}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6 rounded-2xl text-lg shadow-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Gift className="w-5 h-5 mr-2" />
          Claim Rewards
        </Button>
      </CardContent>
    </Card>
  );
}