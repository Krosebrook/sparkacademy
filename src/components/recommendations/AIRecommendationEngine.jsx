import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, TrendingUp, BookOpen, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AIRecommendationEngine() {
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Enrollment.filter({ student_email: user.email });
    }
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['my-recommendations'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.CourseRecommendation.filter({
        student_email: user.email,
        dismissed: false
      }, '-confidence_score', 10);
    }
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.filter({ is_published: true })
  });

  const generateRecommendations = async () => {
    setGenerating(true);
    try {
      // Analyze learning history
      const completedCourses = enrollments.filter(e => e.completion_percentage === 100);
      const inProgressCourses = enrollments.filter(e => e.completion_percentage > 0 && e.completion_percentage < 100);
      
      const completedSkills = new Set();
      for (const enrollment of completedCourses) {
        const course = allCourses.find(c => c.id === enrollment.course_id);
        if (course?.skills_taught) {
          course.skills_taught.forEach(skill => completedSkills.add(skill));
        }
      }

      // Get AI recommendations
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate personalized course recommendations for a learner:

Learning History:
- Completed ${completedCourses.length} courses
- Currently taking ${inProgressCourses.length} courses
- Skills acquired: ${Array.from(completedSkills).join(', ')}

Available Courses:
${allCourses.slice(0, 20).map(c => `- ${c.title} (${c.category}, Level: ${c.level}, Skills: ${c.skills_taught?.join(', ')})`).join('\n')}

Recommend 5-10 courses that:
1. Build on existing skills
2. Fill knowledge gaps
3. Support career progression
4. Match learning style (varied difficulty)
5. Create logical learning paths`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  course_title: { type: "string" },
                  reason: { type: "string" },
                  confidence: { type: "number" },
                  factors: { type: "array", items: { type: "string" } },
                  sequence_position: { type: "number" },
                  prerequisites_met: { type: "boolean" }
                }
              }
            }
          }
        }
      });

      // Save recommendations
      for (const rec of result.recommendations) {
        const course = allCourses.find(c => c.title === rec.course_title);
        if (course) {
          await base44.entities.CourseRecommendation.create({
            student_email: user.email,
            course_id: course.id,
            reason: rec.reason,
            confidence_score: rec.confidence,
            factors: rec.factors
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['my-recommendations'] });
    } catch (error) {
      console.error("Failed to generate recommendations:", error);
    } finally {
      setGenerating(false);
    }
  };

  const dismissRecommendation = useMutation({
    mutationFn: (recId) => base44.entities.CourseRecommendation.update(recId, { dismissed: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-recommendations'] })
  });

  return (
    <Card className="card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            AI-Powered Recommendations
          </CardTitle>
          <Button onClick={generateRecommendations} disabled={generating} className="btn-primary">
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No recommendations yet. Let AI analyze your learning journey!</p>
            <Button onClick={generateRecommendations} className="btn-primary">
              Get Personalized Recommendations
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, idx) => {
              const course = allCourses.find(c => c.id === rec.course_id);
              if (!course) return null;

              return (
                <div key={rec.id} className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-purple-400">#{idx + 1}</div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{course.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-cyan-500/20 text-cyan-300">{course.category}</Badge>
                          <Badge className="bg-blue-500/20 text-blue-300">{course.level}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Match Score</div>
                      <div className="text-2xl font-bold text-green-400">{rec.confidence_score}%</div>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-3">{rec.reason}</p>

                  {rec.factors?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {rec.factors.map((factor, fidx) => (
                        <Badge key={fidx} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link to={createPageUrl('CourseViewer') + `?courseId=${course.id}`}>
                      <Button className="btn-primary">
                        <BookOpen className="w-4 h-4 mr-2" />
                        View Course
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => dismissRecommendation.mutate(rec.id)}
                    >
                      Not Interested
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}