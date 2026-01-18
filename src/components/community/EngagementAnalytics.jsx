import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart3, TrendingUp, Users, MessageCircle } from 'lucide-react';

export default function EngagementAnalytics({ courseId }) {
  const { data: analytics } = useQuery({
    queryKey: ['communityAnalytics', courseId],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('analyzeCommunityEngagement', {
        course_id: courseId
      });
      return data;
    }
  });

  const sentimentColor = {
    positive: 'text-green-400',
    neutral: 'text-gray-400',
    negative: 'text-red-400'
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Community Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white">{analytics?.active_members || 0}</div>
            <div className="text-xs text-gray-400">Active Members</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <MessageCircle className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white">{analytics?.total_discussions || 0}</div>
            <div className="text-xs text-gray-400">Discussions</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white">{analytics?.engagement_trend || 0}%</div>
            <div className="text-xs text-gray-400">Trend</div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-2">Overall Sentiment</h4>
          <div className="flex items-center gap-3">
            <Badge className={`${sentimentColor[analytics?.sentiment]} bg-gray-800`}>
              {analytics?.sentiment || 'Neutral'}
            </Badge>
            <span className="text-sm text-gray-400">{analytics?.sentiment_reason}</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-2">Top Topics</h4>
          <div className="flex flex-wrap gap-2">
            {analytics?.top_topics?.map((topic, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}