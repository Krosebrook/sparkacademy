import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";

export default function EngagementInsights({ course, enrollments }) {
  const [insights, setInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeEngagement = async () => {
    setIsAnalyzing(true);
    try {
      // Calculate engagement metrics
      const lessonProgress = {};
      course.lessons?.forEach(lesson => {
        lessonProgress[lesson.order] = {
          title: lesson.title,
          started: 0,
          completed: 0,
          avgTimeSpent: 0
        };
      });

      enrollments.forEach(enrollment => {
        enrollment.progress?.forEach(lessonOrder => {
          if (lessonProgress[lessonOrder]) {
            lessonProgress[lessonOrder].started++;
          }
        });
        
        enrollment.completed_lessons?.forEach(lessonOrder => {
          if (lessonProgress[lessonOrder]) {
            lessonProgress[lessonOrder].completed++;
          }
        });
      });

      const engagementData = Object.entries(lessonProgress).map(([order, data]) => ({
        lesson: order,
        title: data.title,
        startRate: enrollments.length > 0 ? (data.started / enrollments.length * 100).toFixed(1) : 0,
        completionRate: data.started > 0 ? (data.completed / data.started * 100).toFixed(1) : 0,
        dropoff: data.started > 0 ? ((data.started - data.completed) / data.started * 100).toFixed(1) : 0
      }));

      // Use AI to generate insights
      const prompt = `Analyze student engagement data for course "${course.title}":

Lessons: ${course.lessons?.length || 0}
Total Students: ${enrollments.length}
Avg Completion: ${enrollments.length > 0 ? (enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / enrollments.length).toFixed(1) : 0}%

Lesson-by-lesson engagement:
${engagementData.map(l => `Lesson ${l.lesson}: ${l.title} - ${l.startRate}% started, ${l.completionRate}% completed, ${l.dropoff}% drop-off`).join('\n')}

Provide:
1. Overall engagement assessment (high/medium/low)
2. Top 3 engagement strengths
3. Top 3 engagement concerns
4. Specific recommendations to improve engagement
5. Predicted impact of improvements`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_assessment: { type: "string" },
            engagement_score: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            concerns: { type: "array", items: { type: "string" } },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  reason: { type: "string" },
                  priority: { type: "string" },
                  expected_impact: { type: "string" }
                }
              }
            },
            trends: {
              type: "object",
              properties: {
                early_dropoff: { type: "boolean" },
                mid_course_fatigue: { type: "boolean" },
                strong_finish: { type: "boolean" }
              }
            }
          }
        }
      });

      setInsights({
        ...result,
        lessonData: engagementData
      });
    } catch (error) {
      console.error("Error analyzing engagement:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-cyan-400" />
              Deep Engagement Analysis
            </span>
            <Button onClick={analyzeEngagement} disabled={isAnalyzing} className="btn-primary">
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze with AI'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!insights ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
              <p className="text-gray-400">Click "Analyze with AI" to generate deep engagement insights</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Assessment */}
              <div className="p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-cyan-300">Overall Engagement Score</h3>
                  <span className="text-3xl font-bold text-cyan-400">{insights.engagement_score}/100</span>
                </div>
                <Progress value={insights.engagement_score} className="h-2 mb-2" />
                <p className="text-sm text-gray-300">{insights.overall_assessment}</p>
              </div>

              {/* Strengths */}
              <div>
                <h3 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Engagement Strengths
                </h3>
                <div className="space-y-2">
                  {insights.strengths?.map((strength, idx) => (
                    <div key={idx} className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg text-sm text-gray-300">
                      {strength}
                    </div>
                  ))}
                </div>
              </div>

              {/* Concerns */}
              <div>
                <h3 className="font-semibold text-orange-300 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Areas of Concern
                </h3>
                <div className="space-y-2">
                  {insights.concerns?.map((concern, idx) => (
                    <div key={idx} className="p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg text-sm text-gray-300">
                      {concern}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="font-semibold text-purple-300 mb-3">AI Recommendations</h3>
                <div className="space-y-3">
                  {insights.recommendations?.map((rec, idx) => (
                    <div key={idx} className="p-4 bg-[#1a0a2e] border border-purple-500/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">{rec.action}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          rec.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                          rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {rec.priority} priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{rec.reason}</p>
                      <div className="text-xs text-cyan-400">
                        Expected Impact: {rec.expected_impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lesson-by-Lesson Breakdown */}
              <div>
                <h3 className="font-semibold text-cyan-300 mb-3">Lesson Engagement Breakdown</h3>
                <div className="space-y-2">
                  {insights.lessonData?.map((lesson) => (
                    <div key={lesson.lesson} className="p-3 bg-[#0f0618]/50 border border-cyan-500/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">Lesson {lesson.lesson}: {lesson.title}</span>
                        <span className="text-xs text-gray-400">{lesson.completionRate}% completed</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Started:</span>
                          <span className="ml-1 text-green-400">{lesson.startRate}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Completed:</span>
                          <span className="ml-1 text-cyan-400">{lesson.completionRate}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Drop-off:</span>
                          <span className="ml-1 text-orange-400">{lesson.dropoff}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}