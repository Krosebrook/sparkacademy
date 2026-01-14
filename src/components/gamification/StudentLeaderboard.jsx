import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy } from "lucide-react";

export default function StudentLeaderboard({ courseId, limit = 10 }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [courseId]);

  const loadLeaderboard = async () => {
    try {
      const enrollments = await base44.entities.Enrollment.filter({ course_id: courseId });

      const scored = await Promise.all(
        enrollments.map(async (e) => {
          try {
            const user = await base44.entities.User.get(e.student_email);
            const quizScore = e.progress?.reduce((sum, p) => sum + (p.quiz_score || 0), 0) || 0;
            const completionBonus = (e.completion_percentage || 0);

            return {
              email: e.student_email,
              name: user?.full_name || "Anonymous",
              avatar: user?.profile_picture_url,
              score: quizScore + (completionBonus / 10),
              completionPercentage: e.completion_percentage || 0,
              quizAverage: e.progress?.length > 0 
                ? (quizScore / e.progress.length) 
                : 0
            };
          } catch {
            return null;
          }
        })
      );

      const validScores = scored.filter(s => s).sort((a, b) => b.score - a.score).slice(0, limit);
      setLeaderboard(validScores);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-slate-600 text-center py-6">No scores yet</p>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((student, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold text-sm">
                  {idx + 1}
                </div>
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{student.name}</p>
                  <p className="text-xs text-slate-600">
                    {student.completionPercentage.toFixed(0)}% complete
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 text-sm">
                  {student.score.toFixed(0)} pts
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}