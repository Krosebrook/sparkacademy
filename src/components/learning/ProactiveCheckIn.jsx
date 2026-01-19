import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Sparkles, X, CheckCircle, Book, Lightbulb, Target, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProactiveCheckIn() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ['check-ins', user?.email],
    queryFn: () => base44.entities.TutorCheckIn.filter({ 
      user_email: user?.email,
      status: 'pending'
    }),
    enabled: !!user?.email,
    refetchInterval: 60000 // Check every minute
  });

  const updateCheckInMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.TutorCheckIn.update(id, { 
      status,
      [`${status}_date`]: new Date().toISOString()
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['check-ins'] })
  });

  const updateCheckIn = (id, status) => updateCheckInMutation.mutate({ id, status });

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'resource': return <Book className="w-4 h-4" />;
      case 'tip': return <Lightbulb className="w-4 h-4" />;
      case 'encouragement': return <Heart className="w-4 h-4" />;
      case 'goal_adjustment': return <Target className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getTriggerLabel = (trigger) => {
    const labels = {
      inactivity: 'Haven\'t seen you in a while',
      missed_deadlines: 'Missed deadlines',
      low_quiz_scores: 'Quiz performance',
      incomplete_lessons: 'Incomplete lessons',
      declining_engagement: 'Activity declining'
    };
    return labels[trigger] || trigger;
  };

  if (!checkIns || checkIns.length === 0) return null;

  return (
    <AnimatePresence>
      {checkIns.map((checkIn) => (
        <motion.div
          key={checkIn.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-4"
        >
          <Card className="border-2 border-purple-500/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Your AI Tutor is checking in</CardTitle>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {getTriggerLabel(checkIn.trigger_reason)}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateCheckIn(checkIn.id, 'dismissed')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main Message */}
              <Alert className="border-purple-200 bg-white/50">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <AlertDescription className="text-gray-700 ml-2">
                  {checkIn.message}
                </AlertDescription>
              </Alert>

              {/* Suggestions */}
              {checkIn.suggestions && checkIn.suggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Here's how I can help:</p>
                  {checkIn.suggestions.map((suggestion, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        {getSuggestionIcon(suggestion.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{suggestion.content}</p>
                        {suggestion.action_url && (
                          <Button 
                            size="sm" 
                            variant="link" 
                            className="text-purple-600 p-0 h-auto mt-1"
                            onClick={() => {
                              window.open(suggestion.action_url, '_blank');
                              updateCheckIn(checkIn.id, 'acted_on');
                            }}
                          >
                            Learn more <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => updateCheckIn(checkIn.id, 'acted_on')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Thanks, I'll get back on track!
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}