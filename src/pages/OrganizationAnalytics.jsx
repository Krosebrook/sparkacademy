import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Users, TrendingUp, Target } from "lucide-react";
import TeamProgressDashboard from "@/components/enterprise/TeamProgressDashboard";
import SkillDevelopmentTracker from "@/components/enterprise/SkillDevelopmentTracker";

export default function OrganizationAnalytics() {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list()
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams', selectedOrg],
    queryFn: () => base44.entities.Team.filter({ organization_id: selectedOrg }),
    enabled: !!selectedOrg
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['memberships', selectedTeam],
    queryFn: () => base44.entities.TeamMembership.filter({ team_id: selectedTeam }),
    enabled: !!selectedTeam
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0618] via-[#1a0a2e] to-[#0f0618] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 gradient-text flex items-center gap-3">
            <BarChart3 className="w-10 h-10" />
            Organization Analytics
          </h1>
          <p className="text-gray-400">Track team progress and skill development across your organization</p>
        </div>

        {/* Selectors */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Organization</label>
            <Select value={selectedOrg || ''} onValueChange={setSelectedOrg}>
              <SelectTrigger className="bg-[#1a0a2e] border-cyan-500/30">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map(org => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Team (optional)</label>
            <Select value={selectedTeam || ''} onValueChange={setSelectedTeam} disabled={!selectedOrg}>
              <SelectTrigger className="bg-[#1a0a2e] border-cyan-500/30">
                <SelectValue placeholder="All teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedOrg && (
          <>
            <TeamProgressDashboard
              organizationId={selectedOrg}
              teamId={selectedTeam === 'all' ? null : selectedTeam}
              teams={teams}
              memberships={memberships}
            />
            <SkillDevelopmentTracker
              organizationId={selectedOrg}
              teamId={selectedTeam === 'all' ? null : selectedTeam}
            />
          </>
        )}
      </div>
    </div>
  );
}