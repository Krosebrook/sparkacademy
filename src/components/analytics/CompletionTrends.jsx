import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

export default function CompletionTrends({ courseId }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrendData();
  }, [courseId]);

  const loadTrendData = async () => {
    try {
      const enrollments = await base44.entities.Enrollment.filter({ course_id: courseId });

      // Group by enrollment date
      const trendData = [];
      const days = {};

      enrollments.forEach(enrollment => {
        const date = new Date(enrollment.enrollment_date).toLocaleDateString();
        if (!days[date]) {
          days[date] = { total: 0, completed: 0 };
        }
        days[date].total++;
        if (enrollment.completion_percentage === 100) {
          days[date].completed++;
        }
      });

      const chartData = Object.entries(days).map(([date, stats]) => ({
        date,
        completionRate: (stats.completed / stats.total) * 100,
        enrollments: stats.total,
        completions: stats.completed
      }));

      setData(chartData.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (error) {
      console.error("Error loading trend data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader2 className="w-8 h-8 animate-spin" />;
  if (!data?.length) return <p className="text-slate-600">No data available</p>;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Completion Rate Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="completionRate" 
              stroke="#10b981" 
              name="Completion Rate (%)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}