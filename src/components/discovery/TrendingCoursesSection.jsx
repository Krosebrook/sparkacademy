import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Star, Users } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function TrendingCoursesSection() {
  const navigate = useNavigate();
  const [trendingCourses, setTrendingCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrendingCourses();
  }, []);

  const loadTrendingCourses = async () => {
    try {
      const trending = await base44.entities.TrendingCourse.filter({}, "-trending_score", 6);
      const courseIds = trending.map(t => t.course_id);

      const courses = await Promise.all(
        courseIds.map(id => base44.entities.Course.get(id).catch(() => null))
      );

      const enriched = trending
        .map((t, idx) => ({ ...t, course: courses[idx] }))
        .filter(t => t.course);

      setTrendingCourses(enriched);
    } catch (error) {
      console.error("Error loading trending courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (trendingCourses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          Trending Now
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingCourses.map((trend) => (
          <Card key={trend.id} className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden">
            {trend.course?.thumbnail_url && (
              <img 
                src={trend.course.thumbnail_url} 
                alt={trend.course.title}
                className="w-full h-40 object-cover"
              />
            )}
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-900 line-clamp-2">{trend.course?.title}</h3>
              </div>

              <p className="text-sm text-slate-600 line-clamp-2 mb-3">{trend.course?.description}</p>

              <div className="flex items-center gap-2 mb-3">
                {trend.course?.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold">{trend.course.rating.toFixed(1)}</span>
                  </div>
                )}
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {trend.trending_score}
                </Badge>
              </div>

              <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {trend.enrollment_velocity > 0 && `+${trend.enrollment_velocity.toFixed(0)} enrollments/day`}
              </div>

              <Button
                onClick={() => navigate(createPageUrl("CourseViewer") + `?id=${trend.course?.id}`)}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Explore
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}