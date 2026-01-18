import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, MessageSquare, BookOpen } from 'lucide-react';

export default function SmartContentSuggester({ userEmail, courseId }) {
  const { data: suggestions } = useQuery({
    queryKey: ['contentSuggestions', userEmail, courseId],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('suggestRelevantContent', {
        user_email: userEmail,
        course_id: courseId
      });
      return data;
    },
    enabled: !!userEmail
  });

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions?.discussions?.map((disc, idx) => (
          <div key={idx} className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400 mt-1" />
              <div className="flex-1">
                <h4 className="font-medium text-white text-sm mb-1">{disc.title}</h4>
                <p className="text-xs text-gray-400 mb-2">{disc.snippet}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{disc.relevance_score}% match</Badge>
                  <span className="text-xs text-gray-500">{disc.replies} replies</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {suggestions?.resources?.map((resource, idx) => (
          <div key={idx} className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-blue-400 mt-1" />
              <div className="flex-1">
                <h4 className="font-medium text-white text-sm mb-1">{resource.title}</h4>
                <p className="text-xs text-gray-400 mb-2">{resource.description}</p>
                <Badge className="text-xs bg-blue-500/20 text-blue-300">{resource.type}</Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}