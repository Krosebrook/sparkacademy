import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Play, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Target,
  Lightbulb,
  Search,
  Award,
  Flame
} from 'lucide-react';
import GamificationStats from '@/components/gamification/GamificationStats';
import LeaderboardWidget from '@/components/gamification/LeaderboardWidget';

export default function StudyDashboard() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: employeeProfile } = useQuery({
    queryKey: ['employee-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.EmployeeProfile.filter({ employee_email: user.email });
      return profiles[0];
    },
    enabled: !!user
  });

  const recentSaves = [
    {
      type: 'AI Summary',
      content: '"Neural networks learn through iterative weight adjustments using backpropagation..."',
      time: '12m ago',
      color: 'purple'
    },
    {
      type: 'Key Definition',
      content: '"Gradient Descent is an optimization algorithm for finding local minima..."',
      time: '1h ago',
      color: 'emerald'
    }
  ];

  const keyConcepts = [
    'Backpropagation',
    'Gradient Descent',
    'Neural Architecture',
    'Loss Functions',
    'Activation Functions',
    'Optimization'
  ];

  return (
    <div className="min-h-screen bg-[#0f0618] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0f0618]/80 backdrop-blur-md border-b border-purple-500/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              {user?.full_name?.[0] || 'A'}
            </div>
            <div>
              <h2 className="font-bold">INTInc Learning</h2>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <main className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Welcome & Gamification Stats */}
        <div className="pt-4 space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Ready to study, {user?.full_name?.split(' ')[0] || 'there'}?
            </h1>
            <p className="text-gray-400">You have 3 learning goals remaining today.</p>
          </div>
          
          {/* Gamification Stats Bar */}
          <GamificationStats />
        </div>

        {/* AI-Generated Review */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border-purple-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI-Generated Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div>
              <p className="text-xl font-bold mb-1">5-minute Refresher</p>
              <p className="text-sm text-gray-400">
                Based on your recent Neural Networks lesson from 2 hours ago.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Button className="bg-purple-500 hover:bg-purple-600 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <Play className="w-4 h-4 mr-2" />
                Start Now
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recently Saved */}
        <div>
          <h3 className="text-lg font-bold mb-4">Recently Saved</h3>
          <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
            {recentSaves.map((save, idx) => (
              <Card key={idx} className={`flex-none w-72 bg-${save.color}-900/20 border-${save.color}-500/20 border-l-4 border-l-${save.color}-500`}>
                <CardContent className="p-4">
                  <Badge className={`mb-2 bg-${save.color}-500/20 text-${save.color}-300 text-xs`}>
                    {save.type}
                  </Badge>
                  <p className="text-sm mb-3 line-clamp-3">{save.content}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {save.time}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Concepts */}
        <div>
          <h3 className="text-lg font-bold mb-4">Key Concepts</h3>
          <div className="flex flex-wrap gap-2">
            {keyConcepts.map((concept, idx) => (
              <Badge 
                key={idx}
                className={idx < 3 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 px-4 py-2' 
                  : 'bg-gray-800 text-gray-400 border-gray-700 px-4 py-2'
                }
              >
                {concept}
              </Badge>
            ))}
          </div>
        </div>

        {/* Flashcard Deck */}
        <Card className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 border-pink-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Flashcard Deck</h3>
                <p className="text-sm text-gray-400">15 cards to review today</p>
              </div>
              <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(236, 72, 153, 0.2)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="3"
                    strokeDasharray="75, 100"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-pink-400">75%</span>
                </div>
              </div>
            </div>
            <Button className="w-full bg-pink-600 hover:bg-pink-700 shadow-[0_0_20px_rgba(236,72,153,0.3)] h-12 text-base">
              <Play className="w-5 h-5 mr-2" />
              Start Review
            </Button>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <LeaderboardWidget />

        {/* Saved Lessons */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Saved Lessons</h3>
            <Button variant="link" className="text-purple-400 text-sm">View All</Button>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Intro to Particle Physics', time: '14 mins', updated: '2 days ago' },
              { title: 'Mathematical Foundations', time: '22 mins', updated: '5 days ago' }
            ].map((lesson, idx) => (
              <Card key={idx} className="bg-purple-900/10 border-purple-500/20 hover:bg-purple-900/20 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/20 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{lesson.title}</h4>
                    <p className="text-xs text-gray-400">Updated {lesson.updated} • {lesson.time}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}