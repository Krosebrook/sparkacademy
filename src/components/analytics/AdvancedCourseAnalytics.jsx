import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertCircle, Users, Clock, Award, MessageSquare, Lightbulb, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AdvancedCourseAnalytics({ courseId }) {
  const [selectedInsight, setSelectedInsight] = useState(null);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['course-analytics', courseId],
    queryFn: async () => {
      const metrics = await base44.entities.CourseEngagementMetrics.filter({ course_id: courseId });
      
      // Calculate aggregates
      const totalStudents = metrics.length;
      const avgProgress = metrics.reduce((sum, m) => sum + (m.progress_percentage || 0), 0) / totalStudents || 0;
      const avgVideoTime = metrics.reduce((sum, m) => sum + (m.video_watch_time?.total_minutes || 0), 0) / totalStudents || 0;
      
      const quizScores = metrics.flatMap(m => m.quiz_performance || []).map(q => q.score);
      const avgQuizScore = quizScores.length > 0 ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length : 0;
      
      const totalForumPosts = metrics.reduce((sum, m) => sum + (m.forum_participation?.posts_created || 0), 0);
      
      return {
        totalStudents,
        avgProgress,
        avgVideoTime,
        avgQuizScore,
        totalForumPosts,
        metrics
      };
    },
    enabled: !!courseId
  });

  const { data: struggles, isLoading: strugglesLoading } = useQuery({
    queryKey: ['student-struggles', courseId],
    queryFn: async () => {
      const response = await base44.functions.invoke('analyzeStudentStruggles', { courseId });
      return response.data;
    },
    enabled: !!courseId
  });

  const generateImprovements = async () => {
    try {
      const response = await base44.functions.invoke('generateCourseImprovements', {
        courseId,
        analyticsData: {
          completionRate: analytics.avgProgress,
          avgQuizScore: analytics.avgQuizScore,
          videoWatchTime: analytics.avgVideoTime,
          forumPosts: analytics.totalForumPosts,
          strugglingStudents: struggles?.struggleAnalysis?.lowQuizScores?.length || 0,
          dropoffPoints: []
        }
      });
      
      setSelectedInsight(response.data.improvements);
      toast.success('AI insights generated!');
    } catch (error) {
      toast.error('Failed to generate insights');
    }
  };

  if (analyticsLoading) {
    return (
      <Card className="border-purple-500/30 bg-slate-900">
        <CardContent className="p-8 text-center">
          <TrendingUp className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-300">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Students</p>
                <p className="text-2xl font-bold text-white">{analytics.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Progress</p>
                <p className="text-2xl font-bold text-white">{analytics.avgProgress.toFixed(1)}%</p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Quiz Score</p>
                <p className="text-2xl font-bold text-white">{analytics.avgQuizScore.toFixed(1)}%</p>
              </div>
              <Award className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Watch Time</p>
                <p className="text-2xl font-bold text-white">{analytics.avgVideoTime.toFixed(0)}m</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Card className="bg-slate-900 border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Course Analytics</CardTitle>
            <Button onClick={generateImprovements} className="bg-purple-600 hover:bg-purple-700">
              <Lightbulb className="w-4 h-4 mr-2" />
              Generate AI Insights
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="engagement">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800">
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="struggles">Struggles</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="engagement" className="space-y-4 mt-4">
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-4">Video Engagement</h4>
                <LineChart width={600} height={300} data={analytics.metrics?.map((m, idx) => ({
                  name: `Student ${idx + 1}`,
                  watchTime: m.video_watch_time?.total_minutes || 0
                })) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                  <Line type="monotone" dataKey="watchTime" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </div>

              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-4">Forum Participation</h4>
                <p className="text-slate-300 mb-2">Total Posts: {analytics.totalForumPosts}</p>
                <Progress value={(analytics.totalForumPosts / analytics.totalStudents) * 10} className="h-2" />
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4 mt-4">
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-4">Quiz Score Distribution</h4>
                <BarChart width={600} height={300} data={[
                  { range: '0-40%', count: analytics.metrics?.filter(m => {
                    const avg = m.quiz_performance?.reduce((sum, q) => sum + q.score, 0) / (m.quiz_performance?.length || 1);
                    return avg < 40;
                  }).length || 0 },
                  { range: '40-60%', count: analytics.metrics?.filter(m => {
                    const avg = m.quiz_performance?.reduce((sum, q) => sum + q.score, 0) / (m.quiz_performance?.length || 1);
                    return avg >= 40 && avg < 60;
                  }).length || 0 },
                  { range: '60-80%', count: analytics.metrics?.filter(m => {
                    const avg = m.quiz_performance?.reduce((sum, q) => sum + q.score, 0) / (m.quiz_performance?.length || 1);
                    return avg >= 60 && avg < 80;
                  }).length || 0 },
                  { range: '80-100%', count: analytics.metrics?.filter(m => {
                    const avg = m.quiz_performance?.reduce((sum, q) => sum + q.score, 0) / (m.quiz_performance?.length || 1);
                    return avg >= 80;
                  }).length || 0 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="range" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </div>
            </TabsContent>

            <TabsContent value="struggles" className="space-y-4 mt-4">
              {struggles && (
                <>
                  <Card className="bg-slate-800 border-red-500/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        Problem Areas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {struggles.struggleAnalysis?.problemLessons?.slice(0, 3).map((lesson, idx) => (
                        <div key={idx} className="bg-slate-900 rounded p-3 border border-red-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-white">{lesson.lesson_id}</span>
                            <Badge className="bg-red-600">{lesson.struggle_count} students</Badge>
                          </div>
                          <div className="space-y-1">
                            {lesson.common_issues?.map((issue, iIdx) => (
                              <p key={iIdx} className="text-sm text-slate-400">• {issue}</p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-white">Low Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 mb-2">
                        {struggles.struggleAnalysis?.lowEngagement?.length || 0} students haven't been active in 7+ days
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4 mt-4">
              {selectedInsight ? (
                <>
                  <Card className="bg-slate-800 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-white">Content Improvements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedInsight.content_improvements?.map((improvement, idx) => (
                        <div key={idx} className="bg-slate-900 rounded p-3 border border-purple-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-600">{improvement.priority}</Badge>
                            <span className="font-semibold text-white">{improvement.lesson_id}</span>
                          </div>
                          <p className="text-sm text-slate-400 mb-1">Issue: {improvement.issue}</p>
                          <p className="text-sm text-green-400">→ {improvement.suggestion}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="text-white">Engagement Strategies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedInsight.engagement_strategies?.map((strategy, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5" />
                            {strategy}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-slate-400">Click "Generate AI Insights" to analyze your course</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}