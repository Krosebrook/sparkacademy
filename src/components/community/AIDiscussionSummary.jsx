import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { MessageSquare, TrendingUp, Loader2, Sparkles } from 'lucide-react';

export default function AIDiscussionSummary({ courseId }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('summarizeDiscussions', {
        course_id: courseId
      });
      setSummary(data);
    } catch (error) {
      console.error('Summary error:', error);
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
            AI Discussion Summary
          </CardTitle>
          <Button size="sm" onClick={generateSummary} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!summary && !loading && (
          <p className="text-sm text-gray-400 text-center py-4">
            Click "Generate" to see AI-powered insights from recent discussions
          </p>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        )}

        {summary && (
          <>
            {/* Key Points */}
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Key Discussion Points
              </h4>
              <ul className="space-y-2">
                {summary.key_points?.map((point, idx) => (
                  <li key={idx} className="text-sm text-gray-300 bg-gray-800/50 rounded p-2">
                    • {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trending Topics */}
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending Topics
              </h4>
              <div className="flex flex-wrap gap-2">
                {summary.trending_topics?.map((topic, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {topic.name} ({topic.mentions} mentions)
                  </Badge>
                ))}
              </div>
            </div>

            {/* Common Questions */}
            {summary.common_questions?.length > 0 && (
              <div>
                <h4 className="font-semibold text-white mb-2">Common Questions</h4>
                <ul className="space-y-2">
                  {summary.common_questions.map((q, idx) => (
                    <li key={idx} className="text-sm text-gray-300 bg-blue-500/10 border border-blue-500/30 rounded p-2">
                      Q: {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}