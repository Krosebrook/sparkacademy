/**
 * Enhanced Instructor Dashboard
 * Analytics, collaboration tools, and AI content assistant
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, Sparkles, BookOpen } from 'lucide-react';
import StudentProgressAnalytics from '@/components/instructor/StudentProgressAnalytics';
import ContentInsightsPanel from '@/components/instructor/ContentInsightsPanel';
import AIContentAssistant from '@/components/instructor/AIContentAssistant';

export default function EnhancedInstructorDashboard() {
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: courses } = useQuery({
    queryKey: ['instructorCourses'],
    queryFn: async () => {
      const all = await base44.entities.Course.list();
      return all.filter(c => c.created_by === user?.email);
    },
    enabled: !!user?.email
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-600 mt-1">Advanced analytics, student engagement tools, and AI content creation</p>
        </div>

        {/* Course Selection */}
        {courses?.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Select Course</label>
              <select
                value={selectedCourse || ''}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Choose a course...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </CardContent>
          </Card>
        )}

        {selectedCourse ? (
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Student Analytics
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Content Insights
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Content Tool
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <StudentProgressAnalytics courseId={selectedCourse} />
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <ContentInsightsPanel courseId={selectedCourse} />
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              <AIContentAssistant />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="bg-white">
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Select a course to view analytics and tools</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}