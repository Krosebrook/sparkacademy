import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Lightbulb } from "lucide-react";

export default function DisengagementAnalyzer({ courseId }) {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [courseId]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const course = await base44.entities.Course.list({ id: courseId });
      setAnalysis({ course: course[0], needsAnalysis: true });
    } catch (error) {
      console.error("Error loading course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeDisengagement = async () => {
    if (!analysis?.course) return;
    setIsAnalyzing(true);

    try {
      const enrollments = await base44.entities.Enrollment.filter({
        course_id: courseId
      });

      const feedbacks = await base44.entities.CourseFeedback.filter({
        course_id: courseId
      });

      const incompleteEnrollments = enrollments.filter(e => e.status !== 'completed');
      const avgTimeSpent = enrollments.length > 0 
        ? (enrollments.reduce((sum, e) => sum + (e.time_spent_minutes || 0), 0) / enrollments.length).toFixed(1)
        : 0;

      const prompt = `Analyze student disengagement in this course:

Course: ${analysis.course.title}
Description: ${analysis.course.description}
Lessons: ${analysis.course.lessons?.map(l => l.title).join(", ")}
Total Enrollments: ${enrollments.length}
Incomplete: ${incompleteEnrollments.length} (${(incompleteEnrollments.length/enrollments.length*100).toFixed(1)}%)
Average Time Spent: ${avgTimeSpent} minutes
Recent Feedback: ${feedbacks.slice(0, 5).map(f => f.feedback).join(" | ")}

Based on this data:
1. Identify 2-3 likely reasons for disengagement
2. Identify which lessons are most problematic
3. Suggest 3-4 targeted interventions (e.g., add examples, simplify content, add videos)
4. Recommend content improvements with specific examples`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            engagement_score: { type: "number", description: "0-100 engagement health" },
            primary_issues: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  issue: { type: "string" },
                  impact: { type: "string" },
                  severity: { type: "string", enum: ["low", "medium", "high"] }
                }
              }
            },
            problematic_lessons: { type: "array", items: { type: "string" } },
            interventions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  intervention: { type: "string" },
                  target: { type: "string" },
                  expected_impact: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] }
                }
              }
            },
            content_improvements: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          }
        }
      });

      setAnalysis(prev => ({
        ...prev,
        analysis: result,
        needsAnalysis: false
      }));
    } catch (error) {
      console.error("Error analyzing disengagement:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin" />;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          Disengagement Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis?.analysis ? (
          <>
            <p className="text-sm text-slate-600">
              AI will analyze student feedback, completion patterns, and time spent to identify disengagement causes and suggest interventions.
            </p>
            <Button
              onClick={analyzeDisengagement}
              disabled={isAnalyzing}
              className="w-full bg-orange-600"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Analyze Disengagement
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900">Engagement Health Score</span>
                <span className={`text-2xl font-bold ${analysis.analysis.engagement_score > 70 ? 'text-green-600' : analysis.analysis.engagement_score > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {analysis.analysis.engagement_score}/100
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Primary Issues
              </h4>
              <div className="space-y-2">
                {analysis.analysis.primary_issues?.map((issue, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="font-semibold text-slate-900 text-sm">{issue.issue}</p>
                      <Badge className={issue.severity === 'high' ? 'bg-red-100 text-red-800' : issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}>
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-700">{issue.impact}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Recommended Interventions
              </h4>
              <div className="space-y-2">
                {analysis.analysis.interventions?.map((int, idx) => (
                  <div key={idx} className="p-3 bg-green-50 rounded border border-green-200">
                    <p className="font-semibold text-slate-900 text-sm">{int.intervention}</p>
                    <p className="text-xs text-slate-600 mt-1">Target: {int.target}</p>
                    <p className="text-xs text-slate-600 mt-1">Expected Impact: {int.expected_impact}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Content Improvements</h4>
              <ul className="space-y-1">
                {analysis.analysis.content_improvements?.map((imp, idx) => (
                  <li key={idx} className="text-sm text-slate-700">✓ {imp}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-slate-700 italic">{analysis.analysis.summary}</p>
            </div>

            <Button
              onClick={() => setAnalysis(prev => ({ ...prev, analysis: null }))}
              variant="outline"
              className="w-full"
            >
              Re-analyze
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}