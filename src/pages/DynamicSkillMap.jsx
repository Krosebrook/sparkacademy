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
      timeToComplete: '5h',
      impact: 'Improves job readiness by 15%'
    },
    {
      title: 'Transformers for NLP',
      description: 'Build a custom attention mechanism for sequence-to-sequence translation tasks.',
      skillMatch: 43,
      difficulty: 'Challenge',
      timeToComplete: '8h',
      impact: 'Closes advanced skill gap'
    },
    {
      title: 'Federated Learning Hub',
      description: 'Privacy-preserving machine learning infrastructure for medical data sets.',
      skillMatch: 25,
      difficulty: 'Career Stretch',
      timeToComplete: '12h',
      impact: 'Aligns with Senior ML Scientist role'
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
        <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/10 border-purple-500/20 relative overflow-hidden h-64">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.6)] animate-pulse" />
            <div className="absolute top-20 right-20 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-12 left-24 w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-32 left-40 w-5 h-5 bg-purple-500/80 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.6)] animate-pulse" style={{ animationDelay: '0.3s' }} />
            <div className="absolute bottom-10 right-10 w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse" style={{ animationDelay: '0.8s' }} />
            
            <svg className="absolute inset-0 w-full h-full opacity-40">
              <line x1="10%" y1="20%" x2="30%" y2="50%" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="1" />
              <line x1="80%" y1="30%" x2="50%" y2="60%" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1" />
              <line x1="30%" y1="70%" x2="60%" y2="40%" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1" />
            </svg>
          </div>
          
          <CardContent className="relative z-10 flex flex-col items-center justify-center h-full text-center">
            <Badge className="mb-3 bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
              Your Dynamic Skill Map
            </Badge>
            <h2 className="text-3xl font-bold mb-1">{skillsPathway?.pathway_name || 'Machine Learning'}</h2>
            <p className="text-gray-400 text-sm">42 Nodes • 8 Proficiency Paths</p>
            
            <Button 
              variant="outline" 
              size="sm"
              className="absolute bottom-4 right-4 border-purple-500/30 hover:bg-purple-500/10"
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
              <Card key={idx} className="bg-purple-900/20 border-purple-500/20 hover:bg-purple-900/30 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs ${
                          project.difficulty === 'Recommended' 
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : project.difficulty === 'Challenge'
                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {project.difficulty}
                        </Badge>
                        <Badge className="text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          Skill Match: {project.skillMatch}%
                        </Badge>
                      </div>
                      <h4 className="text-lg font-bold mb-2">{project.title}</h4>
                      <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-purple-500/10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <AlertCircle className="w-3 h-3 text-purple-400" />
                        <span>Based on your learning path</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                        <TrendingUp className="w-3 h-3" />
                        {project.impact}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-purple-500/30 hover:bg-purple-500/10">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-purple-500/10">
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
                        style={{ width: `${project.skillMatch}%` }} 
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-gray-400">{project.timeToComplete} to complete</span>
                      <span className="text-purple-400 font-bold">25h to complete</span>
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