import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Target, TrendingUp, Star, Clock, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function SmartRecommendations({ userEmail }) {
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ['smart-recommendations', userEmail],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateSmartRecommendations', {
        userId: userEmail
      });
      return response.data;
    },
    enabled: !!userEmail
  });

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-500',
      intermediate: 'bg-yellow-500',
      advanced: 'bg-orange-500',
      expert: 'bg-red-500'
    };
    return colors[difficulty?.toLowerCase()] || 'bg-blue-500';
  };

  if (isLoading) {
    return (
      <Card className="border-purple-500/30 bg-slate-900">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-300">Generating personalized recommendations...</p>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) {
    return (
      <Card className="border-purple-500/30 bg-slate-900">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Get AI-Powered Recommendations</h3>
          <p className="text-slate-400 mb-6">Discover courses tailored to your goals and skill gaps</p>
          <Button onClick={() => refetch()} className="bg-purple-600 hover:bg-purple-700">
            <Target className="w-4 h-4 mr-2" />
            Generate Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Priority Skills */}
      {recommendations.prioritySkills && recommendations.prioritySkills.length > 0 && (
        <Card className="border-purple-500/30 bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="w-5 h-5 text-purple-400" />
              Priority Skills to Develop
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recommendations.prioritySkills.map((skill, idx) => (
                <Badge key={idx} className="bg-purple-600 text-white">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Path Summary */}
      {recommendations.pathSummary && (
        <Card className="border-blue-500/30 bg-blue-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
              <p className="text-sm text-slate-300">{recommendations.pathSummary}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Courses */}
      <Card className="border-purple-500/30 bg-slate-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Personalized for You
            </CardTitle>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.recommendations?.map((course, idx) => (
            <Card
              key={idx}
              className="bg-slate-800 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer"
              onClick={() => setSelectedCourse(selectedCourse === course ? null : course)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-purple-600">#{idx + 1}</Badge>
                      <h4 className="font-semibold text-white">{course.course_title}</h4>
                    </div>
                    <p className="text-sm text-slate-400">{course.reason}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`flex items-center gap-1 ${getMatchColor(course.match_score)}`}>
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold">{course.match_score}%</span>
                    </div>
                    <span className="text-xs text-slate-500">Match</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    {course.estimated_completion}
                  </div>
                  <Badge variant="outline" className="text-purple-400 border-purple-400">
                    {course.placement}
                  </Badge>
                </div>

                {/* Match Score Visual */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Relevance Score</span>
                    <span>{course.match_score}%</span>
                  </div>
                  <Progress value={course.match_score} className="h-2" />
                </div>

                {/* Addresses Gaps */}
                {course.addresses_gaps && course.addresses_gaps.length > 0 && (
                  <div className="bg-slate-900 rounded p-3 border border-green-500/20">
                    <p className="text-xs text-green-400 font-semibold mb-2">Fills These Skill Gaps:</p>
                    <div className="flex flex-wrap gap-2">
                      {course.addresses_gaps.map((gap, gIdx) => (
                        <Badge key={gIdx} variant="outline" className="text-green-400 border-green-400 text-xs">
                          {gap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                {selectedCourse === course && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Start Learning
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}