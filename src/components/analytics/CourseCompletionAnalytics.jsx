import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingDown, AlertCircle, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function CourseCompletionAnalytics({ courseId, courseTitle }) {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeCompletion = async () => {
    setIsLoading(true);
    try {
      // Fetch enrollments for this course
      const enrollments = await base44.entities.Enrollment.filter({ course_id: courseId });
      
      // Fetch course to get lessons
      const course = await base44.entities.Course.get(courseId);
      
      // Calculate metrics
      const totalEnrollments = enrollments.length;
      const completedCount = enrollments.filter(e => e.status === 'completed').length;
      const completionRate = totalEnrollments > 0 ? (completedCount / totalEnrollments * 100).toFixed(1) : 0;
      
      // Analyze drop-off points per lesson
      const lessonAnalysis = course.lessons?.map((lesson, idx) => {
        const progressData = enrollments.map(e => e.progress || []);
        const completedThisLesson = progressData.filter(p => p.includes(lesson.order)).length;
        const startedThisLesson = progressData.filter(p => {
          const maxCompleted = Math.max(...p, 0);
          return maxCompleted >= lesson.order - 1;
        }).length;
        
        return {
          lesson_number: lesson.order,
          lesson_title: lesson.title,
          completion_rate: startedThisLesson > 0 ? ((completedThisLesson / startedThisLesson) * 100).toFixed(1) : 0,
          started_count: startedThisLesson,
          completed_count: completedThisLesson,
          drop_off_rate: startedThisLesson > 0 ? (((startedThisLesson - completedThisLesson) / startedThisLesson) * 100).toFixed(1) : 0
        };
      }) || [];

      // Identify critical drop-off points (> 30% drop-off)
      const criticalDropOffs = lessonAnalysis.filter(l => parseFloat(l.drop_off_rate) > 30);

      // AI Analysis
      const aiInsights = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this course completion data and provide actionable insights:

Course: ${courseTitle}
Total Enrollments: ${totalEnrollments}
Completion Rate: ${completionRate}%

Lesson Analysis:
${lessonAnalysis.map(l => `- Lesson ${l.lesson_number}: "${l.lesson_title}" - ${l.completion_rate}% completion, ${l.drop_off_rate}% drop-off`).join('\n')}

Critical Drop-off Points (>30% drop):
${criticalDropOffs.map(l => `- Lesson ${l.lesson_number}: "${l.lesson_title}" - ${l.drop_off_rate}% drop-off`).join('\n') || 'None'}

Provide:
1. Root cause analysis: Why might students be dropping off at these points?
2. Content quality assessment: Which lessons may need improvement?
3. Difficulty curve analysis: Is the progression appropriate?
4. Specific interventions: What changes should the creator make?
5. Engagement strategies: How to re-engage students who dropped off?`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_assessment: { type: "string" },
            root_causes: { type: "array", items: { type: "string" } },
            critical_lessons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  lesson_number: { type: "number" },
                  issue: { type: "string" },
                  severity: { type: "string", enum: ["low", "medium", "high"] },
                  suggested_fix: { type: "string" }
                }
              }
            },
            interventions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  intervention_type: { type: "string" },
                  description: { type: "string" },
                  expected_impact: { type: "string" },
                  implementation_effort: { type: "string", enum: ["low", "medium", "high"] }
                }
              }
            },
            engagement_strategies: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAnalytics({
        metrics: {
          totalEnrollments,
          completedCount,
          completionRate,
          avgProgress: enrollments.reduce((sum, e) => sum + (e.progress?.length || 0), 0) / totalEnrollments || 0
        },
        lessonAnalysis,
        criticalDropOffs,
        aiInsights
      });

    } catch (error) {
      console.error("Error analyzing completion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity === "high") return "bg-red-100 text-red-800 border-red-300";
    if (severity === "medium") return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-blue-100 text-blue-800 border-blue-300";
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-cyan-400" />
          Course Completion Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analytics ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              Analyze completion rates, identify drop-off points, and get AI-powered improvement suggestions
            </p>
            <Button onClick={analyzeCompletion} disabled={isLoading} className="btn-primary">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Completion Data"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#0f0618] rounded-lg border border-cyan-500/20">
                <div className="text-sm text-gray-400">Total Enrollments</div>
                <div className="text-2xl font-bold text-cyan-400">{analytics.metrics.totalEnrollments}</div>
              </div>
              <div className="p-4 bg-[#0f0618] rounded-lg border border-green-500/20">
                <div className="text-sm text-gray-400">Completed</div>
                <div className="text-2xl font-bold text-green-400">{analytics.metrics.completedCount}</div>
              </div>
              <div className="p-4 bg-[#0f0618] rounded-lg border border-orange-500/20">
                <div className="text-sm text-gray-400">Completion Rate</div>
                <div className="text-2xl font-bold text-orange-400">{analytics.metrics.completionRate}%</div>
              </div>
              <div className="p-4 bg-[#0f0618] rounded-lg border border-magenta-500/20">
                <div className="text-sm text-gray-400">Avg Progress</div>
                <div className="text-2xl font-bold text-magenta-400">{analytics.metrics.avgProgress.toFixed(1)} lessons</div>
              </div>
            </div>

            {/* AI Overall Assessment */}
            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <h3 className="font-semibold text-blue-300 mb-2">📊 AI Assessment</h3>
              <p className="text-sm text-gray-300">{analytics.aiInsights.overall_assessment}</p>
            </div>

            {/* Lesson-by-Lesson Analysis */}
            <div>
              <h3 className="font-semibold text-cyan-300 mb-3">Lesson Drop-off Analysis</h3>
              <div className="space-y-2">
                {analytics.lessonAnalysis.map((lesson, idx) => (
                  <div key={idx} className="p-3 bg-[#0f0618] rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        Lesson {lesson.lesson_number}: {lesson.lesson_title}
                      </span>
                      <Badge className={parseFloat(lesson.drop_off_rate) > 30 ? "bg-red-900 text-red-300" : "bg-green-900 text-green-300"}>
                        {lesson.drop_off_rate}% drop-off
                      </Badge>
                    </div>
                    <Progress value={parseFloat(lesson.completion_rate)} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{lesson.started_count} started</span>
                      <span>{lesson.completed_count} completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Issues */}
            {analytics.aiInsights.critical_lessons?.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-300 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Critical Issues Identified
                </h3>
                <div className="space-y-3">
                  {analytics.aiInsights.critical_lessons.map((issue, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-semibold">Lesson {issue.lesson_number}</span>
                        <Badge variant="outline">{issue.severity} severity</Badge>
                      </div>
                      <p className="text-sm mb-2"><strong>Issue:</strong> {issue.issue}</p>
                      <p className="text-sm"><strong>Fix:</strong> {issue.suggested_fix}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Root Causes */}
            <div>
              <h3 className="font-semibold text-orange-300 mb-3">Potential Root Causes</h3>
              <ul className="space-y-2">
                {analytics.aiInsights.root_causes?.map((cause, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-orange-400">•</span>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interventions */}
            <div>
              <h3 className="font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Recommended Interventions
              </h3>
              <div className="space-y-3">
                {analytics.aiInsights.interventions?.map((intervention, idx) => (
                  <div key={idx} className="p-4 bg-[#0f0618] rounded-lg border border-cyan-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-cyan-300">{intervention.intervention_type}</span>
                      <Badge className={`
                        ${intervention.implementation_effort === 'high' ? 'bg-red-900 text-red-300' : 
                          intervention.implementation_effort === 'medium' ? 'bg-yellow-900 text-yellow-300' : 
                          'bg-green-900 text-green-300'}
                      `}>
                        {intervention.implementation_effort} effort
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{intervention.description}</p>
                    <p className="text-xs text-magenta-300">
                      <strong>Expected Impact:</strong> {intervention.expected_impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Engagement Strategies */}
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <h3 className="font-semibold text-green-300 mb-3">Engagement Strategies</h3>
              <ul className="space-y-2">
                {analytics.aiInsights.engagement_strategies?.map((strategy, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400">✓</span>
                    <span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={() => setAnalytics(null)} variant="outline" className="w-full">
              Run New Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}