import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

export default function CourseProgressTracker({ userEmail }) {
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollmentsProgress', userEmail],
    queryFn: () => base44.entities.Enrollment.filter({ student_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['allCoursesProgress'],
    queryFn: () => base44.entities.Course.list(),
    enabled: enrollments.length > 0
  });

  const enriched = enrollments
    .map(e => {
      const course = allCourses.find(c => c.id === e.course_id);
      return { ...e, course };
    })
    .filter(e => e.course)
    .sort((a, b) => (b.progress_percentage || 0) - (a.progress_percentage || 0));

  const completed = enriched.filter(e => (e.progress_percentage || 0) >= 100);
  const inProgress = enriched.filter(e => (e.progress_percentage || 0) > 0 && (e.progress_percentage || 0) < 100);
  const notStarted = enriched.filter(e => !(e.progress_percentage || 0));

  if (isLoading) {
    return (
      <Card className="bg-[#1a0a2e]/50 border-purple-500/20">
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-gray-800/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!enriched.length) {
    return (
      <Card className="bg-[#1a0a2e]/50 border-purple-500/20">
        <CardContent className="p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Enroll in courses to start tracking progress</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 text-center">
          <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-green-400">{completed.length}</div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-center">
          <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-blue-400">{inProgress.length}</div>
          <div className="text-xs text-gray-400">In Progress</div>
        </div>
        <div className="bg-gray-800/30 border border-gray-600/30 rounded-xl p-4 text-center">
          <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          <div className="text-2xl font-bold text-gray-400">{notStarted.length}</div>
          <div className="text-xs text-gray-400">Not Started</div>
        </div>
      </div>

      {/* Course list */}
      <Card className="bg-[#1a0a2e]/50 border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white text-sm">
            <BookOpen className="w-4 h-4 text-purple-400" />
            Course Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {enriched.slice(0, 8).map((e) => {
            const pct = Math.min(Math.round(e.progress_percentage || 0), 100);
            const isDone = pct >= 100;
            return (
              <div key={e.id} className={`p-3 rounded-lg border ${isDone ? 'bg-green-900/10 border-green-500/20' : 'bg-gray-900/20 border-gray-700/20'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium text-white line-clamp-1 flex-1">
                    {e.course?.title || 'Unknown Course'}
                  </p>
                  <Badge className={`text-xs flex-shrink-0 ${isDone ? 'bg-green-500/20 text-green-300 border-green-500/30' : pct > 0 ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                    {isDone ? '✓ Done' : pct > 0 ? `${pct}%` : 'Not started'}
                  </Badge>
                </div>
                <Progress
                  value={pct}
                  className="h-2"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">{e.course?.category || ''}</span>
                  <span className="text-xs text-gray-500">{pct}% complete</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}