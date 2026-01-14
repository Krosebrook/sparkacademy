import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Target, CheckCircle2, Circle } from "lucide-react";

export default function LearningPathVisualization({ studentEmail, courseId }) {
  const [path, setPath] = useState(null);
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPathData();
  }, [studentEmail, courseId]);

  const loadPathData = async () => {
    try {
      const paths = await base44.entities.StudentLearningPath.filter({
        student_email: studentEmail,
        course_id: courseId
      });
      if (paths.length > 0) setPath(paths[0]);

      const courseData = await base44.entities.Course.get(courseId);
      setCourse(courseData);

      const enrollments = await base44.entities.Enrollment.filter({
        student_email: studentEmail,
        course_id: courseId
      });
      if (enrollments.length > 0) setEnrollment(enrollments[0]);
    } catch (error) {
      console.error("Error loading path data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin" />;

  if (!path || !course) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <p className="text-slate-600">Generate your learning path to see visualizations</p>
        </CardContent>
      </Card>
    );
  }

  const completedCount = enrollment?.progress?.filter(p => p.completed).length || 0;
  const totalLessons = course.lessons?.length || 1;
  const progressPercentage = (completedCount / totalLessons) * 100;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-green-600" />
          Your Learning Journey
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-slate-900">Course Progress</p>
            <Badge className="bg-green-100 text-green-800">{progressPercentage.toFixed(0)}%</Badge>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Lesson Roadmap */}
        <div>
          <p className="text-sm font-semibold text-slate-900 mb-3">Lesson Roadmap</p>
          <div className="space-y-2">
            {course.lessons?.map((lesson, idx) => {
              const isCompleted = enrollment?.progress?.some(
                p => p.lesson_order === idx && p.completed
              );
              const isRecommended = path?.recommended_lessons?.some(
                l => l.lesson_title === lesson.title
              );

              return (
                <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900 font-medium'}`}>
                      {lesson.title}
                    </p>
                  </div>
                  {isRecommended && (
                    <Badge variant="outline" className="text-xs bg-blue-50">
                      Next
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestones */}
        <div>
          <p className="text-sm font-semibold text-slate-900 mb-3">Milestones</p>
          <div className="space-y-2">
            {[25, 50, 75, 100].map((milestone) => (
              <div key={milestone} className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      progressPercentage >= milestone ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                    style={{ width: `${Math.min(progressPercentage, milestone)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600 w-8">{milestone}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}