import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Code, Sparkles, BarChart3, Cpu, PenTool, CheckCircle2 } from 'lucide-react';

const SKILL_TRACKS = [
  {
    name: 'AI Fundamentals',
    icon: Brain,
    color: 'from-purple-500 to-violet-600',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-900/20',
    skills: [
      { name: 'What is AI', mastered: true, xp: 50 },
      { name: 'Machine Learning Basics', mastered: true, xp: 100 },
      { name: 'Neural Networks', mastered: false, xp: 150, progress: 60 },
      { name: 'Deep Learning', mastered: false, xp: 200, progress: 0 },
    ]
  },
  {
    name: 'Prompt Engineering',
    icon: Sparkles,
    color: 'from-cyan-500 to-blue-600',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-900/20',
    skills: [
      { name: 'Basic Prompting', mastered: true, xp: 50 },
      { name: 'Chain of Thought', mastered: true, xp: 100 },
      { name: 'Few-Shot Learning', mastered: false, xp: 150, progress: 30 },
      { name: 'Prompt Optimization', mastered: false, xp: 200, progress: 0 },
    ]
  },
  {
    name: 'Data Analysis',
    icon: BarChart3,
    color: 'from-green-500 to-emerald-600',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/30',
    bgColor: 'bg-green-900/20',
    skills: [
      { name: 'Data Cleaning', mastered: true, xp: 75 },
      { name: 'Visualization', mastered: false, xp: 125, progress: 45 },
      { name: 'Statistical Analysis', mastered: false, xp: 175, progress: 10 },
      { name: 'Predictive Models', mastered: false, xp: 225, progress: 0 },
    ]
  },
  {
    name: 'AI Development',
    icon: Code,
    color: 'from-orange-500 to-red-600',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    bgColor: 'bg-orange-900/20',
    skills: [
      { name: 'Python for AI', mastered: false, xp: 100, progress: 25 },
      { name: 'API Integration', mastered: false, xp: 150, progress: 0 },
      { name: 'Fine-tuning Models', mastered: false, xp: 250, progress: 0 },
      { name: 'MLOps', mastered: false, xp: 300, progress: 0 },
    ]
  },
];

export default function SkillAcquisitionTracker() {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {SKILL_TRACKS.map((track) => {
          const mastered = track.skills.filter(s => s.mastered).length;
          const total = track.skills.length;
          const trackPct = Math.round((mastered / total) * 100);
          const Icon = track.icon;

          return (
            <Card key={track.name} className={`${track.bgColor} border ${track.borderColor}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${track.textColor}`} />
                    <CardTitle className="text-white text-sm">{track.name}</CardTitle>
                  </div>
                  <Badge className={`${track.bgColor} ${track.textColor} border ${track.borderColor} text-xs`}>
                    {mastered}/{total} skills
                  </Badge>
                </div>
                <div className="mt-2">
                  <Progress value={trackPct} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{trackPct}% mastered</p>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {track.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      skill.mastered
                        ? 'bg-white/5'
                        : 'bg-gray-900/30 opacity-80'
                    }`}
                  >
                    {skill.mastered ? (
                      <CheckCircle2 className={`w-4 h-4 ${track.textColor} flex-shrink-0`} />
                    ) : (
                      <div className={`w-4 h-4 rounded-full border-2 ${track.borderColor} flex-shrink-0 ${skill.progress > 0 ? 'bg-current opacity-30' : ''}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${skill.mastered ? 'text-white' : 'text-gray-400'}`}>
                          {skill.name}
                        </span>
                        <span className={`text-xs ${track.textColor} font-semibold flex-shrink-0`}>
                          +{skill.xp} XP
                        </span>
                      </div>
                      {!skill.mastered && skill.progress > 0 && (
                        <Progress value={skill.progress} className="h-1 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}