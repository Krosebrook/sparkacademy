import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Trophy, Heart, GraduationCap } from 'lucide-react';
import TeamChallengeCard from '@/components/gamification/TeamChallengeCard';
import SocialFeed from '@/components/social/SocialFeed';
import MentorMatcher from '@/components/mentorship/MentorMatcher';

export default function CollaborativeGamification() {
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const { data: challenges = [] } = useQuery({
    queryKey: ['teamChallenges'],
    queryFn: async () => {
      const allChallenges = await base44.entities.TeamChallenge.list('-created_date', 20);
      return allChallenges;
    }
  });

  const handleJoinChallenge = async (challenge) => {
    const user = await base44.auth.me();
    const updatedMembers = [
      ...(challenge.team_members || []),
      { email: user.email, role: 'participant', contribution_xp: 0 }
    ];
    
    await base44.entities.TeamChallenge.update(challenge.id, {
      team_members: updatedMembers
    });
  };

  const handleRequestMentorship = async (recommendation) => {
    const user = await base44.auth.me();
    await base44.entities.MentorshipPair.create({
      mentor_email: recommendation.mentor_email,
      mentee_email: user.email,
      focus_areas: recommendation.suggested_focus_areas || [],
      status: 'pending'
    });
    alert('Mentorship request sent! The mentor will be notified.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-3">
            Collaborative Learning Hub
          </h1>
          <p className="text-xl text-gray-400">
            Team challenges, social achievements, and expert mentorship
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="challenges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-purple-500/30">
            <TabsTrigger value="challenges" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-orange-500">
              <Users className="w-4 h-4 mr-2" />
              Team Challenges
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-orange-500">
              <Heart className="w-4 h-4 mr-2" />
              Social Feed
            </TabsTrigger>
            <TabsTrigger value="mentorship" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-orange-500">
              <GraduationCap className="w-4 h-4 mr-2" />
              Find a Mentor
            </TabsTrigger>
          </TabsList>

          {/* Team Challenges */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map(challenge => (
                <TeamChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onJoin={handleJoinChallenge}
                  onViewDetails={setSelectedChallenge}
                />
              ))}
            </div>
            {challenges.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl">No active challenges yet. Create one to get started!</p>
              </div>
            )}
          </TabsContent>

          {/* Social Feed */}
          <TabsContent value="social">
            <SocialFeed />
          </TabsContent>

          {/* Mentorship */}
          <TabsContent value="mentorship">
            <MentorMatcher onRequestMentorship={handleRequestMentorship} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}