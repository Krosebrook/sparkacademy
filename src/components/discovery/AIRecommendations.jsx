import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Star } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function AIRecommendations({ userEmail }) {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, [userEmail]);

  const generateRecommendations = async () => {
    try {
      const enrollments = await base44.entities.Enrollment.filter({
        student_email: userEmail
      });
      const enrolledCourseIds = enrollments.map(e => e.course_id);

      const allCourses = await base44.entities.Course.filter({ is_published: true });
      const availableCourses = allCourses.filter(c => !enrolledCourseIds.includes(c.id));

      if (availableCourses.length === 0) {
        setRecommendations([]);
        setIsLoading(false);
        return;
      }

      const prompt = `Based on student's enrollment history, recommend relevant courses.
      
Enrolled courses: ${enrollments.slice(0, 5).map(e => e.course_id).join(", ")}
Available courses: ${availableCourses.slice(0, 10).map(c => `${c.id}: ${c.title} (${c.category})`).join("; ")}

Recommend top 5 courses with match percentages (0-100).`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  course_id: { type: "string" },
                  reason: { type: "string" },
                  match_score: { type: "number" }
                }
              }
            }
          }
        }
      });

      const recommendedCourses = result.recommendations
        .map(rec => ({
          ...rec,
          course: availableCourses.find(c => c.id === rec.course_id)
        }))
        .filter(r => r.course);

      setRecommendations(recommendedCourses);
    } catch (error) {
      console.error("Error generating recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-slate-600">Finding courses for you...</p>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">No recommendations available yet. Complete more courses to get personalized suggestions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec, idx) => (
        <Card key={idx} className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{rec.course?.title}</h3>
                  <Badge className="bg-blue-100 text-blue-800">
                    {rec.match_score}% match
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{rec.reason}</p>
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="outline">{rec.course?.category}</Badge>
                  {rec.course?.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold">{rec.course.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate(createPageUrl("CourseViewer") + `?id=${rec.course?.id}`)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              View Course
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}