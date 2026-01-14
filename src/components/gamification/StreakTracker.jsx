import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Flame } from "lucide-react";

export default function StreakTracker({ studentEmail, courseId }) {
  const [streak, setStreak] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStreak();
  }, [studentEmail, courseId]);

  const loadStreak = async () => {
    try {
      const streaks = await base44.entities.CourseStreak.filter({
        student_email: studentEmail,
        course_id: courseId
      });
      if (streaks.length > 0) {
        setStreak(streaks[0]);
      }
    } catch (error) {
      console.error("Error loading streak:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin" />;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Flame className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600">Current Streak</p>
            <p className="text-2xl font-bold text-slate-900">
              {streak?.current_streak_days || 0} days
            </p>
            {streak?.longest_streak_days > 0 && (
              <p className="text-xs text-slate-500">
                Best: {streak.longest_streak_days} days
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}