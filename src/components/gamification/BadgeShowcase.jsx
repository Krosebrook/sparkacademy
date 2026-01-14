import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Award } from "lucide-react";

export default function BadgeShowcase({ studentEmail }) {
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, [studentEmail]);

  const loadBadges = async () => {
    try {
      const userBadges = await base44.entities.UserBadge.filter({
        user_email: studentEmail
      }, "-earned_date", 12);
      setBadges(userBadges);
    } catch (error) {
      console.error("Error loading badges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader2 className="w-6 h-6 animate-spin" />;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-600" />
          Your Badges ({badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <p className="text-sm text-slate-600 text-center py-6">
            Complete courses and achieve milestones to earn badges
          </p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-1 text-center"
                title={badge.badge_name}
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-xl">
                  {badge.badge_icon}
                </div>
                <p className="text-xs font-semibold text-slate-900 line-clamp-2">
                  {badge.badge_name}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}