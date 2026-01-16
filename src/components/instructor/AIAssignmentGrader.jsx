import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

export default function AIAssignmentGrader({ assignment, submission, onGradingComplete }) {
  const [grading, setGrading] = useState(null);
  const [isGrading, setIsGrading] = useState(false);

  const gradeSubmission = async () => {
    setIsGrading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Grade this student assignment submission:

Assignment Requirements:
${assignment.description}
${assignment.requirements?.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Student Submission:
${submission.content}

Provide comprehensive grading with:
1. Overall grade (0-100)
2. Detailed feedback on content quality
3. Feedback on structure and organization
4. Assessment of meeting each requirement
5. Strengths identified
6. Areas for improvement with specific suggestions
7. Recommendations for next steps`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_grade: { type: "number" },
            grade_letter: { type: "string" },
            content_quality: {
              type: "object",
              properties: {
                score: { type: "number" },
                feedback: { type: "string" }
              }
            },
            structure_organization: {
              type: "object",
              properties: {
                score: { type: "number" },
                feedback: { type: "string" }
              }
            },
            requirement_assessment: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  requirement: { type: "string" },
                  met: { type: "boolean" },
                  feedback: { type: "string" }
                }
              }
            },
            strengths: { type: "array", items: { type: "string" } },
            areas_for_improvement: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  suggestion: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            recommendations: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          }
        }
      });

      setGrading(result);
      if (onGradingComplete) onGradingComplete(result);
    } catch (error) {
      console.error("Failed to grade submission:", error);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-400" />
          AI Assignment Grader
        </CardTitle>
        {!grading && (
          <Button onClick={gradeSubmission} disabled={isGrading} className="btn-primary">
            {isGrading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Grading...
              </>
            ) : (
              'Grade Submission'
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!grading ? (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
            <p className="text-gray-400">AI will analyze the submission and provide detailed grading</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Grade */}
            <div className="p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg text-center">
              <div className="text-sm text-gray-400 mb-2">Overall Grade</div>
              <div className="flex items-center justify-center gap-4">
                <div className="text-5xl font-bold text-purple-400">{grading.overall_grade}</div>
                <div className="text-3xl font-bold text-cyan-400">{grading.grade_letter}</div>
              </div>
              <Progress value={grading.overall_grade} className="h-3 mt-4" />
            </div>

            {/* Summary */}
            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <h3 className="font-semibold text-blue-300 mb-2">Summary</h3>
              <p className="text-gray-300 text-sm">{grading.summary}</p>
            </div>

            {/* Content & Structure Scores */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-300">Content Quality</h3>
                  <Badge className="bg-green-500/20 text-green-300">
                    {grading.content_quality.score}/100
                  </Badge>
                </div>
                <p className="text-sm text-gray-300">{grading.content_quality.feedback}</p>
              </div>
              <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-cyan-300">Structure & Organization</h3>
                  <Badge className="bg-cyan-500/20 text-cyan-300">
                    {grading.structure_organization.score}/100
                  </Badge>
                </div>
                <p className="text-sm text-gray-300">{grading.structure_organization.feedback}</p>
              </div>
            </div>

            {/* Requirements Assessment */}
            {grading.requirement_assessment?.length > 0 && (
              <div>
                <h3 className="font-semibold text-yellow-300 mb-3">Requirements Assessment</h3>
                <div className="space-y-2">
                  {grading.requirement_assessment.map((req, idx) => (
                    <div key={idx} className="p-3 bg-[#0f0618]/50 rounded-lg border border-yellow-500/20">
                      <div className="flex items-start gap-3">
                        {req.met ? (
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-white mb-1">{req.requirement}</div>
                          <p className="text-sm text-gray-400">{req.feedback}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {grading.strengths?.length > 0 && (
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <h3 className="font-semibold text-green-300 mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {grading.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {grading.areas_for_improvement?.length > 0 && (
              <div>
                <h3 className="font-semibold text-orange-300 mb-3">Areas for Improvement</h3>
                <div className="space-y-3">
                  {grading.areas_for_improvement.map((area, idx) => (
                    <div key={idx} className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">{area.area}</h4>
                        <Badge className={
                          area.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                          area.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }>
                          {area.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300">{area.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {grading.recommendations?.length > 0 && (
              <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <h3 className="font-semibold text-purple-300 mb-3">Next Steps</h3>
                <ul className="space-y-2">
                  {grading.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-purple-400 mt-1">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}