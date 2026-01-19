import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Calendar, Loader2, Target, CheckCircle2, Sparkles } from 'lucide-react';

export default function StudyPlanGenerator({ courseId }) {
  const [loading, setLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const generatePlan = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateStudyPlan', {
        course_id: courseId
      });
      setStudyPlan(data);
    } catch (error) {
      console.error('Study plan error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.learning_goal && courseId && !studyPlan) {
      generatePlan();
    }
  }, [user?.learning_goal, courseId]);

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Personalized Study Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user?.learning_goal && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-white text-sm">Your Learning Goal</span>
            </div>
            <p className="text-sm text-gray-300">{user.learning_goal}</p>
          </div>
        )}

        {!studyPlan && (
          <Button onClick={generatePlan} disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
            Generate Personalized Study Plan
          </Button>
        )}

        {studyPlan && (
          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-white text-sm">Your Goal</span>
              </div>
              <p className="text-sm text-gray-300">{studyPlan.goal_summary}</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Weekly Schedule</h4>
              <div className="space-y-2">
                {studyPlan.weekly_schedule?.map((week, idx) => (
                  <div key={idx} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white text-sm">Week {week.week_number}</span>
                      <Badge variant="outline" className="text-xs">{week.hours_per_week}h/week</Badge>
                    </div>
                    <ul className="space-y-1">
                      {week.topics?.map((topic, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                    {week.spaced_repetition && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-400">Review: {week.spaced_repetition.join(', ')}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}