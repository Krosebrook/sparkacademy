import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Trash2, UserPlus } from "lucide-react";

export default function TeamManagement({ organization }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const queryClient = useQueryClient();

  const { data: teams = [] } = useQuery({
    queryKey: ['teams', organization.id],
    queryFn: () => base44.entities.Team.filter({ organization_id: organization.id })
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['memberships', selectedTeam],
    queryFn: () => base44.entities.TeamMembership.filter({ team_id: selectedTeam }),
    enabled: !!selectedTeam
  });

  const createTeamMutation = useMutation({
    mutationFn: (teamData) => base44.entities.Team.create(teamData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setShowCreateDialog(false);
    }
  });

  const addMemberMutation = useMutation({
    mutationFn: (memberData) => base44.entities.TeamMembership.create(memberData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memberships'] })
  });

  const handleCreateTeam = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createTeamMutation.mutate({
      organization_id: organization.id,
      name: formData.get('name'),
      description: formData.get('description'),
      team_lead_emails: [],
      assigned_courses: [],
      is_active: true
    });
  };

  const handleAddMember = () => {
    const email = prompt("Enter user email:");
    if (email && selectedTeam) {
      addMemberMutation.mutate({
        team_id: selectedTeam,
        user_email: email,
        role: 'member',
        joined_date: new Date().toISOString(),
        status: 'active'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-glow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Teams & Cohorts</CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a0a2e] border-cyan-500/30">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Team Name</label>
                  <Input name="name" required className="bg-[#0f0618]" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Description</label>
                  <Input name="description" className="bg-[#0f0618]" />
                </div>
                <Button type="submit" className="btn-primary w-full">
                  Create Team
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {teams.map(team => (
              <Card
                key={team.id}
                className={`cursor-pointer transition-all ${
                  selectedTeam === team.id
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'hover:border-cyan-500/50'
                }`}
                onClick={() => setSelectedTeam(team.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{team.name}</h3>
                    <Badge>{team.is_active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{team.description || 'No description'}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {memberships.filter(m => m.team_id === team.id).length} members
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedTeam && (
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Team Members</CardTitle>
            <Button onClick={handleAddMember} size="sm" className="btn-primary">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {memberships.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-[#0f0618] rounded-lg">
                  <div>
                    <div className="text-white font-medium">{member.user_email}</div>
                    <div className="text-xs text-gray-400">
                      {member.role} • {member.status}
                    </div>
                  </div>
                  <Badge>{member.role}</Badge>
                </div>
              ))}
              {memberships.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No members yet. Add members to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}