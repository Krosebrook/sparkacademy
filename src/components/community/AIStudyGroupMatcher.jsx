import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Users, Loader2, Sparkles, UserPlus } from 'lucide-react';

export default function AIStudyGroupMatcher({ userEmail }) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(null);

  const findMatches = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('findStudyGroupMatches', {
        user_email: userEmail
      });
      setMatches(data);
    } catch (error) {
      console.error('Match error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Study Group Matcher
          </CardTitle>
          <Button size="sm" onClick={findMatches} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find Matches'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!matches && !loading && (
          <p className="text-sm text-gray-400 text-center py-4">
            Find compatible study partners based on your skills and goals
          </p>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        )}

        {matches && (
          <div className="space-y-3">
            {matches.suggested_partners?.map((partner, idx) => (
              <div key={idx} className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{partner.name}</h4>
                    <p className="text-sm text-gray-400 mb-2">{partner.bio}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{partner.match_score}% match</Badge>
                      <Badge className="text-xs bg-green-500/20 text-green-300">
                        {partner.shared_interests} shared interests
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Common goals:</p>
                    <div className="flex flex-wrap gap-1">
                      {partner.common_goals?.map((goal, i) => (
                        <Badge key={i} className="text-xs bg-purple-600/20 text-purple-300">{goal}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}