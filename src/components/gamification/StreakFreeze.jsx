import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Snowflake, AlertCircle } from "lucide-react";

export default function StreakFreeze({ studentEmail, courseId }) {
  const [streak, setStreak] = useState(null);
  const [freezeData, setFreezeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFreezing, setIsFreezing] = useState(false);

  useEffect(() => {
    loadStreakData();
  }, [studentEmail, courseId]);

  const loadStreakData = async () => {
    try {
      const streaks = await base44.entities.CourseStreak.filter({
        student_email: studentEmail,
        course_id: courseId
      });
      if (streaks.length > 0) {
        setStreak(streaks[0]);
        // Check for existing freeze in user data
        const user = await base44.auth.me();
        const freeze = user?.streak_freezes?.[courseId];
        if (freeze) {
          setFreezeData(freeze);
        }
      }
    } catch (error) {
      console.error("Error loading streak data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyStreakFreeze = async () => {
    if (!streak || streak.current_streak_days === 0) return;
    setIsFreezing(true);

    try {
      const user = await base44.auth.me();
      const freezeExpiry = new Date();
      freezeExpiry.setDate(freezeExpiry.getDate() + 1);

      await base44.auth.updateMe({
        streak_freezes: {
          ...user.streak_freezes,
          [courseId]: {
            applied_date: new Date().toISOString(),
            expiry_date: freezeExpiry.toISOString(),
            frozen_streak: streak.current_streak_days,
            uses_remaining: (user.streak_freeze_uses || 1) - 1
          }
        }
      });

      setFreezeData({
        applied_date: new Date().toISOString(),
        expiry_date: freezeExpiry.toISOString(),
        frozen_streak: streak.current_streak_days
      });
    } catch (error) {
      console.error("Error applying freeze:", error);
    } finally {
      setIsFreezing(false);
    }
  };

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin" />;
  if (!streak || streak.current_streak_days === 0) return null;

  const daysUntilExpiry = freezeData ? 
    Math.max(0, Math.ceil((new Date(freezeData.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))) 
    : 0;

  return (
    <Card className={`border-0 shadow-lg ${freezeData ? "bg-gradient-to-br from-blue-50 to-cyan-50" : "bg-gradient-to-br from-slate-50 to-slate-100"}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Snowflake className="w-5 h-5 text-blue-600" />
          Streak Freeze
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600">
          Miss a day? Use a Streak Freeze to maintain your progress without losing your streak.
        </p>

        {freezeData ? (
          <div className="space-y-2">
            <div className="p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Freeze Active</span>
                <Badge className="bg-green-100 text-green-800">Protected</Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Your {freezeData.frozen_streak}-day streak is protected
              </p>
              {daysUntilExpiry > 0 && (
                <p className="text-xs text-slate-600 mt-1">
                  Expires in {daysUntilExpiry} day{daysUntilExpiry > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900">Your streak is at risk</p>
                <p className="text-xs text-yellow-800">Miss a day to lose your {streak.current_streak_days}-day streak</p>
              </div>
            </div>

            <Button
              onClick={applyStreakFreeze}
              disabled={isFreezing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isFreezing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Snowflake className="w-4 h-4 mr-2" />
                  Use Freeze (1 left)
                </>
              )}
            </Button>

            <p className="text-xs text-slate-600 text-center">
              Valid for 24 hours. Earn more by completing special challenges.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}