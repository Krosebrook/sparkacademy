import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  TrendingUp, 
  Target,
  Maximize2,
  Bell,
  Search,
  Play,
  Eye,
  AlertCircle
} from 'lucide-react';

export default function DynamicSkillMap() {
  const [filter, setFilter] = useState('recommended');

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

  const { data: employeeProfile } = useQuery({
    queryKey: ['employee-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.EmployeeProfile.filter({ employee_email: user.email });
      return profiles[0];
    },
    enabled: !!user
  });

  const projects = [
    {
      title: 'Neural Network Optimizer',
      description: 'Apply pruning techniques to reduce model latency in edge-computing environments.',
      skillMatch: 86,
      difficulty: 'Recommended',
      badge: 'Career-Aligned',
      timeToComplete: '5h',
      impact: 'Improves job readiness by 15%',
      aiInsight: 'This project bridges your Python and ML skills. Recommended because you lack experience in Neural Networks.',
      techs: ['PyTorch', 'Python', 'CUDA']
    },
    {
      title: 'Transformers for NLP',
      description: 'Build a custom attention mechanism for sequence-to-sequence translation tasks.',
      skillMatch: 43,
      difficulty: 'Skill Gap',
      badge: 'Gap: LSTM/RNN',
      timeToComplete: '25h',
      impact: 'Closes advanced skill gap',
      aiInsight: 'Essential for Senior transition. Solidify your architecture design knowledge.',
      techs: ['PyTorch', 'NLP', 'Transformers']
    },
    {
      title: 'Biometric Data Pipeline',
      description: 'Design a scalable architecture for processing real-time biometric inputs from wearable devices.',
      skillMatch: 92,
      difficulty: 'Hot Topic',
      badge: 'Gap: LSTM/RNN',
      timeToComplete: '18h',
      impact: 'Essential for Senior transition',
      aiInsight: 'Excellent synergy with your data engineering background.',
      techs: ['Python', 'Kafka', 'TensorFlow']
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f0618] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0f0618]/80 backdrop-blur-md border-b border-purple-500/10">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-purple-500/10 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h1 className="text-lg font-bold">INTInc AI</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hover:bg-purple-500/10 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-purple-500/50 flex items-center justify-center">
              {user?.full_name?.[0] || 'U'}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Skill Map Visualization */}
        <Card className="bg-gradient-to-br from-cyan-950/50 to-purple-950/30 border-cyan-500/20 relative overflow-hidden h-64"
          style={{
            backgroundImage: 'radial-gradient(rgba(6, 188, 249, 0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        >
          {/* Skill nodes with connections */}
          <div className="absolute inset-0 p-6">
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full opacity-30">
              <line x1="20%" y1="40%" x2="50%" y2="50%" stroke="#0db9f2" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="80%" y1="60%" x2="50%" y2="50%" stroke="#0db9f2" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="30%" y1="70%" x2="50%" y2="50%" stroke="#0db9f2" strokeWidth="2" />
            </svg>

            {/* Python node */}
            <div className="absolute top-[40%] left-[15%] flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-cyan-500 shadow-[0_0_20px_rgba(6,188,249,0.6)] flex items-center justify-center border-2 border-white/20">
                <span className="text-xs font-bold">Py</span>
              </div>
              <span className="text-[10px] mt-1 font-bold">Python</span>
            </div>

            {/* Central "You" node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-purple-500/20 border-2 border-purple-500 shadow-[0_0_25px_rgba(139,92,246,0.5)] flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <Badge className="mt-2 bg-purple-500/20 text-purple-300 text-xs border-purple-500/40">You</Badge>
            </div>

            {/* SQL node */}
            <div className="absolute top-[30%] right-[15%] flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-cyan-500 shadow-[0_0_20px_rgba(6,188,249,0.6)] flex items-center justify-center border-2 border-white/20">
                <span className="text-xs font-bold">SQL</span>
              </div>
              <span className="text-[10px] mt-1 font-bold">SQL Mastery</span>
            </div>

            {/* Neural Nets (gap) */}
            <div className="absolute bottom-[30%] left-[25%] flex flex-col items-center opacity-60">
              <div className="w-8 h-8 rounded-full border-2 border-gray-500 bg-gray-800 flex items-center justify-center">
                <span className="text-xs">🧠</span>
              </div>
              <span className="text-[10px] mt-1 font-bold text-gray-500">Neural Nets</span>
            </div>
          </div>
          
          <CardContent className="relative z-10 flex flex-col items-center justify-center h-full text-center">
            <Badge className="mb-3 bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
              Your Dynamic Skill Map
            </Badge>
            <h2 className="text-3xl font-bold mb-1">{skillsPathway?.pathway_name || 'Machine Learning'}</h2>
            <p className="text-gray-400 text-sm">42 Nodes • 8 Proficiency Paths</p>
            
            <Button 
              variant="outline" 
              size="sm"
              className="absolute bottom-4 right-4 border-cyan-500/30 hover:bg-cyan-500/10"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Expand Map
            </Button>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-purple-900/20 border-purple-500/20">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs mb-1">Job Readiness</p>
              <p className="text-2xl font-bold mb-1">+15%</p>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                <TrendingUp className="w-3 h-3" />
                THIS MONTH
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-900/20 border-blue-500/20">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs mb-1">Skill Network</p>
              <p className="text-2xl font-bold mb-1">42 Nodes</p>
              <p className="text-purple-400 text-xs font-bold">+2 NEW</p>
            </CardContent>
          </Card>
          
          <Card className="bg-pink-900/20 border-pink-500/20">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs mb-1">Focus Area</p>
              <p className="text-2xl font-bold mb-1">PyTorch</p>
              <p className="text-pink-400 text-xs font-bold uppercase">High Priority</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['recommended', 'career-aligned', 'skill-gap'].map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              className={filter === f 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'border-purple-500/30 hover:bg-purple-500/10'
              }
            >
              {f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Button>
          ))}
        </div>

        {/* AI-Suggested Projects */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI-Suggested Projects
          </h3>
          
          <div className="space-y-4">
            {projects.map((project, idx) => (
              <Card key={idx} className="bg-gray-900/40 border-cyan-500/20 hover:border-cyan-500/40 transition-all overflow-hidden group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`text-xs uppercase ${
                          project.difficulty === 'Recommended' 
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            : project.difficulty === 'Skill Gap'
                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                            : 'bg-pink-600/30 text-pink-200 border-pink-500/40'
                        }`}>
                          {project.difficulty}
                        </Badge>
                        {project.badge && (
                          <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                            {project.badge}
                          </Badge>
                        )}
                        <Badge className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                          {project.skillMatch}% Match
                        </Badge>
                      </div>
                      <h4 className="text-xl font-bold mb-2">{project.title}</h4>
                      <p className="text-gray-400 text-sm mb-3">{project.description}</p>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {project.techs?.map((tech, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-cyan-500/20 text-gray-300">
                            {tech}
                          </Badge>
                        ))}
                      </div>

                      {/* AI Insight */}
                      <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-cyan-300 mb-1">AI Insight</p>
                            <p className="text-xs text-gray-400">{project.aiInsight}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-cyan-500/10">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                      <TrendingUp className="w-3 h-3" />
                      {project.impact}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                        <Play className="w-4 h-4 mr-1" />
                        Enroll in Project
                      </Button>
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="mt-3 pt-3 border-t border-cyan-500/10">
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(6,188,249,0.5)]" 
                        style={{ width: `${project.skillMatch}%` }} 
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-gray-400">{project.timeToComplete} to complete</span>
                      <span className="text-cyan-400 font-bold">Based on your learning path</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Tip Banner */}
        <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/20 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1">AI Tip</p>
                <p className="text-gray-400 text-xs">
                  You're just 3 projects away from matching a Senior Data Scientist role profile.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}