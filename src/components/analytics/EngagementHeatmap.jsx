import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";

export default function EngagementHeatmap({ courseId }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEngagementData();
  }, [courseId]);

  const loadEngagementData = async () => {
    try {
      const course = await base44.entities.Course.get(courseId);
      const enrollments = await base44.entities.Enrollment.filter({ course_id: courseId });
      
      const lessonEngagement = course.lessons?.map((lesson, idx) => {
        const lessonsViews = enrollments.filter(e => 
          e.progress?.some(p => p.lesson_order === idx && p.completed)
        ).length;
        const avgTimeSpent = enrollments.reduce((sum, e) => {
          const progress = e.progress?.find(p => p.lesson_order === idx);
          return sum + (progress?.time_spent_minutes || 0);
        }, 0) / (enrollments.length || 1);

        return {
          order: idx + 1,
          title: lesson.title,
          completion_rate: (lessonsViews / enrollments.length) * 100,
          avg_time: avgTimeSpent,
          quiz_score: enrollments.reduce((sum, e) => {
            const progress = e.progress?.find(p => p.lesson_order === idx);
            return sum + (progress?.quiz_score || 0);
          }, 0) / enrollments.length
        };
      }) || [];

      setData(lessonEngagement);
    } catch (error) {
      console.error("Error loading engagement data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader2 className="w-8 h-8 animate-spin" />;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Lesson Engagement Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data?.map((lesson) => (
            <div key={lesson.order} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{lesson.order}. {lesson.title}</span>
                <span className="text-slate-600">{lesson.completion_rate.toFixed(0)}% complete</span>
              </div>
              
              <div className="h-8 bg-slate-100 rounded-lg overflow-hidden flex">
                {/* Completion bar */}
                <div
                  style={{ width: `${lesson.completion_rate}%` }}
                  className="bg-gradient-to-r from-green-400 to-green-600 h-full flex items-center justify-center text-xs text-white font-semibold"
                >
                  {lesson.completion_rate > 10 && `${lesson.completion_rate.toFixed(0)}%`}
                </div>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>Avg time: {lesson.avg_time.toFixed(0)}m</span>
                <span>Quiz avg: {lesson.quiz_score.toFixed(1)}/100</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}