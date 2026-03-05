/**
 * Instructor Suite
 * Dedicated tools for course instructors:
 * - AI content creation (lesson plans, quizzes)
 * - Discussion & feedback management
 * - Student performance & at-risk identification
 * - Course material editor
 * - Analytics overview
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3, Sparkles, BookOpen, MessageSquare,
  Users, Edit3, ChevronDown, GraduationCap
} from 'lucide-react';

import InstructorAnalyticsSummary from '@/components/instructor/InstructorAnalyticsSummary';
import AIContentAssistant from '@/components/instructor/AIContentAssistant';
import DiscussionFeedbackManager from '@/components/instructor/DiscussionFeedbackManager';
import StudentProgressAnalytics from '@/components/instructor/StudentProgressAnalytics';
import CourseMaterialEditor from '@/components/instructor/CourseMaterialEditor';

export default function InstructorSuite() {
  const [selectedCourse, setSelectedCourse] = useState('');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me()
  });

  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['myCourses', user?.email],
    queryFn: () => base44.entities.Course.filter({ created_by: user.email }, '-created_date', 50),
    enabled: !!user?.email
  });

  const selectedCourseData = courses?.find(c => c.id === selectedCourse);

  const tabs = [
    { value: 'overview', label: 'Overview', icon: BarChart3 },
    { value: 'students', label: 'Students', icon: Users },
    { value: 'discussions', label: 'Discussions', icon: MessageSquare },
    { value: 'materials', label: 'Materials', icon: Edit3 },
    { value: 'ai-tools', label: 'AI Tools', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Instructor Suite</h1>
                <p className="text-sm text-slate-500">Manage courses, students, and content</p>
              </div>
            </div>

            {/* Course Selector */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                >
                  <option value="">Select a course...</option>
                  {courses?.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {selectedCourseData && (
                <Badge className="bg-blue-100 text-blue-700 border-0">
                  {selectedCourseData.total_students || 0} students
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {!selectedCourse ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-700 mb-2">Select a course to get started</h2>
            <p className="text-slate-400 text-sm max-w-sm">
              Choose one of your courses from the dropdown above to manage students, content, discussions, and analytics.
            </p>
            {!loadingCourses && courses?.length === 0 && (
              <p className="text-sm text-slate-400 mt-4 bg-slate-100 px-4 py-2 rounded-lg">
                You haven't created any courses yet.
              </p>
            )}
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white border border-slate-200 p-1 h-auto gap-1">
              {tabs.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 px-4 py-2 text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-md"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview">
              <InstructorAnalyticsSummary courseId={selectedCourse} />
            </TabsContent>

            {/* Students */}
            <TabsContent value="students">
              <Card className="bg-white border border-slate-200">
                <CardContent className="p-6">
                  <StudentProgressAnalytics courseId={selectedCourse} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Discussions & Feedback */}
            <TabsContent value="discussions">
              <DiscussionFeedbackManager courseId={selectedCourse} />
            </TabsContent>

            {/* Materials Editor */}
            <TabsContent value="materials">
              <CourseMaterialEditor courseId={selectedCourse} />
            </TabsContent>

            {/* AI Tools */}
            <TabsContent value="ai-tools">
              <Card className="bg-white border border-slate-200">
                <CardContent className="p-6">
                  <AIContentAssistant />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}