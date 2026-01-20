import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { Loader2, Sparkles, Target, TrendingUp, Users, BookOpen, Award } from 'lucide-react';

export default function AICoachingPanel({ courseId }) {
  const [loading, setLoading] = useState(false);
  const [coaching, setCoaching] = useState(null);

  const generateCoaching = async () => {
    if (!courseId) {
      alert('Please select a course first');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateInstructorCoaching', {
        course_id: courseId
      });
      
      if (data) {
        setCoaching(data);
      }
    } catch (error) {
      console.error('Coaching generation error:', error);
      alert('Failed to generate coaching insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-purple-400" />
          AI Instructor Coaching
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!coaching ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
            <p className="text-gray-300 mb-4">
              Get personalized coaching based on your course performance data
            </p>
            <Button onClick={generateCoaching} disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate AI Coaching
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Executive Summary</h4>
              <p className="text-sm text-gray-300">{coaching.executive_summary}</p>
            </div>

            <Tabs defaultValue="priorities" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#1a0a2e] border border-gray-700">
                <TabsTrigger value="priorities">Top Priorities</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
              </TabsList>

              <TabsContent value="priorities" className="space-y-3 mt-4">
                {coaching.top_priorities?.length > 0 ? coaching.top_priorities.map((priority, idx) => (
                  <div key={idx} className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-white text-sm">{priority.priority}</h5>
                      <div className="flex gap-2">
                        <Badge className="bg-green-500/20 text-green-300 text-xs">Impact: {priority.impact}</Badge>
                        <Badge className="bg-blue-500/20 text-blue-300 text-xs">Effort: {priority.effort}</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">Timeline: {priority.timeline}</div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-white">Action Steps:</div>
                      {priority.action_steps?.map((step, i) => (
                        <div key={i} className="text-xs text-gray-300">• {step}</div>
                      ))}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>No priority actions at this time</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="content" className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Content Improvements
                  </h4>
                  <div className="space-y-2">
                    {coaching.content_improvements?.length > 0 ? coaching.content_improvements.map((improvement, idx) => (
                      <div key={idx} className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                        <div className="font-medium text-white text-sm mb-1">{improvement.lesson_topic}</div>
                        <div className="text-xs text-gray-400 mb-1">Issue: {improvement.issue}</div>
                        <div className="text-xs text-blue-300 mb-1">Evidence: {improvement.data_evidence}</div>
                        <div className="text-xs text-green-300">→ {improvement.recommendation}</div>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        <p>No content improvements needed at this time</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-white mb-2 text-sm">Engagement Strategies</h4>
                  <ul className="space-y-1">
                    {coaching.engagement_strategies?.map((strategy, idx) => (
                      <li key={idx} className="text-xs text-gray-300">• {strategy}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="students" className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    At-Risk Interventions
                  </h4>
                  <div className="space-y-2">
                    {coaching.at_risk_interventions?.map((intervention, idx) => (
                      <div key={idx} className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                        <div className="font-medium text-white text-sm mb-1">{intervention.strategy}</div>
                        <div className="text-xs text-gray-400 mb-2">When: {intervention.when_to_use}</div>
                        <div className="bg-gray-800/50 rounded p-2 text-xs text-gray-300">
                          Template: {intervention.template}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-white mb-2 text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Success Metrics
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-medium text-white mb-1">Weekly KPIs:</div>
                      {coaching.success_metrics?.weekly_kpis?.map((kpi, i) => (
                        <div key={i} className="text-xs text-gray-300">• {kpi}</div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white mb-1">30-Day Goals:</div>
                      {coaching.success_metrics?.thirty_day_goals?.map((goal, i) => (
                        <div key={i} className="text-xs text-gray-300">• {goal}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <h5 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Strengths
                </h5>
                <ul className="space-y-1">
                  {coaching.teaching_effectiveness?.strengths?.slice(0, 3).map((strength, i) => (
                    <li key={i} className="text-xs text-gray-300">✓ {strength}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                <h5 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Growth Areas
                </h5>
                <ul className="space-y-1">
                  {coaching.teaching_effectiveness?.areas_for_growth?.slice(0, 3).map((area, i) => (
                    <li key={i} className="text-xs text-gray-300">→ {area}</li>
                  ))}
                </ul>
              </div>
            </div>

            <Button onClick={generateCoaching} variant="outline" className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh Coaching
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}