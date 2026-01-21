import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Users, AlertCircle, Lightbulb, Award, Activity } from 'lucide-react';

export default function AIContentAnalyticsDashboard() {
  const [selectedCourse, setSelectedCourse] = useState('all');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['content-analytics', selectedCourse],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('analyzeContentEffectiveness', {
        course_id: selectedCourse === 'all' ? undefined : selectedCourse
      });
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8" />
            <h1 className="text-3xl font-bold">AI Content Analytics Dashboard</h1>
          </div>
          <p className="text-purple-100">
            Track student engagement, identify struggle areas, and optimize AI-generated content
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <Badge className="bg-blue-100 text-blue-700">{analytics?.overview?.total_students || 0}</Badge>
              </div>
              <div className="text-2xl font-bold">{analytics?.overview?.total_students || 0}</div>
              <div className="text-xs text-gray-500">Total Students</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-purple-500" />
                <Badge className="bg-purple-100 text-purple-700">{analytics?.overview?.content_types_used || 0}</Badge>
              </div>
              <div className="text-2xl font-bold">{analytics?.overview?.content_types_used || 0}</div>
              <div className="text-xs text-gray-500">AI Tools Used</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <Badge className="bg-green-100 text-green-700">
                  {Math.round(analytics?.overview?.avg_engagement_rate || 0)}%
                </Badge>
              </div>
              <div className="text-2xl font-bold">{Math.round(analytics?.overview?.avg_engagement_rate || 0)}%</div>
              <div className="text-xs text-gray-500">Avg Engagement</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-orange-500" />
                <Badge className="bg-orange-100 text-orange-700">{analytics?.overview?.total_revisions || 0}</Badge>
              </div>
              <div className="text-2xl font-bold">{analytics?.overview?.total_revisions || 0}</div>
              <div className="text-xs text-gray-500">Content Revisions</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
            <TabsTrigger value="performance">Content Performance</TabsTrigger>
            <TabsTrigger value="struggles">Student Struggles</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Content Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics?.content_type_breakdown || {}).map(([type, metrics]) => (
                    <div key={type} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold capitalize">{type.replace(/_/g, ' ')}</h4>
                        <Badge>{metrics.total_students} students</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-blue-50 rounded p-2">
                          <div className="text-xs text-gray-600">Completion</div>
                          <div className="text-lg font-bold text-blue-600">
                            {Math.round(metrics.avg_completion)}%
                          </div>
                        </div>
                        <div className="bg-green-50 rounded p-2">
                          <div className="text-xs text-gray-600">Avg Time</div>
                          <div className="text-lg font-bold text-green-600">
                            {Math.round(metrics.avg_time_spent)}m
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded p-2">
                          <div className="text-xs text-gray-600">Avg Score</div>
                          <div className="text-lg font-bold text-purple-600">
                            {Math.round(metrics.avg_score)}%
                          </div>
                        </div>
                        <div className="bg-orange-50 rounded p-2">
                          <div className="text-xs text-gray-600">Struggle Rate</div>
                          <div className="text-lg font-bold text-orange-600">
                            {Math.round(metrics.struggle_rate)}%
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${metrics.avg_completion}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="struggles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Students Needing Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.struggling_students?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No struggling students detected
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analytics?.struggling_students?.slice(0, 10).map((student, idx) => (
                      <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">{student.student_email}</span>
                          <Badge className="bg-red-100 text-red-700">{student.content_type}</Badge>
                        </div>
                        <div className="space-y-1">
                          {student.struggles?.map((struggle, i) => (
                            <div key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <AlertCircle className="w-3 h-3 text-red-500 mt-0.5" />
                              <span><strong className="capitalize">{struggle.severity}:</strong> {struggle.details}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  AI-Powered Improvement Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.recommendations?.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 mx-auto text-green-500 mb-3" />
                    <p className="text-gray-600">Great job! No critical issues detected.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analytics?.recommendations?.map((rec, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg p-4 border ${
                          rec.priority === 'high'
                            ? 'bg-red-50 border-red-200'
                            : rec.priority === 'medium'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Badge
                            className={
                              rec.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : rec.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-blue-100 text-blue-700'
                            }
                          >
                            {rec.priority}
                          </Badge>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800 mb-1">
                              {rec.content_type} - {rec.issue}
                            </div>
                            <p className="text-sm text-gray-600">{rec.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}