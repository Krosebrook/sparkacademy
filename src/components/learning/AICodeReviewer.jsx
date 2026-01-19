import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Code, Loader2, CheckCircle2, AlertTriangle, Lightbulb, Target } from 'lucide-react';

export default function AICodeReviewer() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const reviewCode = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('reviewCode', {
        code: code.trim(),
        learning_goal: user?.learning_goal || null
      });
      setFeedback(data);
    } catch (error) {
      console.error('Code review error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Code className="w-5 h-5" />
          AI Code Reviewer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user?.learning_goal && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-white text-sm">Reviewing for your goal:</span>
            </div>
            <p className="text-sm text-gray-300">{user.learning_goal}</p>
          </div>
        )}
        
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here for AI feedback..."
          rows={10}
          className="font-mono text-sm"
        />
        <Button onClick={reviewCode} disabled={loading || !code.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Code className="w-4 h-4 mr-2" />}
          Review Code
        </Button>

        {feedback && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Overall Quality:</span>
              <Badge className={
                feedback.quality_score >= 80 ? 'bg-green-500' :
                feedback.quality_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }>
                {feedback.quality_score}/100
              </Badge>
            </div>

            {feedback.strengths?.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="font-semibold text-white text-sm">Strengths</span>
                </div>
                <ul className="space-y-1">
                  {feedback.strengths.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-300">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.issues?.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="font-semibold text-white text-sm">Issues to Fix</span>
                </div>
                <ul className="space-y-1">
                  {feedback.issues.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-300">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.suggestions?.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-white text-sm">Suggestions</span>
                </div>
                <ul className="space-y-1">
                  {feedback.suggestions.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-300">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}