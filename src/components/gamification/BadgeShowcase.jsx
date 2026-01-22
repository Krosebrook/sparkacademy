import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Zap, Target, Users, BookOpen, Trophy, Sparkles } from 'lucide-react';

export default function BadgeShowcase({ userEmail }) {
  const badgeCategories = [
    {
      name: 'Course Completion',
      icon: BookOpen,
      badges: [
        { name: 'First Course', description: 'Complete your first course', earned: true, rarity: 'common' },
        { name: '5 Course Streak', description: 'Complete 5 courses', earned: true, rarity: 'uncommon' },
        { name: 'Course Master', description: 'Complete 20 courses', earned: false, rarity: 'rare', progress: '12/20' }
      ]
    },
    {
      name: 'Achievement',
      icon: Trophy,
      badges: [
        { name: 'Perfect Score', description: 'Score 100% on an assessment', earned: true, rarity: 'rare' },
        { name: 'Speed Learner', description: 'Complete a course in under 2 days', earned: true, rarity: 'uncommon' },
        { name: 'Comeback King', description: '7-day learning streak', earned: true, rarity: 'epic' }
      ]
    },
    {
      name: 'Community',
      icon: Users,
      badges: [
        { name: 'Helpful Member', description: 'Receive 50 upvotes', earned: true, rarity: 'uncommon' },
        { name: 'Discussion Starter', description: 'Create 10 forum topics', earned: false, rarity: 'common', progress: '7/10' },
        { name: 'Mentor', description: 'Help 25 students', earned: false, rarity: 'legendary' }
      ]
    }
  ];

  const rarityColors = {
    common: { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30', glow: '' },
    uncommon: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]' },
    rare: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]' },
    epic: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.5)]' },
    legendary: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', glow: 'shadow-[0_0_25px_rgba(234,179,8,0.6)]' }
  };

  const getBadgeIcon = (categoryIcon) => {
    const Icon = categoryIcon;
    return <Icon className="w-8 h-8" />;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Your Badge Collection
          </CardTitle>
          <p className="text-sm text-gray-400">12 earned • 8 in progress • 15 locked</p>
        </CardHeader>
      </Card>

      {badgeCategories.map((category, idx) => (
        <div key={idx} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            {React.createElement(category.icon, { className: 'w-4 h-4 text-purple-400' })}
            <h3 className="font-bold text-sm text-purple-300 uppercase tracking-wider">
              {category.name}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {category.badges.map((badge, badgeIdx) => {
              const colors = rarityColors[badge.rarity];
              
              return (
                <Card 
                  key={badgeIdx}
                  className={`${
                    badge.earned 
                      ? `${colors.bg} border ${colors.border} ${colors.glow}` 
                      : 'bg-gray-900/20 border-gray-700/20 opacity-60'
                  } transition-all hover:scale-105`}
                >
                  <CardContent className="p-5 text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      badge.earned ? colors.bg : 'bg-gray-800/50'
                    } border-2 ${badge.earned ? colors.border : 'border-gray-700'}`}>
                      {React.createElement(category.icon, { 
                        className: `w-8 h-8 ${badge.earned ? colors.text : 'text-gray-600'}` 
                      })}
                    </div>
                    
                    <h4 className={`font-bold text-sm mb-1 ${badge.earned ? '' : 'text-gray-500'}`}>
                      {badge.name}
                    </h4>
                    <p className="text-xs text-gray-400 mb-2">{badge.description}</p>
                    
                    <div className="flex items-center justify-center gap-2">
                      <Badge className={`text-xs ${colors.bg} ${colors.text} ${colors.border} border`}>
                        {badge.rarity}
                      </Badge>
                      {!badge.earned && badge.progress && (
                        <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                          {badge.progress}
                        </Badge>
                      )}
                    </div>

                    {badge.earned && (
                      <div className="mt-3 pt-3 border-t border-gray-700/30">
                        <p className="text-xs text-gray-500">Earned Dec 15, 2025</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Next Badge */}
      <Card className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border-cyan-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm mb-1">Next Badge Available</h4>
              <p className="text-xs text-gray-400 mb-2">
                Complete 3 more discussion topics to earn "Discussion Starter" badge
              </p>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 w-[70%]" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}