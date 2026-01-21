import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AITutorChat from '@/components/learning/AITutorChat';
import { 
  ArrowLeft, 
  Share2, 
  MoreVertical, 
  Play, 
  SkipBack, 
  SkipForward,
  Volume2,
  Maximize,
  Lightbulb,
  Search,
  Clock
} from 'lucide-react';

export default function EnhancedCourseViewer() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('id');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1200); // 20 mins in seconds
  const [playing, setPlaying] = useState(false);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId
  });

  const progress = (currentTime / duration) * 100;

  return (
    <div className="min-h-screen bg-[#0f0618] text-white">
      {/* Top Navigation */}
      <div className="sticky top-0 z-50 bg-[#0f0618]/80 backdrop-blur-md border-b border-purple-500/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="font-bold text-sm">{course?.title || 'Neural Networks 101'}</h2>
              <p className="text-xs text-purple-400">INTInc AI • Module 4</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="relative w-full aspect-video bg-black group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
          <div className="text-purple-400/40 text-8xl">
            <Play className="w-24 h-24" />
          </div>
        </div>

        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-6">
          <div className="flex justify-end">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              Live AI Analysis
            </Badge>
          </div>

          <div className="flex items-center justify-center gap-8">
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
              <SkipBack className="w-8 h-8" />
            </Button>
            <Button 
              size="icon" 
              className="w-16 h-16 rounded-full bg-purple-500 hover:bg-purple-600 shadow-[0_0_30px_rgba(139,92,246,0.5)]"
              onClick={() => setPlaying(!playing)}
            >
              <Play className="w-8 h-8" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
              <SkipForward className="w-8 h-8" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white font-medium">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
              </span>
              <div className="relative flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" 
                  style={{ width: `${progress}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-purple-500 shadow-lg"
                  style={{ left: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-white font-medium">
                {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <Volume2 className="w-5 h-5 text-white cursor-pointer" />
                <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded cursor-pointer">1.25x</span>
              </div>
              <Maximize className="w-5 h-5 text-white cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Course Tabs */}
      <div className="sticky top-16 z-40 bg-[#0f0618]/80 backdrop-blur-md border-b border-purple-500/10">
        <Tabs defaultValue="assistant" className="w-full">
          <TabsList className="w-full bg-transparent border-none h-auto p-0">
            <TabsTrigger 
              value="syllabus" 
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-purple-400 border-b-2 border-transparent rounded-none py-3"
            >
              Syllabus
            </TabsTrigger>
            <TabsTrigger 
              value="assistant" 
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-purple-400 border-b-2 border-transparent rounded-none py-3"
            >
              AI Assistant
            </TabsTrigger>
            <TabsTrigger 
              value="concepts" 
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-purple-400 border-b-2 border-transparent rounded-none py-3"
            >
              Concepts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assistant" className="p-4 space-y-6 pb-32">
            {/* Search Transcript */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search in transcript..."
                className="w-full h-11 bg-purple-900/20 border border-purple-500/20 rounded-xl pl-12 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:outline-none"
              />
            </div>

            {/* Transcript with AI Highlights */}
            <div className="space-y-4">
              <div className="flex gap-3 text-sm">
                <span className="text-gray-500 text-xs w-12">11:50</span>
                <p className="flex-1 text-gray-400">
                  The weights are adjusted using backpropagation, which calculates the gradient of the loss function.
                </p>
              </div>

              <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-3 text-sm">
                    <span className="text-purple-400 text-xs font-bold w-12">12:45</span>
                    <div className="flex-1">
                      <p className="text-white font-medium mb-1">
                        Stochastic Gradient Descent (SGD) is an iterative method for optimizing an objective function with suitable smoothness properties.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="h-7 text-xs border-purple-500/30 hover:bg-purple-500/10">
                          <Lightbulb className="w-3 h-3 mr-1" />
                          Explain This Term
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-purple-500/30 hover:bg-purple-500/10">
                          Show Graph
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 text-sm">
                <span className="text-gray-500 text-xs w-12">13:10</span>
                <p className="flex-1 text-gray-400">
                  In the next section, we'll see how the learning rate influences the speed of convergence.
                </p>
              </div>
            </div>

            {/* Key Concepts Badge */}
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Key Concepts Mentioned</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Backpropagation</Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">SGD</Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Loss Function</Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Learning Rate</Badge>
              </div>
            </div>

            {/* AI Tutor Chat */}
            <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Ask Sparky AI</h4>
                  <p className="text-xs text-gray-400">Your personal learning assistant</p>
                </div>
              </div>
              <input
                type="text"
                placeholder="Ask about this lesson..."
                className="w-full h-10 bg-purple-900/30 border border-purple-500/30 rounded-lg px-4 text-sm text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:outline-none"
              />
            </div>

            {/* Module Progress */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/20 border border-purple-500/20 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Module Progress</span>
                <span className="text-sm font-bold text-white">65% Complete</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 w-[65%]" />
              </div>
              <p className="text-xs text-gray-400">Next: Advanced Optimizers</p>
            </div>
          </TabsContent>

          <TabsContent value="concepts" className="p-4 space-y-4 pb-32">
            <div className="space-y-3">
              {[
                { term: 'Backpropagation', time: '08:30', status: 'explained' },
                { term: 'Gradient Descent', time: '11:20', status: 'explained' },
                { term: 'Learning Rate', time: '14:45', status: 'current' },
                { term: 'Momentum', time: '18:10', status: 'upcoming' }
              ].map((concept) => (
                <div key={concept.term} className={`rounded-lg p-4 border ${
                  concept.status === 'current' 
                    ? 'bg-purple-900/30 border-purple-500/40' 
                    : 'bg-purple-900/10 border-purple-500/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{concept.term}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-gray-400">{concept.time}</span>
                      </div>
                    </div>
                    {concept.status === 'current' && (
                      <Badge className="bg-purple-500/20 text-purple-300">Learning Now</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="syllabus" className="p-4 pb-32">
            <div className="space-y-2">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className={`p-3 rounded-lg border ${
                  i === 3 
                    ? 'bg-purple-900/30 border-purple-500/40' 
                    : 'bg-purple-900/10 border-purple-500/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lesson {i + 1}: Topic {i + 1}</span>
                    {i < 3 && <span className="text-xs text-emerald-400">✓ Complete</span>}
                    {i === 3 && <span className="text-xs text-purple-400">● In Progress</span>}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}