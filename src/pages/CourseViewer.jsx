import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import LessonSidebar from '../components/course-viewer/LessonSidebar';
import LessonContent from '../components/course-viewer/LessonContent';
import CourseCompletion from '../components/course-viewer/CourseCompletion';

export default function CourseViewer() {
  const location = useLocation();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedCourses, setRecommendedCourses] = useState([]);

  const courseId = new URLSearchParams(location.search).get('id');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      const courseData = await base44.entities.Course.get(courseId);

      if (!courseData) {
        console.error("Course not found:", courseId);
        navigate(createPageUrl("MyCourses"));
        return;
      }

      setCourse(courseData);

      // Check if enrollment exists
      const enrollments = await base44.entities.Enrollment.filter({ 
        student_email: user.email, 
        course_id: courseId 
      });
      
      let enrollmentData;
      
      if (enrollments.length === 0) {
        // Auto-create enrollment for free access
        enrollmentData = await base44.entities.Enrollment.create({
          course_id: courseId,
          student_email: user.email,
          progress: [],
          completion_percentage: 0,
          enrollment_date: new Date().toISOString()
        });
        console.log('✓ Created enrollment for user');
      } else {
        enrollmentData = enrollments[0];
      }
      
      setEnrollment(enrollmentData);

      // Set active lesson (first incomplete or first lesson)
      const lastCompletedLessonOrder = enrollmentData.progress
        .filter(p => p.completed)
        .reduce((max, p) => Math.max(max, p.lesson_order), 0);
      
      const nextLessonOrder = lastCompletedLessonOrder + 1;
      const firstLesson = courseData.lessons.find(l => l.order === nextLessonOrder) || courseData.lessons[0];
      setActiveLesson(firstLesson);

    } catch (error) {
      console.error("Error loading course viewer:", error);
      navigate(createPageUrl("MyCourses"));
    } finally {
      setIsLoading(false);
    }
  }, [courseId, navigate]);

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId, loadData]);

  const handleLessonSelect = (lesson) => {
    setActiveLesson(lesson);
  };

  const handleQuizComplete = async (score, passed) => {
    const lessonOrder = activeLesson.order;
    let newProgress = [...(enrollment.progress || [])];
    const progressIndex = newProgress.findIndex(p => p.lesson_order === lessonOrder);

    const progressUpdate = {
      lesson_order: lessonOrder,
      completed: passed,
      completed_date: new Date().toISOString(),
      quiz_score: score,
      quiz_passed: passed,
    };

    if (progressIndex > -1) {
      newProgress[progressIndex] = progressUpdate;
    } else {
      newProgress.push(progressUpdate);
    }

    const completedLessons = newProgress.filter(p => p.completed).length;
    const totalLessons = course.lessons.length;
    const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    const updatedEnrollment = await base44.entities.Enrollment.update(enrollment.id, {
      progress: newProgress,
      completion_percentage: completionPercentage,
    });
    setEnrollment(updatedEnrollment);
    
    if (passed) {
      const nextLesson = course.lessons.find(l => l.order === lessonOrder + 1);
      if (nextLesson) {
        setActiveLesson(nextLesson);
      } else {
        // All lessons completed, fetch recommendations
        const allCourses = await base44.entities.Course.filter({ is_published: true });
        const recommendations = allCourses
          .filter(c => c.id !== course.id && c.category === course.category)
          .slice(0, 3);
        setRecommendedCourses(recommendations);
      }
    }
  };
  
  const isCourseCompleted = enrollment?.completion_percentage === 100;

  const isLessonLocked = (lesson) => {
    if (lesson.order === 1) return false;
    const prevLesson = course.lessons.find(l => l.order === lesson.order - 1);
    if (!prevLesson) return false;
    if (prevLesson.quiz) {
      const prevLessonProgress = enrollment.progress.find(p => p.lesson_order === prevLesson.order);
      return !prevLessonProgress?.quiz_passed;
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <div className="w-1/4 h-full p-4 border-r"><Skeleton className="h-full w-full" /></div>
        <div className="w-3/4 h-full p-8"><Skeleton className="h-full w-full" /></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center p-8">Course not found or an error occurred.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <div className="flex h-[calc(100vh-4rem)] bg-white">
        <div className="w-full md:w-1/4 h-full overflow-y-auto border-r bg-slate-50">
          <LessonSidebar
            course={course}
            enrollment={enrollment}
            activeLesson={activeLesson}
            onLessonClick={handleLessonSelect}
            isLessonLocked={isLessonLocked}
          />
        </div>

        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
          {isCourseCompleted ? (
            <CourseCompletion course={course} enrollment={enrollment} recommendedCourses={recommendedCourses} />
          ) : activeLesson ? (
            <LessonContent
              lesson={activeLesson}
              onQuizComplete={handleQuizComplete}
              enrollment={enrollment}
            />
          ) : (
            <div className="text-center">
              <h2 className="text-xl font-semibold">Select a lesson to get started.</h2>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}