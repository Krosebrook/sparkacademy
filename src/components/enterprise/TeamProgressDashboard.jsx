import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Target, TrendingUp, Award } from "lucide-react";

export default function TeamProgressDashboard({ organizationId, teamId, teams, memberships }) {
  const { data: enrollments = [] } = useQuery({
    queryKey: ['org-enrollments', organizationId],
    queryFn: async () => {
      if (!memberships.length) return [];
      const userEmails = memberships.map(m => m.user_email);
      const allEnrollments = await base44.entities.Enrollment.list();
      return allEnrollments.filter(e => userEmails.includes(e.student_email));
    },
    enabled: memberships.length > 0
  });

  const calculateTeamMetrics = () => {
    if (!memberships.length) return null;

    const activeMembers = memberships.filter(m => m.status === 'active').length;
    const totalEnrollments = enrollments.length;
    const avgCompletion = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / enrollments.length
      : 0;
    const completedCourses = enrollments.filter(e => e.completion_percentage === 100).length;

    return {
      activeMembers,
      totalEnrollments,
      avgCompletion: Math.round(avgCompletion),
      completedCourses
    };
  };

  const metrics = calculateTeamMetrics();

  if (!metrics) {
    return (
      <Card className="card-glow">
        <CardContent className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Select a team to view progress analytics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-300 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{metrics.activeMembers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{metrics.totalEnrollments}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Avg Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{metrics.avgCompletion}%</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-300 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{metrics.completedCourses}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Team Progress Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teams.map(team => {
              const teamMemberships = memberships.filter(m => m.team_id === team.id);
              const teamEnrollments = enrollments.filter(e =>
                teamMemberships.some(m => m.user_email === e.student_email)
              );
              const teamAvgCompletion = teamEnrollments.length > 0
                ? Math.round(teamEnrollments.reduce((sum, e) => sum + (e.completion_percentage || 0), 0) / teamEnrollments.length)
                : 0;

              return (
                <div key={team.id} className="p-4 bg-[#0f0618]/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{team.name}</h3>
                      <p className="text-sm text-gray-400">{teamMemberships.length} members</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cyan-400">{teamAvgCompletion}%</div>
                      <div className="text-xs text-gray-400">avg completion</div>
                    </div>
                  </div>
                  <Progress value={teamAvgCompletion} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}