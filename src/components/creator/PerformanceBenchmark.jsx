import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";

export default function PerformanceBenchmark({ courseId, category }) {
  const [benchmark, setBenchmark] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBenchmark();
  }, [courseId, category]);

  const loadBenchmark = async () => {
    try {
      const course = await base44.entities.Course.get(courseId);
      const similarCourses = await base44.entities.Course.filter({ category });

      const avgRating = similarCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / similarCourses.length;
      const avgEnrollments = similarCourses.reduce((sum, c) => sum + (c.total_enrollments || 0), 0) / similarCourses.length;
      const avgCompletion = similarCourses.reduce((sum, c) => sum + (c.total_completions || 0), 0) / similarCourses.length;

      setBenchmark({
        courseRating: course.rating || 0,
        avgRating: avgRating.toFixed(1),
        ratingComparison: ((course.rating || 0) - avgRating).toFixed(1),
        
        courseEnrollments: course.total_enrollments || 0,
        avgEnrollments: avgEnrollments.toFixed(0),
        enrollmentComparison: ((course.total_enrollments || 0) - avgEnrollments).toFixed(0),
        
        courseCompletions: course.total_completions || 0,
        avgCompletion: avgCompletion.toFixed(0),
        completionComparison: ((course.total_completions || 0) - avgCompletion).toFixed(0)
      });
    } catch (error) {
      console.error("Error loading benchmark:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin" />;
  if (!benchmark) return null;

  const MetricCard = ({ label, value, avg, comparison }) => {
    const isPositive = parseFloat(comparison) >= 0;
    return (
      <div className="p-3 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-600 mb-1">{label}</p>
        <div className="flex items-center justify-between mb-2">
          <p className="text-lg font-bold text-slate-900">{value}</p>
          <Badge className={isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(comparison)}
          </Badge>
        </div>
        <p className="text-xs text-slate-500">Avg: {avg}</p>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Performance vs Category</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        <MetricCard 
          label="Rating" 
          value={benchmark.courseRating.toFixed(1)} 
          avg={benchmark.avgRating}
          comparison={benchmark.ratingComparison}
        />
        <MetricCard 
          label="Enrollments" 
          value={benchmark.courseEnrollments} 
          avg={benchmark.avgEnrollments}
          comparison={benchmark.enrollmentComparison}
        />
        <MetricCard 
          label="Completions" 
          value={benchmark.courseCompletions} 
          avg={benchmark.avgCompletion}
          comparison={benchmark.completionComparison}
        />
      </CardContent>
    </Card>
  );
}