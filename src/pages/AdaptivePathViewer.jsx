import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  CheckCircle, 
  Play,
  Clock,
  TrendingUp,
  AlertTriangle,
  Target
} from 'lucide-react';

export default function AdaptivePathViewer() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: skillsPathway } = useQuery({
    queryKey: ['skills-pathway', user?.email],
    queryFn: async () => {
      const pathways = await base44.entities.SkillsPathway.filter({
        employee_id: user.email,
        status: 'active'
      });
      return pathways[0];
    },
    enabled: !!user
  });

  const modules = [
    { title: 'Foundations of Data', status: 'completed', date: 'Oct 12' },
    { title: 'Probabilistic Theory', status: 'completed', date: 'Oct 14' },
    { title: 'Advanced Statistical Inference', status: 'active', description: 'Mastering variance, p-values, and normal distributions for predictive modeling.' },
    { title: 'Predictive Modeling & Regression', status: 'locked' },
    { title: 'Capstone Project: AI Healthcare', status: 'locked', badge: 'Mastery Certification' }
  ];

  const skillGaps = [
    { 
      title: 'Review Needed: Variance Calculation', 
      severity: 'warning',
      description: 'Your last quiz score (62%) indicates a struggle with standard deviation concepts. Re-watch Lesson 4.2.'
    },
    {
      title: 'Strength: Data Cleaning',
      severity: 'success',
      description: "You've mastered outlier detection. You can skip the optional 'Intro to Cleaning' lab."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f0618] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0f0618]/80 backdrop-blur-md border-b border-purple-500/10">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-purple-500/10 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h1 className="text-lg font-bold">INTInc Learning</h1>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Your Learning Path</h2>
          </div>

          {/* Gamification Stats */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="bg-yellow-900/20 border-yellow-500/30">
              <CardContent className="p-3 text-center">
                <Sparkles className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-yellow-400">1,250</div>
                <p className="text-[10px] text-gray-400">Points</p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-900/20 border-purple-500/30">
              <CardContent className="p-3 text-center">
                <span className="text-2xl mx-auto block mb-1">🔥</span>
                <div className="text-xl font-bold text-purple-400">7</div>
                <p className="text-[10px] text-gray-400">Streak</p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-900/20 border-blue-500/30">
              <CardContent className="p-3 text-center">
                <span className="text-2xl mx-auto block mb-1">🏆</span>
                <div className="text-xl font-bold text-blue-400">12</div>
                <p className="text-[10px] text-gray-400">Badges</p>
              </CardContent>
            </Card>
            
            <Card className="bg-emerald-900/20 border-emerald-500/30">
              <CardContent className="p-3 text-center">
                <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-emerald-400">#12</div>
                <p className="text-[10px] text-gray-400">Rank</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="bg-purple-900/20 border-purple-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-base font-semibold">Overall Progress</p>
                <p className="text-xs text-gray-400">Data Science & AI Specialization</p>
              </div>
              <p className="text-2xl font-bold text-purple-400">
                {skillsPathway?.progress_percentage || 65}%
              </p>
            </div>
            <div className="h-2 rounded-full bg-gray-800 overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                style={{ width: `${skillsPathway?.progress_percentage || 65}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              Estimated 4h 20m remaining to mastery
            </div>
          </CardContent>
        </Card>

        {/* AI Tutor Status */}
        <div className="flex items-center gap-3 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
          <div className="relative flex w-3 h-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full w-3 h-3 bg-purple-500" />
          </div>
          <p className="text-purple-300 text-sm font-medium flex-1">AI Tutor: Ready to assist with Statistics</p>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-xs">Ask Now</Button>
        </div>

        {/* Path Visualization */}
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1 mb-3">Path Visualization</p>
          
          {modules.map((module, idx) => (
            <div key={idx} className="grid grid-cols-[48px_1fr] gap-3 items-start">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  module.status === 'completed' 
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : module.status === 'active'
                    ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                    : 'bg-gray-800 text-gray-500'
                }`}>
                  {module.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : module.status === 'active' ? (
                    <Play className="w-5 h-5" />
                  ) : (
                    <span className="text-xs">🔒</span>
                  )}
                </div>
                {idx < modules.length - 1 && (
                  <div className={`w-0.5 h-12 ${
                    module.status === 'completed' || idx < 2 ? 'bg-purple-500' : 'border-l-2 border-dashed border-gray-700'
                  }`} />
                )}
              </div>

              <div className={`pb-8 ${module.status === 'active' ? 'pt-0' : 'pt-2'}`}>
                {module.status === 'active' ? (
                  <Card className="bg-purple-900/30 border-2 border-purple-500 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                    <CardContent className="p-5">
                      <Badge className="mb-2 bg-purple-500/20 text-purple-300 text-xs">Current Active Module</Badge>
                      <h3 className="text-lg font-bold mb-2">{module.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{module.description}</p>
                      
                      <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg mb-4 flex items-center justify-center">
                        <Target className="w-12 h-12 text-purple-400/40" />
                      </div>

                      <Button className="w-full bg-purple-600 hover:bg-purple-700 h-11">
                        <Play className="w-5 h-5 mr-2" />
                        Continue Learning
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div>
                    <p className={`text-base font-semibold ${
                      module.status === 'completed' ? 'line-through text-gray-500' : ''
                    }`}>
                      {module.title}
                    </p>
                    {module.date && (
                      <p className="text-xs text-gray-500">Completed on {module.date}</p>
                    )}
                    {module.badge && (
                      <Badge className="mt-2 bg-blue-500/20 text-blue-300 text-xs">
                        {module.badge}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Skill Gap Insights */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Skill Gap Insights</h3>
            <Button variant="link" className="text-purple-400 text-sm">AI Generated</Button>
          </div>

          <div className="space-y-3">
            {skillGaps.map((gap, idx) => (
              <Card key={idx} className={`${
                gap.severity === 'warning'
                  ? 'bg-yellow-900/20 border-yellow-500/30'
                  : 'bg-emerald-900/20 border-emerald-500/30'
              }`}>
                <CardContent className="p-4 flex gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    gap.severity === 'warning'
                      ? 'bg-yellow-500/20'
                      : 'bg-emerald-500/20'
                  }`}>
                    {gap.severity === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{gap.title}</h4>
                    <p className="text-xs text-gray-400">{gap.description}</p>
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