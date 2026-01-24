import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Users, CheckCircle2, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Progress } from '@/components/ui/progress';

export default function MentorMatcher({ onRequestMentorship }) {
  const [learningGoals, setLearningGoals] = useState('');
  const [topics, setTopics] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFindMentors = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('matchMentor', {
        learningGoals,
        skillLevel: 'intermediate',
        preferredTopics: topics.split(',').map(t => t.trim()).filter(Boolean)
      });

      if (response.data.success) {
        setRecommendations(response.data.recommendations);
      }
    } catch (error) {
      console.error('Error finding mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Find Your Perfect Mentor</CardTitle>
          <p className="text-gray-400">AI-powered mentor matching based on your goals</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-white font-semibold text-sm">What do you want to learn?</label>
            <Input
              placeholder="e.g., Master React development, Build scalable systems, Career transition to AI"
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-white font-semibold text-sm">Topics of Interest (comma-separated)</label>
            <Input
              placeholder="e.g., React, TypeScript, System Design, Machine Learning"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <Button
            onClick={handleFindMentors}
            disabled={!learningGoals.trim() || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-bold py-6"
          >
            {loading ? 'Finding Mentors...' : 'Find Mentors'}
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">Recommended Mentors</h3>
          {recommendations.map((rec, idx) => (
            <Card key={idx} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30 hover:border-purple-500/60 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {rec.mentor_email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{rec.mentor_email?.split('@')[0]}</h4>
                      {rec.mentorProfile?.average_rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                          <span className="text-sm text-gray-300">{rec.mentorProfile.average_rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">• {rec.mentorProfile.total_sessions_conducted} sessions</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-400">{rec.match_score}%</div>
                    <p className="text-xs text-gray-500">Match Score</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <Progress value={rec.match_score} className="h-2 bg-slate-700" />
                </div>

                {/* Expertise */}
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Expertise:</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.mentorProfile?.expertise_areas?.map((area, i) => (
                      <Badge key={i} className="bg-purple-900/50 text-purple-300 border border-purple-500/50">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Reasons */}
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Why this mentor:</p>
                  <ul className="space-y-1">
                    {rec.reasons?.slice(0, 3).map((reason, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Expected Outcomes */}
                {rec.expected_outcomes && rec.expected_outcomes.length > 0 && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-purple-900/30 to-orange-900/30 rounded-lg border border-purple-500/30">
                    <p className="text-sm text-purple-300 font-semibold mb-2">Expected Outcomes:</p>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {rec.expected_outcomes.slice(0, 2).map((outcome, i) => (
                        <li key={i}>• {outcome}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => onRequestMentorship(rec)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Request Mentorship
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}