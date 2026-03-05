/**
 * Instructor Analytics Summary
 * Quick KPI overview for a selected course
 */

import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Star, MessageSquare, Award, Loader2 } from 'lucide-react';

export default function InstructorAnalyticsSummary({ courseId }) {
  const { data: enrollments, isLoading: loadingEnroll } = useQuery({
    queryKey: ['enrollmentsSummary', courseId],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const { data: feedback } = useQuery({
    queryKey: ['feedbackSummary', courseId],
    queryFn: () => base44.entities.CourseFeedback.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const { data: discussions } = useQuery({
    queryKey: ['discussionsSummary', courseId],
    queryFn: () => base44.entities.CourseDiscussion.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  if (loadingEnroll) return (
    <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
  );

  const total = enrollments?.length || 0;
  const completed = enrollments?.filter(e => e.completion_percentage >= 100).length || 0;
  const avgCompletion = total > 0
    ? Math.round(enrollments.reduce((s, e) => s + (e.completion_percentage || 0), 0) / total)
    : 0;
  const avgRating = feedback?.length
    ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : '—';
  const unanswered = discussions?.filter(d => !d.replies?.length).length || 0;

  const stats = [
    { label: 'Enrolled Students', value: total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Completions', value: completed, icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Avg Rating', value: avgRating, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Open Discussions', value: unanswered, icon: MessageSquare, color: unanswered > 0 ? 'text-orange-600' : 'text-slate-500', bg: unanswered > 0 ? 'bg-orange-50' : 'bg-slate-50' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-white border border-slate-200">
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white border border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Average Completion Rate
            </span>
            <span className="text-sm font-bold text-slate-800">{avgCompletion}%</span>
          </div>
          <Progress value={avgCompletion} className="h-2.5" />
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>{completed} students completed</span>
            <span>{total - completed} in progress</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}