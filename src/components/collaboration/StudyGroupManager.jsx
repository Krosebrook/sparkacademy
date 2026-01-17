/**
 * Study Group Manager
 * Create, manage, and join study groups for courses
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, MessageSquare, Calendar } from 'lucide-react';

export default function StudyGroupManager({ courseId }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topic: '',
    meeting_schedule: ''
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: groups, refetch } = useQuery({
    queryKey: ['studyGroups', courseId],
    queryFn: () => base44.entities.StudyGroup.filter({ course_id: courseId })
  });

  const createGroup = async () => {
    if (!formData.name.trim()) return;

    try {
      await base44.entities.StudyGroup.create({
        course_id: courseId,
        ...formData,
        creator_email: user.email,
        members: [{ email: user.email, name: user.full_name, role: 'admin', joined_date: new Date().toISOString() }],
        member_count: 1
      });
      setFormData({ name: '', description: '', topic: '', meeting_schedule: '' });
      setShowCreateForm(false);
      refetch();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const joinGroup = async (groupId) => {
    try {
      const group = groups.find(g => g.id === groupId);
      const updatedMembers = [...(group.members || [])];
      
      if (!updatedMembers.find(m => m.email === user.email)) {
        updatedMembers.push({
          email: user.email,
          name: user.full_name,
          role: 'member',
          joined_date: new Date().toISOString()
        });
      }

      await base44.entities.StudyGroup.update(groupId, {
        members: updatedMembers,
        member_count: updatedMembers.length
      });
      refetch();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Study Groups
        </h3>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)} 
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> New Group
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="card-glow">
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="Group name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[#1a0a2e] border-[#2d1b4e]"
            />
            <Input
              placeholder="What will you study?"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="bg-[#1a0a2e] border-[#2d1b4e]"
            />
            <Input
              placeholder="Meeting schedule (e.g., Tuesdays 6pm)"
              value={formData.meeting_schedule}
              onChange={(e) => setFormData({ ...formData, meeting_schedule: e.target.value })}
              className="bg-[#1a0a2e] border-[#2d1b4e]"
            />
            <div className="flex gap-2">
              <Button onClick={createGroup} className="btn-primary flex-1 text-sm">Create</Button>
              <Button onClick={() => setShowCreateForm(false)} variant="outline" className="flex-1 text-sm">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Groups List */}
      <div className="space-y-3">
        {groups?.map(group => {
          const isMember = group.members?.some(m => m.email === user?.email);
          return (
            <Card key={group.id} className="card-glow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{group.name}</h4>
                    <p className="text-xs text-gray-400">{group.topic}</p>
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-300 text-xs">
                    {group.member_count || 1} members
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <Calendar className="w-3 h-3" />
                  <span>{group.meeting_schedule || 'No schedule set'}</span>
                </div>

                {!isMember ? (
                  <Button 
                    onClick={() => joinGroup(group.id)}
                    className="btn-secondary w-full text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Join Group
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" /> Open Group
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}