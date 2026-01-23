import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Zap, TrendingUp, Award, Users, Target, Gift, 
  BarChart3, ShoppingBag, User, Home
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PersonalEnergyHub() {
  const [user, setUser] = useState(null);
  const [energyData, setEnergyData] = useState({
    level: 75,
    trend: 'up',
    levelName: 'TRENDING_UP LEVEL 24',
    xpToNext: 1250,
    totalPoints: 12450,
    pointsChange: 120,
    currentRank: 'Top 5%',
    rankBadge: '⭐ Rising Star'
  });

  const [dailyQuest, setDailyQuest] = useState({
    title: 'Maintain your streak!',
    description: 'Complete one more task to earn',
    xpReward: 500,
    progress: 75
  });

  const [recentActivity, setRecentActivity] = useState([
    { user: 'Sarah Chen', action: 'recognized you', time: '2m', icon: '✨', type: 'recognition' },
    { user: 'New Milestone', action: 'Daily Peak', time: '1h', icon: '🎯', type: 'milestone' },
    { user: 'Achievement', action: 'Skill Mastered', time: '3h', icon: '🏆', type: 'achievement' }
  ]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-amber-900/30 to-transparent p-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              🌅
            </div>
            <h1 className="text-2xl font-bold text-white">Dawn Hub</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-gray-300 hover:bg-slate-700/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-amber-400 flex items-center justify-center text-white font-bold">
              {user?.full_name?.[0] || 'A'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 pb-24">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">WELCOME BACK, {user?.full_name?.split(' ')[0]?.toUpperCase() || 'ALEX'}</p>
          <h2 className="text-3xl font-bold text-white mb-6">Ready for the day?</h2>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm border-slate-600/50 text-white">
              <CardContent className="p-6">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total Points</p>
                <p className="text-4xl font-bold mb-2">{energyData.totalPoints.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  +{energyData.pointsChange} today
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/80 to-orange-900/80 backdrop-blur-sm border-purple-600/50 text-white">
              <CardContent className="p-6">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Current Rank</p>
                <p className="text-4xl font-bold mb-2">{energyData.currentRank}</p>
                <div className="flex items-center gap-1 text-purple-300 text-sm font-semibold">
                  ⭐ Rising Star
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Daily Quest */}
        <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-purple-500/30 text-white mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-orange-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" fill="white" />
                </div>
                <span className="font-bold uppercase tracking-wide">DAILY QUEST</span>
              </div>
              <Badge className="bg-purple-600 text-white font-bold">
                {dailyQuest.progress}% Complete
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dailyQuest.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                />
              </div>
            </div>

            <p className="text-sm text-gray-300 mb-2">{dailyQuest.title}</p>
            <p className="text-xs text-gray-400">
              {dailyQuest.description} <span className="text-purple-400 font-bold">+{dailyQuest.xpReward} XP</span>
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: Award, label: 'Awards', color: 'from-purple-500 to-orange-500' },
            { icon: Target, label: 'Quests', color: 'from-purple-600 to-pink-500' },
            { icon: Users, label: 'Social', color: 'from-orange-500 to-pink-500' },
            { icon: Gift, label: 'Give', color: 'from-purple-700 to-orange-600' }
          ].map((action, idx) => (
            <button
              key={idx}
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl border border-slate-600/50 hover:border-purple-500/50 transition-all"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-300 font-semibold">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300 text-sm">
              History
            </Button>
          </div>

          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm border-slate-600/50 hover:border-purple-500/50 transition-all">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full flex items-center justify-center text-2xl">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        <span className="text-purple-400">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-400">{activity.time} ago</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button className="flex flex-col items-center gap-1 text-purple-400">
              <Home className="w-6 h-6" />
              <span className="text-xs font-bold">HOME</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-purple-400 transition-colors">
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs font-bold">RANK</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-amber-400 transition-colors">
              <ShoppingBag className="w-6 h-6" />
              <span className="text-xs font-bold">SHOP</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-amber-400 transition-colors">
              <User className="w-6 h-6" />
              <span className="text-xs font-bold">ME</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}