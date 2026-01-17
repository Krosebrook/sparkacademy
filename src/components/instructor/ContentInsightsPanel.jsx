/**
 * Content Insights Panel
 * AI-powered content analysis for instructors
 * Shows engagement metrics, drop-off points, and improvement recommendations
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, AlertTriangle, TrendingUp, Lightbulb, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContentInsightsPanel({ courseId }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    try {
      const result = await base44.functions.invoke('analyzeContentEngagement', { course_id: courseId });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Failed to analyze content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!analysis) {
    return (
      <Card className="card-glow">
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4 opacity-30" />
          <p className="text-gray-400 mb-4">Analyze your course content for engagement insights</p>
          <Button onClick={analyzeContent} disabled={isAnalyzing} className="btn-primary">
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analyze Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { lesson_metrics, analysis: aiAnalysis, engagement_summary } = analysis;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="card-glow">
          <CardContent className="p-4">
            <p className="text-gray-400 text-xs mb-1">Health Score</p>
            <p className="text-2xl font-bold text-white">{aiAnalysis.overall_health_score}%</p>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardContent className="p-4">
            <p className="text-gray-400 text-xs mb-1">Completion Rate</p>
            <p className="text-2xl font-bold text-green-400">{engagement_summary.completion_rate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardContent className="p-4">
            <p className="text-gray-400 text-xs mb-1">Avg Engagement</p>
            <p className="text-2xl font-bold text-blue-400">{engagement_summary.avg_engagement_score.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardContent className="p-4">
            <p className="text-gray-400 text-xs mb-1">Low Engagement</p>
            <p className="text-2xl font-bold text-orange-400">{engagement_summary.low_engagement_count}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="lessons" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#1a0a2e]/50">
          <TabsTrigger value="lessons">Lesson Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
        </TabsList>

        {/* Lesson Metrics */}
        <TabsContent value="lessons" className="space-y-3">
          {lesson_metrics?.map((metric, idx) => {
            const statusColor = metric.engagement_score > 70 ? 'green' : metric.engagement_score > 40 ? 'yellow' : 'red';
            return (
              <Card key={idx} className={`card-glow ${statusColor === 'red' ? 'border-red-500/30' : statusColor === 'yellow' ? 'border-yellow-500/30' : 'border-green-500/30'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{metric.lesson_title}</h4>
                      <p className="text-xs text-gray-400">Lesson {metric.lesson_order + 1}</p>
                    </div>
                    <Badge className={`${
                      statusColor === 'green' ? 'bg-green-500/20 text-green-300' :
                      statusColor === 'yellow' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {metric.engagement_score.toFixed(0)}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Completion Rate</p>
                      <div className="flex items-center gap-2">
                        <Progress value={metric.completion_rate} className="h-2 flex-1" />
                        <span className="text-xs font-semibold text-white">{metric.completion_rate.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Drop-off Rate</p>
                      <div className="flex items-center gap-2">
                        <Progress value={metric.drop_off_rate} className="h-2 flex-1" />
                        <span className="text-xs font-semibold text-white">{metric.drop_off_rate.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{metric.views} views</span>
                    <span>{metric.discussion_count} discussions</span>
                    <span>{metric.avg_time_spent_minutes} min</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations" className="space-y-3">
          {aiAnalysis.improvements_needed?.map((improvement, idx) => (
            <Card key={idx} className={`card-glow ${
              improvement.priority === 'high' ? 'border-red-500/30 bg-red-900/10' :
              improvement.priority === 'medium' ? 'border-yellow-500/30 bg-yellow-900/10' :
              'border-blue-500/30 bg-blue-900/10'
            }`}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {improvement.priority === 'high' ? (
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-white">{improvement.lesson}</h4>
                      <Badge className={`${
                        improvement.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                        improvement.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {improvement.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{improvement.issue}</p>
                    <p className="text-sm text-cyan-300 mb-2">💡 {improvement.recommendation}</p>
                    <p className="text-xs text-gray-400">📈 Expected impact: {improvement.expected_impact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Action Items */}
        <TabsContent value="actions" className="space-y-3">
          <Card className="card-glow bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
            <CardContent className="p-4">
              <p className="text-sm text-gray-300 mb-4">{aiAnalysis.summary}</p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-cyan-300 mb-2">Best Practices to Replicate:</h4>
                {aiAnalysis.best_practices?.map((practice, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{practice}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="font-semibold text-white">Priority Tasks:</h3>
            {aiAnalysis.action_items?.map((action, idx) => (
              <Card key={idx} className="card-glow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      action.priority === 'high' ? 'bg-red-400' :
                      action.priority === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">{action.action}</p>
                      <p className="text-xs text-gray-400 mt-1">Estimated time: {action.estimated_time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Button onClick={analyzeContent} variant="outline" className="w-full">
        <BarChart3 className="w-4 h-4 mr-2" />
        Refresh Analysis
      </Button>
    </div>
  );
}