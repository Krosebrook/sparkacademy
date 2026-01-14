import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Users, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CreatorPortfolio({ creatorEmail }) {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, [creatorEmail]);

  const loadCourses = async () => {
    try {
      const data = await base44.entities.Course.filter({ created_by: creatorEmail }, "-updated_date");
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (courses.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-slate-50">
        <CardContent className="p-8 text-center">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">No courses created yet</p>
          <Link to={createPageUrl("CourseCreator")}>
            <Button>Create Your First Course</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Your Courses ({courses.length})</h3>
      
      <div className="grid gap-4">
        {courses.map((course) => (
          <Card key={course.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {course.thumbnail_url && (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{course.title}</h4>
                      <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
                    </div>
                    {course.is_published && (
                      <Badge className="bg-green-100 text-green-800 flex-shrink-0">Published</Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm mt-3">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Users className="w-4 h-4" />
                      <span>{course.total_enrollments || 0} enrollments</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span>{course.rating ? course.rating.toFixed(1) : "0"}/5</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.lessons?.length || 0} lessons</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Link to={createPageUrl("CourseOverview") + `?id=${course.id}`}>
                      <Button variant="outline" size="sm">View Overview</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}