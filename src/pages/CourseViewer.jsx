import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import LessonSidebar from '../components/course-viewer/LessonSidebar';
import LessonContent from '../components/course-viewer/LessonContent';
import CourseCompletion from '../components/course-viewer/CourseCompletion';
import AITutorWidget from '../components/course-viewer/AITutorWidget';
import { Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CourseViewer() {
  const location = useLocation();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [showAITutor, setShowAITutor] = useState(false);

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

      const enrollments = await base44.entities.Enrollment.filter({ 
        student_email: user.email, 
        course_id: courseId 
      });
      
      let enrollmentData;
      
      if (enrollments.length === 0) {
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

      const lastCompletedLessonOrder = enrollmentData.progress
        .filter(p => p.completed)
        .reduce((max, p) => Math.max(max, p.lesson_order), 0);
      
      const nextLessonOrder = lastCompletedLessonOrder + 1;
      const firstLesson = courseData.lessons.find(l => l.order === nextLessonOrder) || courseData.lessons[0];
      
      setActiveLesson(firstLesson ? firstLesson.order : null);

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
    setActiveLesson(lesson.order);
  };

  const handleQuizComplete = async (score, passed) => {
    const lessonOrder = activeLesson; 
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
        setActiveLesson(nextLesson.order);
      } else {
        setActiveLesson(null);
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Course not found</p>
      </div>
    );
  }

  const currentLessonData = course.lessons?.find(l => l.order === activeLesson);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto p-4 md:p-6 gap-6">
        <div className="w-full md:w-1/4 h-full md:h-[calc(100vh-8rem)] overflow-y-auto bg-white rounded-lg shadow-md p-4">
          <LessonSidebar 
            lessons={course.lessons || []}
            activeLesson={activeLesson}
            onLessonClick={handleLessonSelect}
            progress={enrollment?.progress || []}
            isLessonLocked={isLessonLocked}
          />
        </div>

        <main className="flex-1 h-full md:h-[calc(100vh-8rem)] overflow-y-auto bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
          {activeLesson && currentLessonData ? (
            <LessonContent 
              lesson={currentLessonData}
              onQuizComplete={handleQuizComplete}
              progress={enrollment?.progress?.find(p => p.lesson_order === activeLesson)}
            />
          ) : (
            <CourseCompletion course={course} enrollment={enrollment} />
          )}
        </main>
      </div>

      {!showAITutor && (
        <Button
          onClick={() => setShowAITutor(true)}
          className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-2xl rounded-full w-14 h-14"
          size="icon"
        >
          <Bot className="w-6 h-6" />
        </Button>
      )}

      <AITutorWidget 
        course={course}
        currentLesson={currentLessonData}
        isOpen={showAITutor}
        onClose={() => setShowAITutor(false)}
      />
    </div>
  );
}