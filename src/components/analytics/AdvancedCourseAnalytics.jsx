import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingDown, AlertTriangle, Users, Activity, Loader2, FileText } from 'lucide-react';

export default function AdvancedCourseAnalytics({ courseId }) {
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);

  const { data: analytics } = useQuery({
    queryKey: ['courseAnalytics', courseId],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('analyzeCoursePerformance', {
        course_id: courseId
      });
      return data;
    },
    enabled: !!courseId
  });

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { data } = await base44.functions.invoke('generateInstructorReport', {
        course_id: courseId
      });
      setReport(data);
    } finally {
      setGenerating(false);
    }
  };

  if (!analytics) {
    return (
      <Card className="card-glow">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
          <p className="text-gray-400">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
              <div className="text-2xl font-bold text-white">{analytics.total_students}</div>
              <div className="text-xs text-gray-400">Total Students</div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-white">{analytics.avg_engagement}%</div>
              <div className="text-xs text-gray-400">Avg Engagement</div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingDown className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold text-white">{analytics.completion_rate}%</div>
              <div className="text-xs text-gray-400">Completion Rate</div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <div className="text-2xl font-bold text-white">{analytics.at_risk_count}</div>
              <div className="text-xs text-gray-400">At-Risk Students</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Patterns */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white">Student Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.engagement_timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a0a2e', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="engagement" stroke="#06b6d4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Topic Performance */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white">Topic Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topic_performance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="topic" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a0a2e', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="completion_rate" fill="#06b6d4" />
              <Bar dataKey="confusion_score" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* At-Risk Students */}
      {analytics.at_risk_students?.length > 0 && (
        <Card className="card-glow border-red-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              At-Risk Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.at_risk_students.map((student, idx) => (
                <div key={idx} className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white text-sm">{student.name}</div>
                      <div className="text-xs text-gray-400">
                        Last active: {student.days_since_last_activity} days ago
                      </div>
                    </div>
                    <Badge className="bg-red-500/20 text-red-300">
                      {student.risk_level}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{student.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Report */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white">AI-Generated Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={generateReport} disabled={generating} className="w-full btn-primary">
            {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
            Generate Comprehensive Report
          </Button>

          {report && (
            <div className="bg-[#1a0a2e] border border-gray-700 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Executive Summary</h4>
                <p className="text-sm text-gray-300">{report.summary}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Key Insights</h4>
                <ul className="space-y-1">
                  {report.insights?.map((insight, idx) => (
                    <li key={idx} className="text-sm text-gray-300">• {insight}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {report.recommendations?.map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-300">• {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}