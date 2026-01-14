import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Lightbulb } from "lucide-react";

export default function ContentImprovementSuggestions({ courseId, creatorEmail }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [courseId]);

  const loadSuggestions = async () => {
    try {
      const data = await base44.entities.ContentImprovement.filter({
        course_id: courseId,
        status: "new"
      });
      setSuggestions(data);
    } catch (error) {
      console.error("Error loading suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeCourse = async () => {
    setIsAnalyzing(true);
    try {
      const course = await base44.entities.Course.get(courseId);
      const enrollments = await base44.entities.Enrollment.filter({ course_id: courseId });

      const lessonAnalysis = course.lessons?.map((lesson, idx) => {
        const lessonsStats = enrollments.filter(e => 
          e.progress?.some(p => p.lesson_order === idx)
        );
        const completedCount = lessonsStats.filter(e =>
          e.progress?.find(p => p.lesson_order === idx && p.completed)
        ).length;

        return {
          lesson_order: idx,
          title: lesson.title,
          completion_rate: (completedCount / enrollments.length) * 100,
          avg_quiz_score: lessonsStats.reduce((sum, e) => {
            const progress = e.progress?.find(p => p.lesson_order === idx);
            return sum + (progress?.quiz_score || 0);
          }, 0) / (lessonsStats.length || 1),
          avg_time_spent: lessonsStats.reduce((sum, e) => {
            const progress = e.progress?.find(p => p.lesson_order === idx);
            return sum + (progress?.time_spent_minutes || 0);
          }, 0) / (lessonsStats.length || 1)
        };
      });

      const prompt = `Analyze these lesson engagement metrics and suggest improvements:

${lessonAnalysis.map(l => `Lesson ${l.lesson_order} (${l.title}): ${l.completion_rate.toFixed(0)}% completion, ${l.avg_quiz_score.toFixed(1)}/100 quiz avg, ${l.avg_time_spent.toFixed(0)}m avg time`).join('\n')}

For each lesson with issues, provide specific, actionable improvement suggestions.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            improvements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  lesson_order: { type: "number" },
                  improvement_type: { type: "string" },
                  priority_score: { type: "number" },
                  metric_data: { type: "object" },
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        suggestion: { type: "string" },
                        impact: { type: "string" },
                        priority: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      for (const improvement of result.improvements) {
        await base44.entities.ContentImprovement.create({
          course_id: courseId,
          creator_email: creatorEmail,
          lesson_order: improvement.lesson_order,
          improvement_type: improvement.improvement_type,
          priority_score: improvement.priority_score,
          metric_data: improvement.metric_data,
          ai_suggestions: improvement.suggestions,
          status: "new"
        });
      }

      await loadSuggestions();
    } catch (error) {
      console.error("Error analyzing course:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateStatus = async (id, status) => {
    await base44.entities.ContentImprovement.update(id, { status });
    await loadSuggestions();
  };

  if (isLoading) return <Loader2 className="w-8 h-8 animate-spin" />;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            AI Improvement Suggestions
          </CardTitle>
          <Button
            onClick={analyzeCourse}
            disabled={isAnalyzing}
            size="sm"
            className="bg-amber-600"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Course"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <p className="text-slate-600 text-center py-8">No suggestions yet. Analyze your course to get started.</p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((sugg) => (
              <div key={sugg.id} className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">Lesson {sugg.lesson_order}</p>
                    <Badge className="mt-1 bg-amber-100 text-amber-800">
                      {sugg.improvement_type.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <Badge className={
                    sugg.priority_score > 75 ? "bg-red-100 text-red-800" :
                    sugg.priority_score > 50 ? "bg-yellow-100 text-yellow-800" :
                    "bg-green-100 text-green-800"
                  }>
                    Priority: {sugg.priority_score}
                  </Badge>
                </div>

                <div className="space-y-2 my-3">
                  {sugg.ai_suggestions?.slice(0, 3).map((s, idx) => (
                    <div key={idx} className="text-sm p-2 bg-white rounded border border-amber-100">
                      <p className="font-semibold text-slate-800">{s.suggestion}</p>
                      <p className="text-xs text-slate-600 mt-1">Expected impact: {s.impact}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => updateStatus(sugg.id, "acknowledged")}
                    size="sm"
                    variant="outline"
                  >
                    Acknowledge
                  </Button>
                  <Button
                    onClick={() => updateStatus(sugg.id, "in_progress")}
                    size="sm"
                    className="bg-amber-600"
                  >
                    In Progress
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}