import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Award, Trophy, Star, Target } from 'lucide-react';

export default function BadgeDisplay({ userEmail }) {
  const { data: userBadges } = useQuery({
    queryKey: ['userBadges', userEmail],
    queryFn: () => base44.entities.UserBadge?.filter({ student_email: userEmail }),
    enabled: !!userEmail
  });

  const { data: allBadges } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge?.list()
  });

  const earnedBadgeIds = userBadges?.map(ub => ub.badge_id) || [];
  const earnedBadges = allBadges?.filter(b => earnedBadgeIds.includes(b.id)) || [];
  const lockedBadges = allBadges?.filter(b => !earnedBadgeIds.includes(b.id)).slice(0, 3) || [];

  const iconMap = {
    award: Award,
    trophy: Trophy,
    star: Star,
    target: Target
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Your Badges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Earned Badges */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Earned ({earnedBadges.length})</h4>
          <div className="grid grid-cols-2 gap-3">
            {earnedBadges.map(badge => {
              const Icon = iconMap[badge.icon] || Award;
              return (
                <div key={badge.id} className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3">
                  <Icon className="w-8 h-8 text-yellow-400 mb-2" />
                  <h5 className="font-semibold text-white text-sm">{badge.name}</h5>
                  <p className="text-xs text-gray-400">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">In Progress</h4>
            <div className="grid grid-cols-2 gap-3">
              {lockedBadges.map(badge => {
                const Icon = iconMap[badge.icon] || Award;
                return (
                  <div key={badge.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 opacity-60">
                    <Icon className="w-8 h-8 text-gray-500 mb-2" />
                    <h5 className="font-semibold text-gray-400 text-sm">{badge.name}</h5>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}