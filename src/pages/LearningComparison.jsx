import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Info, TrendingUp, AlertTriangle, Zap, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function LearningComparison() {
  const [selectedModel, setSelectedModel] = useState('personalized');

  return (
    <div className="min-h-screen bg-[#0f0618] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0f0618]/80 backdrop-blur-md border-b border-purple-500/10">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('LandingPage')}>
              <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <p className="text-xs uppercase tracking-widest text-purple-400 font-bold">Scenario Comparison</p>
              <h1 className="text-lg font-bold">Standardized vs Personalized</h1>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
            <Info className="w-5 h-5 text-purple-400" />
          </Button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6 pb-24">
        {/* Toggle */}
        <div className="bg-gray-800/50 p-1.5 rounded-xl flex items-center h-14 mb-12 max-w-md mx-auto">
          <button
            onClick={() => setSelectedModel('standardized')}
            className={`flex-1 h-full rounded-lg text-sm font-bold transition-all ${
              selectedModel === 'standardized'
                ? 'bg-pink-600 text-white shadow-lg'
                : 'text-gray-400'
            }`}
          >
            Standardized
          </button>
          <button
            onClick={() => setSelectedModel('personalized')}
            className={`flex-1 h-full rounded-lg text-sm font-bold transition-all ${
              selectedModel === 'personalized'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400'
            }`}
          >
            Personalized
          </button>
        </div>

        {/* Split Comparison */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Standardized Model */}
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Badge className="mb-2 bg-pink-500/20 text-pink-300 border-pink-500/30">Old Model</Badge>
              <h2 className="text-2xl font-bold italic">Fixed Pace</h2>
            </div>

            {/* Inefficiency Report */}
            <Card className="bg-pink-900/20 border-pink-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider">Inefficiency Report</h3>
                  <Badge className="bg-pink-500/20 text-pink-300 text-xs">High Attrition</Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 h-40 items-end mb-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-full bg-pink-500/30 border-t-2 border-pink-500" style={{ height: '85%' }} />
                    <p className="text-pink-400 text-xs font-bold text-center uppercase leading-tight">Skill Gaps</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-full bg-pink-500/50 border-t-2 border-pink-500" style={{ height: '100%' }} />
                    <p className="text-pink-400 text-xs font-bold text-center uppercase leading-tight">Wasted Potential</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-full bg-pink-500/20 border-t-2 border-pink-400" style={{ height: '40%' }} />
                    <p className="text-pink-300 text-xs font-bold text-center uppercase leading-tight">Drop-out Risk</p>
                  </div>
                </div>

                <div className="border-t border-pink-500/20 pt-4 flex justify-between items-center">
                  <p className="text-xs text-gray-400 italic">Efficiency vs Optimal</p>
                  <p className="text-pink-400 text-xl font-bold">-48%</p>
                </div>
              </CardContent>
            </Card>

            {/* Constraints */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-pink-400 uppercase tracking-wider">Systemic Constraints</h4>
              {[
                { 
                  icon: Users, 
                  title: 'One-Size-Fits-All', 
                  desc: 'Static design ignores individual cognitive baselines.'
                },
                { 
                  icon: AlertTriangle, 
                  title: 'Time-Based Progression', 
                  desc: 'Completion prioritized over mastery.'
                },
                { 
                  icon: AlertTriangle, 
                  title: 'Disconnected Skillsets', 
                  desc: 'Knowledge fragmented into silos.'
                }
              ].map((item, idx) => (
                <Card key={idx} className="bg-pink-900/10 border-pink-500/20">
                  <CardContent className="p-4 flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-pink-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm mb-1">{item.title}</h5>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center py-8">
              <div className="text-3xl font-bold text-pink-400 mb-2">45%</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Average Engagement</div>
            </div>
          </div>

          {/* Personalized Model */}
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Badge className="mb-2 bg-purple-500/20 text-purple-300 border-purple-500/30">New Model</Badge>
              <h2 className="text-2xl font-bold italic">Adaptive Mastery</h2>
            </div>

            {/* Time to Mastery */}
            <Card className="bg-purple-900/30 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Efficiency Metrics</h3>
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>

                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3 mb-2">
                    <div className="text-4xl font-bold">85%</div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-bold">+40%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Faster Mastery</p>
                </div>

                {/* Progress Visualization */}
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(139, 92, 246, 0.2)"
                      strokeWidth="4"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="4"
                      strokeDasharray="85, 100"
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">85%</span>
                  </div>
                </div>

                <p className="text-xs text-center text-gray-400 italic">
                  Dynamic pacing ensures full competence before progression.
                </p>
              </CardContent>
            </Card>

            {/* Advantages */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Key Advantages</h4>
              {[
                {
                  icon: Target,
                  title: '1-on-1 AI Mentorship',
                  desc: 'Digital tutor available 24/7, adapting to cognitive profile.',
                  metric: '99%'
                },
                {
                  icon: Zap,
                  title: 'Project-Based Milestones',
                  desc: 'Real-world scenarios proven through application.',
                  metric: '92%'
                },
                {
                  icon: TrendingUp,
                  title: 'Industry-Aligned Skills',
                  desc: 'Curriculum adapts to market demands in real-time.',
                  metric: '3.2x'
                }
              ].map((item, idx) => (
                <Card key={idx} className="bg-purple-900/20 border-purple-500/30 hover:bg-purple-900/30 transition-all">
                  <CardContent className="p-4 flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-sm mb-1">{item.title}</h5>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-400">{item.metric}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center py-8">
              <div className="text-3xl font-bold text-purple-400 mb-2">92%</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Optimal Engagement</div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Choose Your Learning Path</h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Traditional training creates completion metrics. AI-driven learning creates mastery and measurable business impact.
          </p>
          <Link to={createPageUrl('Billing')}>
            <Button className="bg-purple-600 hover:bg-purple-700 h-12 px-8 text-lg shadow-[0_0_30px_rgba(139,92,246,0.4)]">
              Start Personalized Learning
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}