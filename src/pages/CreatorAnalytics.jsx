import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Clock, Target, TrendingUp, BookOpen } from 'lucide-react';

export default function CreatorAnalytics() {
  const location = useLocation();
  const courseId = new URLSearchParams(location.search).get('id');
  
  const [course, setCourse] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgCompletionRate: 0,
    avgTimeSpent: 0,
    totalCompletions: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [courseId]);

  const loadAnalytics = async () => {
    try {
      const user = await base44.auth.me();
      const courseData = await base44.entities.Course.get(courseId);
      
      if (courseData.created_by !== user.email && user.role !== 'admin') {
        alert('Unauthorized');
        return;
      }

      setCourse(courseData);

      // Get all enrollments for this course
      const enrollments = await base44.entities.Enrollment.filter({ course_id: courseId });
      
      // Get analytics data
      const analyticsData = await base44.asServiceRole.entities.CourseAnalytics.filter({ course_id: courseId });
      setAnalytics(analyticsData);

      // Calculate stats
      const totalStudents = enrollments.length;
      const completions = enrollments.filter(e => e.completion_percentage === 100).length;
      const avgCompletion = enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / enrollments.length
        : 0;
      
      const avgTime = analyticsData.length > 0
        ? analyticsData.reduce((sum, a) => sum + (a.total_time_in_course || 0), 0) / analyticsData.length / 3600
        : 0;

      setStats({
        totalStudents,
        avgCompletionRate: Math.round(avgCompletion),
        avgTimeSpent: Math.round(avgTime * 10) / 10,
        totalCompletions: completions
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  // Prepare lesson engagement data
  const lessonEngagement = course?.lessons?.map((lesson, idx) => {
    const lessonViews = analytics.reduce((sum, a) => {
      const view = a.lesson_views?.find(lv => lv.lesson_order === lesson.order);
      return sum + (view?.view_count || 0);
    }, 0);

    return {
      name: `Lesson ${lesson.order}`,
      views: lessonViews,
      title: lesson.title.substring(0, 20) + '...'
    };
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Course Analytics</h1>
          <p className="text-slate-600">{course?.title}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Users}
            label="Total Students"
            value={stats.totalStudents}
            color="purple"
          />
          <StatCard
            icon={Target}
            label="Avg Completion"
            value={`${stats.avgCompletionRate}%`}
            color="emerald"
          />
          <StatCard
            icon={Clock}
            label="Avg Time Spent"
            value={`${stats.avgTimeSpent}h`}
            color="amber"
          />
          <StatCard
            icon={TrendingUp}
            label="Completions"
            value={stats.totalCompletions}
            color="blue"
          />
        </div>

        {/* Lesson Engagement Chart */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Lesson Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lessonEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quiz Performance */}
        {course?.lessons?.some(l => l.quiz) && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Quiz Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.lessons.filter(l => l.quiz).map(lesson => {
                  const quizData = analytics.flatMap(a => 
                    a.quiz_attempts?.filter(qa => qa.lesson_order === lesson.order) || []
                  );
                  
                  const avgScore = quizData.length > 0
                    ? quizData.reduce((sum, qa) => sum + (qa.average_score || 0), 0) / quizData.length
                    : 0;
                  
                  const totalAttempts = quizData.reduce((sum, qa) => sum + (qa.attempts || 0), 0);

                  return (
                    <div key={lesson.order} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-slate-800">{lesson.title}</p>
                        <p className="text-sm text-slate-600">Lesson {lesson.order}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">{Math.round(avgScore)}%</p>
                        <p className="text-xs text-slate-500">{totalAttempts} attempts</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    purple: 'from-purple-500 to-pink-500',
    emerald: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
    blue: 'from-blue-500 to-cyan-500'
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-4">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colors[color]} flex items-center justify-center mb-3`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-600">{label}</p>
      </CardContent>
    </Card>
  );
}