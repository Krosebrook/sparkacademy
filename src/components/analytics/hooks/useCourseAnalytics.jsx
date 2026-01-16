// Custom hook for course analytics data fetching
// Centralizes all data queries for analytics components
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useCourseAnalytics(courseId) {
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: () => base44.entities.Enrollment.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const { data: feedback = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ['course-feedback', courseId],
    queryFn: () => base44.entities.CourseFeedback.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  return {
    enrollments,
    feedback,
    isLoading: enrollmentsLoading || feedbackLoading,
  };
}