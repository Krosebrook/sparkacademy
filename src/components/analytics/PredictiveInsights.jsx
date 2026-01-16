import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Lightbulb, Users, Target, Loader2 } from "lucide-react";

export default function PredictiveInsights({ courseId }) {
  const [insights, setInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.get(courseId)
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId })
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ['user-badges'],
    queryFn: () => base44.entities.UserBadge.list()
  });

  const generateInsights = async () => {
    setIsAnalyzing(true);
    try {
      // Calculate current metrics
      const activeStudents = enrollments.filter(e => e.completion_percentage > 0 && e.completion_percentage < 100);
      const completedStudents = enrollments.filter(e => e.completion_percentage === 100);
      const avgCompletion = enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / enrollments.length;
      const avgTimeSpent = enrollments.reduce((sum, e) => sum + (e.time_spent_hours || 0), 0) / enrollments.length;

      // Identify stuck students
      const stuckStudents = enrollments.filter(e => {
        const lastActivity = new Date(e.updated_date);
        const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
        return e.completion_percentage > 0 && e.completion_percentage < 100 && daysSinceActivity > 7;
      });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this course and provide predictive insights:

Course: ${course.title}
Total Enrollments: ${enrollments.length}
Active Students: ${activeStudents.length}
Completed: ${completedStudents.length}
Average Completion: ${avgCompletion.toFixed(1)}%
Average Time Spent: ${avgTimeSpent.toFixed(1)} hours
Stuck Students (7+ days inactive): ${stuckStudents.length}

Gamification Data:
- Badges earned across platform: ${allBadges.length}
- Course has ${course.lessons?.length || 0} lessons

Provide:
1. Completion rate forecast for next 30/60/90 days
2. At-risk students characteristics and count estimate
3. Specific intervention strategies
4. Gamification impact analysis
5. Recommended course improvements`,
        response_json_schema: {
          type: "object",
          properties: {
            completion_forecast: {
              type: "object",
              properties: {
                next_30_days: { type: "number" },
                next_60_days: { type: "number" },
                next_90_days: { type: "number" },
                confidence: { type: "number" }
              }
            },
            at_risk_students: {
              type: "object",
              properties: {
                count: { type: "number" },
                percentage: { type: "number" },
                characteristics: { type: "array", items: { type: "string" } },
                risk_factors: { type: "array", items: { type: "string" } }
              }
            },
            interventions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  strategy: { type: "string" },
                  target_group: { type: "string" },
                  expected_impact: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            gamification_impact: {
              type: "object",
              properties: {
                current_effectiveness: { type: "number" },
                engagement_boost: { type: "number" },
                completion_boost: { type: "number" },
                recommendations: { type: "array", items: { type: "string" } }
              }
            },
            course_improvements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  improvement: { type: "string" },
                  impact: { type: "string" },
                  effort: { type: "string" }
                }
              }
            }
          }
        }
      });

      setInsights(result);
    } catch (error) {
      console.error("Failed to generate insights:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-cyan-400" />
          AI Predictive Insights
        </CardTitle>
        <Button onClick={generateInsights} disabled={isAnalyzing} className="btn-primary">
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Generate Insights'
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!insights ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
            <p className="text-gray-400">AI-powered predictions and recommendations for your course</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Completion Forecast */}
            <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-lg">
              <h3 className="font-semibold text-blue-300 mb-4">Completion Rate Forecast</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Next 30 Days</div>
                  <div className="text-3xl font-bold text-blue-400">
                    {insights.completion_forecast.next_30_days}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Next 60 Days</div>
                  <div className="text-3xl font-bold text-cyan-400">
                    {insights.completion_forecast.next_60_days}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Next 90 Days</div>
                  <div className="text-3xl font-bold text-green-400">
                    {insights.completion_forecast.next_90_days}%
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Confidence: {insights.completion_forecast.confidence}%
              </div>
            </div>

            {/* At-Risk Students */}
            <div className="p-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-lg">
              <h3 className="font-semibold text-red-300 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                At-Risk Students
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Estimated Count</div>
                  <div className="text-3xl font-bold text-red-400">
                    {insights.at_risk_students.count}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Percentage</div>
                  <div className="text-3xl font-bold text-orange-400">
                    {insights.at_risk_students.percentage}%
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-semibold text-gray-300 mb-2">Characteristics:</div>
                  <div className="flex flex-wrap gap-2">
                    {insights.at_risk_students.characteristics?.map((char, idx) => (
                      <Badge key={idx} variant="outline">{char}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-300 mb-2">Risk Factors:</div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {insights.at_risk_students.risk_factors?.map((factor, idx) => (
                      <li key={idx}>• {factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Interventions */}
            {insights.interventions?.length > 0 && (
              <div>
                <h3 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Recommended Interventions
                </h3>
                <div className="space-y-3">
                  {insights.interventions.map((intervention, idx) => (
                    <div key={idx} className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-white">{intervention.strategy}</div>
                        <Badge className={
                          intervention.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                          intervention.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }>
                          {intervention.priority} priority
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-400 mb-2">
                        <span className="text-purple-300">Target:</span> {intervention.target_group}
                      </div>
                      <div className="text-sm text-cyan-300">
                        <span className="text-gray-400">Expected Impact:</span> {intervention.expected_impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gamification Impact */}
            <div className="p-4 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg">
              <h3 className="font-semibold text-yellow-300 mb-4">Gamification Impact Analysis</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Effectiveness</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {insights.gamification_impact.current_effectiveness}%
                  </div>
                  <Progress value={insights.gamification_impact.current_effectiveness} className="h-2 mt-2" />
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Engagement Boost</div>
                  <div className="text-2xl font-bold text-orange-400">
                    +{insights.gamification_impact.engagement_boost}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Completion Boost</div>
                  <div className="text-2xl font-bold text-green-400">
                    +{insights.gamification_impact.completion_boost}%
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-300 mb-2">Recommendations:</div>
                <ul className="text-sm text-gray-300 space-y-1">
                  {insights.gamification_impact.recommendations?.map((rec, idx) => (
                    <li key={idx}>✓ {rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Course Improvements */}
            {insights.course_improvements?.length > 0 && (
              <div>
                <h3 className="font-semibold text-green-300 mb-3">Suggested Course Improvements</h3>
                <div className="space-y-2">
                  {insights.course_improvements.map((improvement, idx) => (
                    <div key={idx} className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <div className="font-medium text-white mb-2">{improvement.improvement}</div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-green-300">Impact: {improvement.impact}</span>
                        <span className="text-gray-400">Effort: {improvement.effort}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}