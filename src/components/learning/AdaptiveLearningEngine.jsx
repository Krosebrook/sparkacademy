import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Target, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AdaptiveLearningEngine({ userEmail, performanceData }) {
  const [adaptivePath, setAdaptivePath] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const generatePath = async () => {
    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke('generateAdaptivePath', {
        userId: userEmail,
        performanceData: performanceData || {},
        learningPreferences: {}
      });

      setAdaptivePath(response.data);
      toast.success('Your personalized learning path is ready!');
    } catch (error) {
      toast.error('Failed to generate adaptive path');
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    if (userEmail) {
      generatePath();
    }
  }, [userEmail]);

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-500',
      intermediate: 'bg-yellow-500',
      advanced: 'bg-orange-500',
      expert: 'bg-red-500'
    };
    return colors[difficulty?.toLowerCase()] || 'bg-blue-500';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority?.toLowerCase()] || 'bg-gray-500';
  };

  if (isGenerating) {
    return (
      <Card className="border-purple-500/30 bg-slate-900">
        <CardContent className="p-8 text-center">
          <Brain className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Generating Your Adaptive Path...</h3>
          <p className="text-slate-400">AI is analyzing your skills and preferences</p>
        </CardContent>
      </Card>
    );
  }

  if (!adaptivePath) {
    return (
      <Card className="border-purple-500/30 bg-slate-900">
        <CardContent className="p-8 text-center">
          <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Start Your Adaptive Learning Journey</h3>
          <p className="text-slate-400 mb-6">Get a personalized path based on your skills and goals</p>
          <Button onClick={generatePath} className="bg-purple-600 hover:bg-purple-700">
            <Zap className="w-4 h-4 mr-2" />
            Generate My Path
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-purple-500/30 bg-slate-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-400" />
              <CardTitle className="text-white">Your Adaptive Learning Path</CardTitle>
            </div>
            <Button onClick={generatePath} variant="outline" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Refresh Path
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Milestones */}
          {adaptivePath.milestones && (
            <div className="bg-slate-800 rounded-lg p-4 border border-purple-500/20">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Learning Milestones
              </h4>
              <div className="space-y-2">
                {adaptivePath.milestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <Badge variant="outline" className="text-purple-400 border-purple-400">
                      Week {milestone.week}
                    </Badge>
                    <span className="text-slate-300">{milestone.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adaptive Path */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Recommended Learning Sequence</h4>
            {adaptivePath.adaptivePath?.map((course, idx) => (
              <Card 
                key={idx} 
                className="bg-slate-800 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer"
                onClick={() => setSelectedCourse(course)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-600 text-white">#{idx + 1}</Badge>
                        <h5 className="font-semibold text-white">{course.course_title}</h5>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{course.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <Badge className={getDifficultyColor(course.difficulty)}>
                      {course.difficulty}
                    </Badge>
                    <Badge className={getPriorityColor(course.priority)}>
                      {course.priority} priority
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      {course.estimated_hours}h
                    </div>
                  </div>

                  {course.addresses_gaps && course.addresses_gaps.length > 0 && (
                    <div className="bg-slate-900 rounded p-3 border border-green-500/20">
                      <p className="text-xs text-green-400 font-semibold mb-2">Addresses Skill Gaps:</p>
                      <div className="flex flex-wrap gap-2">
                        {course.addresses_gaps.map((gap, gIdx) => (
                          <Badge key={gIdx} variant="outline" className="text-green-400 border-green-400 text-xs">
                            {gap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {course.outcomes && course.outcomes.length > 0 && selectedCourse === course && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <p className="text-sm font-semibold text-white mb-2">Learning Outcomes:</p>
                      <ul className="space-y-1">
                        {course.outcomes.map((outcome, oIdx) => (
                          <li key={oIdx} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}