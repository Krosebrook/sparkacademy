import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, TrendingUp, Users, Target, BarChart3, Sparkles } from "lucide-react";
import EngagementInsights from "@/components/analytics/EngagementInsights";
import ModuleDifficultyAnalyzer from "@/components/analytics/ModuleDifficultyAnalyzer";
import FeedbackSummarizer from "@/components/analytics/FeedbackSummarizer";
import PredictiveSuccessMetrics from "@/components/analytics/PredictiveSuccessMetrics";

export default function AICreatorAnalyticsDashboard() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['creator-courses'],
    queryFn: async () => {
      if (!user) return [];
      const allCourses = await base44.entities.Course.filter({ created_by: user.email });
      return allCourses;
    },
    enabled: !!user
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['course-enrollments', selectedCourse],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: selectedCourse }),
    enabled: !!selectedCourse
  });

  const { data: feedback = [] } = useQuery({
    queryKey: ['course-feedback', selectedCourse],
    queryFn: () => base44.entities.CourseFeedback.filter({ course_id: selectedCourse }),
    enabled: !!selectedCourse
  });

  if (!user || coursesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0618] via-[#1a0a2e] to-[#0f0618] p-6 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 animate-pulse text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const course = courses.find(c => c.id === selectedCourse);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0618] via-[#1a0a2e] to-[#0f0618] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 gradient-text flex items-center gap-3">
              <Brain className="w-10 h-10" />
              AI Analytics Dashboard
            </h1>
            <p className="text-gray-400">AI-powered insights for course optimization</p>
          </div>
          <div className="w-64">
            <Select value={selectedCourse || ''} onValueChange={setSelectedCourse}>
              <SelectTrigger className="bg-[#1a0a2e] border-cyan-500/30">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!selectedCourse ? (
          <Card className="card-glow">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Select a Course</h3>
              <p className="text-gray-400">Choose a course from the dropdown to view AI-powered analytics</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-300 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Total Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{enrollments.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Avg Completion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {enrollments.length > 0
                      ? Math.round(enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / enrollments.length)
                      : 0}%
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Course Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {course?.rating?.toFixed(1) || 'N/A'}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-300 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Feedback Count
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{feedback.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Tabs */}
            <Tabs defaultValue="engagement" className="space-y-6">
              <TabsList className="bg-[#1a0a2e] border border-cyan-500/20">
                <TabsTrigger value="engagement">
                  <Users className="w-4 h-4 mr-2" />
                  Engagement
                </TabsTrigger>
                <TabsTrigger value="difficulty">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Difficulty
                </TabsTrigger>
                <TabsTrigger value="feedback">
                  <Brain className="w-4 h-4 mr-2" />
                  Feedback
                </TabsTrigger>
                <TabsTrigger value="predictive">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Predictions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="engagement">
                <EngagementInsights
                  course={course}
                  enrollments={enrollments}
                />
              </TabsContent>

              <TabsContent value="difficulty">
                <ModuleDifficultyAnalyzer
                  course={course}
                  enrollments={enrollments}
                />
              </TabsContent>

              <TabsContent value="feedback">
                <FeedbackSummarizer
                  course={course}
                  feedback={feedback}
                />
              </TabsContent>

              <TabsContent value="predictive">
                <PredictiveSuccessMetrics
                  course={course}
                  enrollments={enrollments}
                  feedback={feedback}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}