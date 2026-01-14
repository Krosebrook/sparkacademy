import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function CompletionAnalysis({ courseId }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompletionData();
  }, [courseId]);

  const loadCompletionData = async () => {
    try {
      const course = await base44.entities.Course.list({ id: courseId });
      if (course.length === 0) return;

      const course_data = course[0];
      const enrollments = await base44.entities.Enrollment.filter({
        course_id: courseId
      });

      // Calculate completion rate per lesson
      const lessonStats = {};
      course_data.lessons?.forEach(lesson => {
        lessonStats[lesson.order] = {
          title: lesson.title,
          started: 0,
          completed: 0
        };
      });

      enrollments.forEach(enrollment => {
        enrollment.lessons_completed?.forEach(lessonOrder => {
          if (lessonStats[lessonOrder]) lessonStats[lessonOrder].completed++;
        });
        enrollment.lessons_started?.forEach(lessonOrder => {
          if (lessonStats[lessonOrder]) lessonStats[lessonOrder].started++;
        });
      });

      const chartData = Object.values(lessonStats).map(stat => ({
        lesson: stat.title,
        started: stat.started,
        completed: stat.completed,
        dropRate: stat.started > 0 ? ((stat.started - stat.completed) / stat.started * 100).toFixed(1) : 0
      }));

      setData({
        totalEnrollments: enrollments.length,
        completionRate: enrollments.filter(e => e.status === 'completed').length / enrollments.length * 100,
        chartData
      });
    } catch (error) {
      console.error("Error loading completion data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin" />;
  if (!data) return <div className="text-slate-600">No data available</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.totalEnrollments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Course Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.completionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Lesson Completion Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lesson" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="started" fill="#3b82f6" name="Started" />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}