import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Brain, Loader2, BookOpen } from "lucide-react";

export default function KnowledgeGapAnalyzer({ courseId }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: enrollment } = useQuery({
    queryKey: ['my-enrollment', courseId],
    queryFn: async () => {
      const user = await base44.auth.me();
      const enrollments = await base44.entities.Enrollment.filter({
        course_id: courseId,
        student_email: user.email
      });
      return enrollments[0];
    }
  });

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.get(courseId)
  });

  const analyzeGaps = async () => {
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze knowledge gaps for a student in "${course.title}":

Progress: ${enrollment?.completion_percentage || 0}%
Completed Lessons: ${enrollment?.completed_lessons?.length || 0}/${course?.lessons?.length || 0}
Quiz Performance: ${enrollment?.quiz_scores ? 'Available' : 'None'}

Course Topics: ${course?.lessons?.map(l => l.title).join(', ')}

Identify:
1. Specific knowledge gaps based on incomplete lessons
2. Topics that need reinforcement
3. Recommended learning path to fill gaps
4. External resources that could help
5. Estimated time to close each gap`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_assessment: { type: "string" },
            proficiency_score: { type: "number" },
            knowledge_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  severity: { type: "string" },
                  description: { type: "string" },
                  lessons_to_revisit: { type: "array", items: { type: "number" } }
                }
              }
            },
            recommended_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  estimated_time: { type: "string" }
                }
              }
            },
            external_resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAnalysis(result);

      // Save to database
      await base44.entities.LearningPathProgress.create({
        user_email: (await base44.auth.me()).email,
        course_id: courseId,
        knowledge_gaps: result.knowledge_gaps,
        recommended_resources: result.external_resources
      });
    } catch (error) {
      console.error("Failed to analyze gaps:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-orange-400" />
          Knowledge Gap Analysis
        </CardTitle>
        <Button onClick={analyzeGaps} disabled={isAnalyzing} className="btn-primary">
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze My Progress'
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-orange-400/30 mx-auto mb-4" />
            <p className="text-gray-400">AI will identify your knowledge gaps and recommend next steps</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border border-orange-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-orange-300">Overall Proficiency</h3>
                <span className="text-2xl font-bold text-orange-400">{analysis.proficiency_score}%</span>
              </div>
              <Progress value={analysis.proficiency_score} className="h-2 mb-2" />
              <p className="text-sm text-gray-300">{analysis.overall_assessment}</p>
            </div>

            {analysis.knowledge_gaps?.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-300 mb-3">Knowledge Gaps Identified</h3>
                <div className="space-y-3">
                  {analysis.knowledge_gaps.map((gap, idx) => (
                    <div key={idx} className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{gap.topic}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          gap.severity === 'high' ? 'bg-red-500/30 text-red-300' :
                          gap.severity === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                          'bg-blue-500/30 text-blue-300'
                        }`}>
                          {gap.severity} severity
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{gap.description}</p>
                      {gap.lessons_to_revisit?.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Revisit lessons: {gap.lessons_to_revisit.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-cyan-300 mb-3">Recommended Actions</h3>
              <div className="space-y-2">
                {analysis.recommended_actions?.map((action, idx) => (
                  <div key={idx} className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg flex items-start justify-between">
                    <div>
                      <div className="font-medium text-white mb-1">{action.action}</div>
                      <div className="text-xs text-gray-400">Est. time: {action.estimated_time}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      action.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                      action.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {action.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {analysis.external_resources?.length > 0 && (
              <div>
                <h3 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Recommended Resources
                </h3>
                <div className="space-y-2">
                  {analysis.external_resources.map((resource, idx) => (
                    <div key={idx} className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <div className="font-medium text-white mb-1">{resource.title}</div>
                      <div className="text-xs text-gray-400 mb-1">{resource.type}</div>
                      <div className="text-sm text-gray-500">{resource.reason}</div>
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