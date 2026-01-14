import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import { useCreatorPoints } from "./useCreatorPoints";

export default function CreatorPointsBalance({ creatorEmail }) {
  const { pointsData, isLoading } = useCreatorPoints(creatorEmail);

  if (isLoading || !pointsData) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="p-6">
          <div className="animate-pulse h-20 bg-amber-200 rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-l-amber-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Zap className="w-5 h-5 text-amber-600" />
          Creator Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-1">Available</p>
            <p className="text-3xl font-bold text-amber-600">{pointsData.available_points}</p>
            <p className="text-xs text-slate-500 mt-1">Ready to redeem</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-1">Total Earned</p>
            <p className="text-3xl font-bold text-orange-600">{pointsData.lifetime_earnings}</p>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white rounded-lg p-3">
            <p className="text-2xl font-bold text-slate-700">{pointsData.courses_count}</p>
            <p className="text-xs text-slate-500">Courses</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-2xl font-bold text-slate-700">{pointsData.total_enrollments}</p>
            <p className="text-xs text-slate-500">Enrollments</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-2xl font-bold text-slate-700">{pointsData.average_rating.toFixed(1)}</p>
            <p className="text-xs text-slate-500">Avg Rating</p>
          </div>
        </div>

        {pointsData.redeemed_points > 0 && (
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-600 font-semibold mb-1">Redeemed: {pointsData.redeemed_points} pts</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}