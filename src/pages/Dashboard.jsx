import React, { useState, useEffect, useCallback } from "react";
import { Course } from "@/entities/Course";
import { Enrollment } from "@/entities/Enrollment";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PlusCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Dashboard Components
import DashboardStats from "../components/dashboard/DashboardStats";
import RecentCourses from "../components/dashboard/RecentCourses";
import QuickActions from "../components/dashboard/QuickActions";

function LoggedInDashboard({ user }) {
  const [stats, setStats] = useState({
    totalCourses: 0,
    avgRating: 0,
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!user?.email) {
        console.warn("User email not available, skipping dashboard data load.");
        setIsLoading(false);
        return;
      }
      const courses = await Course.filter({ created_by: user.email }, '-created_date', 10);
      setRecentCourses(courses);

      const coursesWithRatings = courses.filter(c => (c.rating || 0) > 0);
      const avgRating = coursesWithRatings.length > 0
        ? coursesWithRatings.reduce((sum, c) => sum + (c.rating || 0), 0) / coursesWithRatings.length
        : 0;

      setStats({
        totalCourses: courses.length,
        avgRating: avgRating,
      });
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
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <RecentCourses courses={recentCourses} isLoading={isLoading} />
        </div>
        <div className="order-1 lg:order-2">
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
        
        // CRITICAL: Check for valid subscription
        const subscription = userData?.subscription;
        const hasValidSubscription = subscription && 
                                     subscription.status && 
                                     (subscription.status === 'active' || subscription.status === 'trialing');
        
        console.log('[Dashboard] Access check:', {
          email: userData?.email,
          hasSubscription: !!subscription,
          subscriptionStatus: subscription?.status || 'NO_SUBSCRIPTION',
          hasValidSubscription,
          fullSubscriptionObject: subscription
        });
        
        // If user exists but NO valid subscription, redirect immediately
        if (!hasValidSubscription) {
          console.log('[Dashboard] ❌ ACCESS DENIED - No valid subscription, redirecting...');
          window.location.href = createPageUrl("LandingPage");
          return; // Don't set user or continue loading
        }
        
        // Only set user if they have valid subscription
        console.log('[Dashboard] ✅ ACCESS GRANTED - Valid subscription found');
        setUser(userData);
        
      } catch (error) {
        console.log('[Dashboard] User not authenticated, redirecting to landing...');
        window.location.href = createPageUrl("LandingPage");
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