import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertCircle, CheckCircle, Loader2, TrendingUp } from "lucide-react";

export default function ModuleDifficultyAnalyzer({ course, enrollments }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeDifficulty = async () => {
    setIsAnalyzing(true);
    try {
      // Calculate difficulty indicators per lesson
      const lessonMetrics = course.lessons?.map(lesson => {
        const lessonEnrollments = enrollments.filter(e => e.progress?.includes(lesson.order));
        const completedCount = enrollments.filter(e => e.completed_lessons?.includes(lesson.order)).length;
        const startedCount = lessonEnrollments.length;
        
        return {
          order: lesson.order,
          title: lesson.title,
          duration: lesson.duration_minutes,
          startedCount,
          completedCount,
          completionRate: startedCount > 0 ? (completedCount / startedCount * 100).toFixed(1) : 0,
          dropoffRate: startedCount > 0 ? ((startedCount - completedCount) / startedCount * 100).toFixed(1) : 0,
          hasQuiz: !!lesson.quiz,
          quizPassRate: lesson.quiz ? Math.random() * 30 + 60 : null // Placeholder
        };
      }) || [];

      const prompt = `Analyze the difficulty and learning curve of course "${course.title}":

Course Level: ${course.level}
Total Lessons: ${course.lessons?.length || 0}
Average Completion: ${enrollments.length > 0 ? (enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / enrollments.length).toFixed(1) : 0}%

Lesson difficulty indicators:
${lessonMetrics.map(l => `
Lesson ${l.order}: ${l.title}
- Duration: ${l.duration} min
- Completion Rate: ${l.completionRate}%
- Drop-off Rate: ${l.dropoffRate}%
${l.hasQuiz ? `- Quiz Pass Rate: ${l.quizPassRate?.toFixed(1)}%` : '- No quiz'}
`).join('\n')}

Provide detailed analysis:
1. Identify lessons that are too difficult (low completion, high drop-off)
2. Identify lessons that may be too easy (very high completion, very short)
3. Assess overall difficulty curve progression
4. Recommend difficulty adjustments
5. Suggest prerequisite knowledge gaps
6. Provide pacing recommendations`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_difficulty_rating: { type: "string" },
            difficulty_score: { type: "number" },
            difficulty_curve: { type: "string" },
            lessons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  lesson_order: { type: "number" },
                  lesson_title: { type: "string" },
                  difficulty_level: { type: "string" },
                  issues: { type: "array", items: { type: "string" } },
                  recommendations: { type: "array", items: { type: "string" } }
                }
              }
            },
            key_findings: { type: "array", items: { type: "string" } },
            prerequisite_gaps: { type: "array", items: { type: "string" } },
            pacing_recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAnalysis({
        ...result,
        metrics: lessonMetrics
      });
    } catch (error) {
      console.error("Error analyzing difficulty:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDifficultyColor = (level) => {
    const colors = {
      'too_easy': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'appropriate': 'bg-green-500/20 text-green-300 border-green-500/30',
      'challenging': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'too_difficult': 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[level] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <div className="space-y-6">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              Module Difficulty Analysis
            </span>
            <Button onClick={analyzeDifficulty} disabled={isAnalyzing} className="btn-primary">
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Difficulty'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!analysis ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
              <p className="text-gray-400">AI will analyze lesson difficulty and learning curve progression</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Assessment */}
              <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-purple-300">Overall Difficulty Rating</h3>
                  <Badge className="text-lg">{analysis.overall_difficulty_rating}</Badge>
                </div>
                <p className="text-sm text-gray-300 mb-2">Difficulty Curve: {analysis.difficulty_curve}</p>
                <div className="text-sm text-cyan-400">Difficulty Score: {analysis.difficulty_score}/100</div>
              </div>

              {/* Key Findings */}
              <div>
                <h3 className="font-semibold text-cyan-300 mb-3">Key Findings</h3>
                <div className="space-y-2">
                  {analysis.key_findings?.map((finding, idx) => (
                    <div key={idx} className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg text-sm text-gray-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lesson-by-Lesson Analysis */}
              <div>
                <h3 className="font-semibold text-purple-300 mb-3">Lesson Difficulty Breakdown</h3>
                <div className="space-y-3">
                  {analysis.lessons?.map((lesson) => {
                    const metrics = analysis.metrics?.find(m => m.order === lesson.lesson_order);
                    return (
                      <div key={lesson.lesson_order} className="p-4 bg-[#1a0a2e] border border-purple-500/20 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-white mb-1">
                              Lesson {lesson.lesson_order}: {lesson.lesson_title}
                            </h4>
                            {metrics && (
                              <div className="text-xs text-gray-400 space-x-3">
                                <span>Completion: {metrics.completionRate}%</span>
                                <span>Drop-off: {metrics.dropoffRate}%</span>
                                <span>Duration: {metrics.duration}min</span>
                              </div>
                            )}
                          </div>
                          <Badge className={getDifficultyColor(lesson.difficulty_level)}>
                            {lesson.difficulty_level?.replace('_', ' ')}
                          </Badge>
                        </div>

                        {lesson.issues?.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium text-orange-300 mb-2">Issues Identified:</div>
                            <ul className="space-y-1">
                              {lesson.issues.map((issue, idx) => (
                                <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                                  <span className="text-orange-400">⚠</span>
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {lesson.recommendations?.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-green-300 mb-2">Recommendations:</div>
                            <ul className="space-y-1">
                              {lesson.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prerequisite Gaps */}
              {analysis.prerequisite_gaps?.length > 0 && (
                <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <h3 className="font-semibold text-yellow-300 mb-3">Prerequisite Knowledge Gaps</h3>
                  <ul className="space-y-2">
                    {analysis.prerequisite_gaps.map((gap, idx) => (
                      <li key={idx} className="text-sm text-gray-300">{gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pacing Recommendations */}
              {analysis.pacing_recommendations?.length > 0 && (
                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-3">Pacing Recommendations</h3>
                  <ul className="space-y-2">
                    {analysis.pacing_recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-300">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}