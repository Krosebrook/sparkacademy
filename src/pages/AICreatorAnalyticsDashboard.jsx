// Refactored: Extracted data fetching to custom hooks for better reusability
// Extracted metric cards to reusable component for consistency
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, TrendingUp, Users, Target, BarChart3, Sparkles } from "lucide-react";
import { useCreatorCourses } from "@/components/analytics/hooks/useCreatorCourses";
import { useCourseAnalytics } from "@/components/analytics/hooks/useCourseAnalytics";
import MetricCard from "@/components/analytics/MetricCard";
import EngagementInsights from "@/components/analytics/EngagementInsights";
import ModuleDifficultyAnalyzer from "@/components/analytics/ModuleDifficultyAnalyzer";
import FeedbackSummarizer from "@/components/analytics/FeedbackSummarizer";
import PredictiveSuccessMetrics from "@/components/analytics/PredictiveSuccessMetrics";

export default function AICreatorAnalyticsDashboard() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Custom hooks for cleaner data management
  const { user, courses, isLoading: coursesLoading } = useCreatorCourses();
  const { enrollments, feedback } = useCourseAnalytics(selectedCourse);

  // Early return pattern for loading state
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

  // Memoized course lookup
  const course = courses.find(c => c.id === selectedCourse);
  
  // Calculate metrics once for reuse
  const metrics = selectedCourse ? {
    totalStudents: enrollments.length,
    avgCompletion: enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / enrollments.length)
      : 0,
    courseRating: course?.rating?.toFixed(1) || 'N/A',
    feedbackCount: feedback.length
  } : null;

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
            {/* Refactored: Reusable metric cards for consistency */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                icon={Users}
                title="Total Students"
                value={metrics.totalStudents}
                gradient="from-blue-900/20 to-blue-800/10"
                iconColor="text-blue-300"
              />
              <MetricCard
                icon={Target}
                title="Avg Completion"
                value={`${metrics.avgCompletion}%`}
                gradient="from-green-900/20 to-green-800/10"
                iconColor="text-green-300"
              />
              <MetricCard
                icon={TrendingUp}
                title="Course Rating"
                value={metrics.courseRating}
                gradient="from-purple-900/20 to-purple-800/10"
                iconColor="text-purple-300"
              />
              <MetricCard
                icon={BarChart3}
                title="Feedback Count"
                value={metrics.feedbackCount}
                gradient="from-orange-900/20 to-orange-800/10"
                iconColor="text-orange-300"
              />
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