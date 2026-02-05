import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PlusCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Dashboard Components
import DashboardStats from "../components/dashboard/DashboardStats";
import RecentCourses from "../components/dashboard/RecentCourses";
import QuickActions from "../components/dashboard/QuickActions";
import EnrolledCourses from "../components/dashboard/EnrolledCourses";
import CourseRecommendations from "../components/dashboard/CourseRecommendations";
import PersonalizedRecommendations from "@/components/recommendations/PersonalizedRecommendations";
import PersonalizedCourseRecommendations from "@/components/recommendations/PersonalizedCourseRecommendations";
import GamificationDashboard from "@/components/gamification/GamificationDashboard";

function LoggedInDashboard({ user }) {
  const [stats, setStats] = useState({
    totalCourses: 0,
    avgRating: 0,
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!user?.email) {
        console.warn("User email not available, skipping dashboard data load.");
        setIsLoading(false);
        return;
      }
      
      // Load created courses
      const courses = await base44.entities.Course.filter({ created_by: user.email }, '-created_date', 10);
      setRecentCourses(courses);

      const coursesWithRatings = courses.filter(c => (c.rating || 0) > 0);
      const avgRating = coursesWithRatings.length > 0
        ? coursesWithRatings.reduce((sum, c) => sum + (c.rating || 0), 0) / coursesWithRatings.length
        : 0;

      setStats({
        totalCourses: courses.length,
        avgRating: avgRating,
      });

      // Load enrollments
      const userEnrollments = await base44.entities.Enrollment.filter({ student_email: user.email });
      setEnrollments(userEnrollments);

      // Load enrolled courses
      if (userEnrollments.length > 0) {
        const courseIds = userEnrollments.map(e => e.course_id);
        const allCourses = await base44.entities.Course.list(); // Fetch all courses to find the ones the user is enrolled in
        const enrolled = allCourses.filter(c => courseIds.includes(c.id));
        setEnrolledCourses(enrolled);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  }, [user?.email]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex flex-col space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800 mb-1">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Creator'}! 👋
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              Ready to create something amazing today?
            </p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <Link to={createPageUrl("CourseCreator")} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-105 py-2.5 text-sm">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create New Course
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <DashboardStats stats={stats} isLoading={isLoading} />
      
      <div className="mb-6 space-y-6">
        <GamificationDashboard />
        <PersonalizedCourseRecommendations context="dashboard" />
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <EnrolledCourses enrollments={enrollments} courses={enrolledCourses} />
          <RecentCourses courses={recentCourses} isLoading={isLoading} />
        </div>
        <div className="space-y-6">
          <CourseRecommendations userEmail={user.email} />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData); // Internal use - no subscription check
      } catch (error) {
        console.log('[Dashboard] User not authenticated');
        base44.auth.redirectToLogin();
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // If no user (redirect in progress or failed auth), show loading
  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // User has valid subscription - show dashboard
  return <LoggedInDashboard user={user} />;
}