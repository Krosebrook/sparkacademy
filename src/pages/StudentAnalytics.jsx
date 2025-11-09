import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { 
  AlertCircle, 
  TrendingDown, 
  Clock, 
  Users, 
  Target,
  CheckCircle,
  Loader2,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StudentAnalytics() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Get all courses created by this user
      const userCourses = await base44.entities.Course.filter({ 
        created_by: userData.email 
      });
      setCourses(userCourses);

      // Get all enrollments for these courses
      const courseIds = userCourses.map(c => c.id);
      const allEnrollments = await base44.entities.Enrollment.list();
      const relevantEnrollments = allEnrollments.filter(e => 
        courseIds.includes(e.course_id)
      );
      setEnrollments(relevantEnrollments);

      // Identify at-risk students
      const atRisk = identifyAtRiskStudents(relevantEnrollments, userCourses);
      setAtRiskStudents(atRisk);

    } catch (error) {
      console.error('Error loading analytics:', error);
    }
    setIsLoading(false);
  };

  const identifyAtRiskStudents = (enrollments, courses) => {
    const now = new Date();
    const atRisk = [];

    enrollments.forEach(enrollment => {
      const course = courses.find(c => c.id === enrollment.course_id);
      if (!course) return;

      const lastActivity = enrollment.last_activity_date 
        ? new Date(enrollment.last_activity_date) 
        : new Date(enrollment.enrollment_date);
      
      const daysSinceActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
      const completionRate = enrollment.completion_percentage || 0;
      
      const riskFactors = [];
      let riskScore = 0;

      // Risk Factor 1: Inactivity
      if (daysSinceActivity > 7) {
        riskFactors.push(`No activity for ${daysSinceActivity} days`);
        riskScore += 3;
      }

      // Risk Factor 2: Low completion rate
      if (completionRate < 25 && daysSinceActivity > 3) {
        riskFactors.push(`Low progress: ${completionRate}%`);
        riskScore += 2;
      }

      // Risk Factor 3: Failed quizzes
      const failedQuizzes = enrollment.progress?.filter(p => 
        p.quiz_score !== undefined && !p.quiz_passed
      ).length || 0;
      
      if (failedQuizzes > 0) {
        riskFactors.push(`${failedQuizzes} failed quiz${failedQuizzes > 1 ? 'zes' : ''}`);
        riskScore += failedQuizzes;
      }

      // Risk Factor 4: Stuck on same lesson
      const inProgressLessons = enrollment.progress?.filter(p => 
        !p.completed && p.lesson_order !== enrollment.progress[0]?.lesson_order
      ).length || 0;

      if (completionRate > 0 && daysSinceActivity > 5 && inProgressLessons === 0) {
        riskFactors.push('Stuck on current lesson');
        riskScore += 2;
      }

      if (riskScore >= 3) {
        atRisk.push({
          ...enrollment,
          courseName: course.title,
          riskFactors,
          riskScore,
          riskLevel: riskScore >= 5 ? 'high' : riskScore >= 3 ? 'medium' : 'low',
          daysSinceActivity
        });
      }
    });

    return atRisk.sort((a, b) => b.riskScore - a.riskScore);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const totalStudents = enrollments.length;
  const activeStudents = enrollments.filter(e => {
    const lastActivity = new Date(e.last_activity_date || e.enrollment_date);
    const daysSince = Math.floor((new Date() - lastActivity) / (1000 * 60 * 60 * 24));
    return daysSince <= 7;
  }).length;

  const avgCompletion = totalStudents > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / totalStudents)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Student Analytics</h1>
          <p className="text-slate-600">Monitor student progress and identify those who need help</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-slate-800">{totalStudents}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active (7 days)</p>
                  <p className="text-3xl font-bold text-emerald-600">{activeStudents}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Avg Completion</p>
                  <p className="text-3xl font-bold text-purple-600">{avgCompletion}%</p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">At Risk</p>
                  <p className="text-3xl font-bold text-red-600">{atRiskStudents.length}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* At-Risk Students */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Students Who Need Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {atRiskStudents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                <p className="text-slate-600">Great! All students are on track.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {atRiskStudents.map((student, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-800">{student.student_email}</h3>
                          <Badge className={
                            student.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                            student.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-yellow-100 text-yellow-700'
                          }>
                            {student.riskLevel.toUpperCase()} RISK
                          </Badge>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm text-slate-600 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            {student.courseName}
                          </p>
                          <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" />
                            Last active: {student.daysSinceActivity} days ago
                          </p>
                        </div>

                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                            <span>Progress</span>
                            <span>{student.completion_percentage || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                              style={{ width: `${student.completion_percentage || 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-700">Risk Factors:</p>
                          {student.riskFactors.map((factor, i) => (
                            <p key={i} className="text-xs text-slate-600 flex items-start gap-1">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>{factor}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={`mailto:${student.student_email}`}>
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Email
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={createPageUrl(`CourseViewer?id=${student.course_id}`)}>
                            <BookOpen className="w-3 h-3 mr-1" />
                            View Course
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course-by-Course Breakdown */}
        <Card className="border-0 shadow-lg mt-6">
          <CardHeader>
            <CardTitle>Course Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map(course => {
                const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
                const courseAtRisk = atRiskStudents.filter(s => s.course_id === course.id);
                const avgProgress = courseEnrollments.length > 0
                  ? Math.round(courseEnrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / courseEnrollments.length)
                  : 0;

                return (
                  <div key={course.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-800">{course.title}</h3>
                      <Link to={createPageUrl(`CourseEditor?id=${course.id}`)}>
                        <Button size="sm" variant="outline">Manage</Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Students</p>
                        <p className="text-lg font-semibold text-slate-800">{courseEnrollments.length}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Avg Progress</p>
                        <p className="text-lg font-semibold text-purple-600">{avgProgress}%</p>
                      </div>
                      <div>
                        <p className="text-slate-600">At Risk</p>
                        <p className="text-lg font-semibold text-red-600">{courseAtRisk.length}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}