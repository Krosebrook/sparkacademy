import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, CheckCircle2, Lock } from "lucide-react";

export default function PersonalizedLearningPath({ studentEmail, courseId }) {
  const [path, setPath] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadLearningPath();
  }, [studentEmail, courseId]);

  const loadLearningPath = async () => {
    try {
      const paths = await base44.entities.StudentLearningPath.filter({
        student_email: studentEmail,
        course_id: courseId
      });
      if (paths.length > 0) {
        setPath(paths[0]);
      }
    } catch (error) {
      console.error("Error loading path:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePath = async () => {
    setIsGenerating(true);
    try {
      const enrollment = await base44.entities.Enrollment.filter({
        student_email: studentEmail,
        course_id: courseId
      });
      const course = await base44.entities.Course.get(courseId);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on student progress and quiz scores, generate personalized lesson recommendations.
        
Student Progress: ${enrollment[0]?.progress?.map(p => `Lesson ${p.lesson_order}: ${p.completed ? 'Complete' : 'Incomplete'}, Quiz: ${p.quiz_score || 'N/A'}`).join('; ')}
Course: ${course.title}
Lessons: ${course.lessons?.map(l => l.title).join(', ')}

Recommend next 3-5 lessons with reasons. Consider completion order, difficulty progression, and weak areas.`,
        response_json_schema: {
          type: "object",
          properties: {
            learning_style: { type: "string" },
            current_level: { type: "string" },
            next_recommended: { type: "string" },
            recommended_lessons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  lesson_title: { type: "string" },
                  reason: { type: "string" },
                  confidence_score: { type: "number" }
                }
              }
            }
          }
        }
      });

      const newPath = {
        student_email: studentEmail,
        course_id: courseId,
        learning_style: result.learning_style,
        current_level: result.current_level,
        next_recommended_lesson: result.next_recommended,
        recommended_lessons: result.recommended_lessons.map(l => ({
          lesson_title: l.lesson_title,
          reason: l.reason,
          confidence_score: l.confidence_score,
          completed: false
        }))
      };

      const existing = await base44.entities.StudentLearningPath.filter({
        student_email: studentEmail,
        course_id: courseId
      });

      if (existing.length > 0) {
        await base44.entities.StudentLearningPath.update(existing[0].id, newPath);
      } else {
        await base44.entities.StudentLearningPath.create(newPath);
      }

      setPath(newPath);
    } catch (error) {
      console.error("Error generating path:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) return <Loader2 className="w-8 h-8 animate-spin" />;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Your Personalized Path
          </CardTitle>
          <Button
            onClick={generatePath}
            disabled={isGenerating}
            size="sm"
            className="bg-blue-600"
          >
            {isGenerating ? "Analyzing..." : "Regenerate"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!path ? (
          <Button onClick={generatePath} className="w-full" disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate My Learning Path"}
          </Button>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-slate-600">Learning Style</p>
                <p className="font-semibold">{path.learning_style}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-slate-600">Current Level</p>
                <p className="font-semibold">{path.current_level}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border-l-4 border-l-green-500">
              <p className="text-sm font-semibold text-slate-900 mb-1">Next Recommended</p>
              <p className="text-lg text-green-600 font-bold">{path.next_recommended_lesson}</p>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Suggested Lessons</p>
              <div className="space-y-2">
                {path.recommended_lessons?.map((lesson, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{lesson.lesson_title}</p>
                        <p className="text-xs text-slate-600 mt-1">{lesson.reason}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {(lesson.confidence_score * 100).toFixed(0)}% match
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}