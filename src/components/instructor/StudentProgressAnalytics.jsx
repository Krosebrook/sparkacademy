/**
 * Student Progress Analytics
 * Detailed analytics for each student with at-risk identification
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, Users, Loader2 } from 'lucide-react';

export default function StudentProgressAnalytics({ courseId }) {
  const [atRiskData, setAtRiskData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeAtRisk = async () => {
    setIsAnalyzing(true);
    try {
      const result = await base44.functions.invoke('analyzeAtRiskStudents', { 
        course_id: courseId 
      });
      setAtRiskData(result.data);
    } catch (error) {
      console.error('Error analyzing at-risk students:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const { data: enrollments } = useQuery({
    queryKey: ['enrollments', courseId],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId })
  });

  return (
    <div className="space-y-6">
      {/* Risk Distribution Overview */}
      {atRiskData && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="card-glow">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs mb-2">Total Students</p>
              <p className="text-3xl font-bold text-white">{atRiskData.total_students}</p>
            </CardContent>
          </Card>
          <Card className="card-glow bg-red-900/20 border-red-500/30">
            <CardContent className="p-4">
              <p className="text-red-400 text-xs mb-2">Critical Risk</p>
              <p className="text-3xl font-bold text-red-300">{atRiskData.risk_distribution.critical}</p>
            </CardContent>
          </Card>
          <Card className="card-glow bg-yellow-900/20 border-yellow-500/30">
            <CardContent className="p-4">
              <p className="text-yellow-400 text-xs mb-2">High Risk</p>
              <p className="text-3xl font-bold text-yellow-300">{atRiskData.risk_distribution.high}</p>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardContent className="p-4">
              <p className="text-blue-400 text-xs mb-2">At Risk Students</p>
              <p className="text-3xl font-bold text-blue-300">{atRiskData.at_risk_count}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analyze Button */}
      {!atRiskData && (
        <Card className="card-glow">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-blue-400/30 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Analyze student progress and identify at-risk students</p>
            <Button onClick={analyzeAtRisk} disabled={isAnalyzing} className="btn-primary">
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Analyze Students
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* At-Risk Students List */}
      {atRiskData && (
        <div className="space-y-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Students At Risk ({atRiskData.at_risk_count})
          </h3>
          
          {atRiskData.at_risk_students.map((student, idx) => (
            <Card 
              key={idx} 
              className={`card-glow ${
                student.risk_level === 'critical' ? 'border-red-500/30 bg-red-900/10' :
                student.risk_level === 'high' ? 'border-yellow-500/30 bg-yellow-900/10' :
                'border-blue-500/30 bg-blue-900/10'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{student.student_name}</h4>
                    <p className="text-xs text-gray-400">{student.student_email}</p>
                  </div>
                  <Badge className={`${
                    student.risk_level === 'critical' ? 'bg-red-500/20 text-red-300' :
                    student.risk_level === 'high' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {student.risk_score}% Risk
                  </Badge>
                </div>

                {/* Progress Metrics */}
                <div className="space-y-2 mb-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Course Progress</span>
                      <span className="text-white">{student.completion_percentage}%</span>
                    </div>
                    <Progress value={student.completion_percentage} className="h-2" />
                  </div>
                  {student.quiz_average && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Quiz Average</span>
                        <span className="text-white">{student.quiz_average.toFixed(1)}%</span>
                      </div>
                      <Progress value={student.quiz_average} className="h-2" />
                    </div>
                  )}
                </div>

                {/* Risk Factors */}
                <div className="space-y-1">
                  {student.risk_factors.map((factor, i) => (
                    <div key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">⚠</span>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <Button 
                  variant="outline" 
                  className="w-full mt-3 text-xs"
                  onClick={() => {
                    // Send intervention message/email
                    base44.integrations.Core.SendEmail({
                      to: student.student_email,
                      subject: 'Course Support Available',
                      body: `Hi ${student.student_name},\n\nWe noticed you might need some extra support in the course. Our tutors are available to help. Let us know how we can support you!`
                    });
                  }}
                >
                  Send Support Message
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student Performance Distribution */}
      {enrollments && (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Class Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollments.map((e, i) => ({
                name: `Student ${i + 1}`,
                completion: e.completion_percentage,
                score: e.quiz_average || 0
              }))}>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                <XAxis stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip />
                <Line type="monotone" dataKey="completion" stroke="#00d9ff" name="Completion %" />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" name="Quiz Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Button onClick={analyzeAtRisk} variant="outline" className="w-full">
        Refresh Analysis
      </Button>
    </div>
  );
}