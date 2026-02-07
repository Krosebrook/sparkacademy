import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Star, TrendingUp, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function PeerReviewPanel({ courseId }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.filter({ id: courseId }).then(c => c[0]),
    enabled: !!courseId
  });

  const { data: reviews, refetch } = useQuery({
    queryKey: ['peerReviews', courseId],
    queryFn: () => base44.entities.PeerReview.filter({ content_id: courseId }),
    enabled: !!courseId
  });

  const generateAIReview = async () => {
    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke('aiContentReview', {
        courseContent: course,
        reviewCriteria: 'comprehensive pedagogical and content quality review'
      });
      
      await refetch();
      toast.success('AI review completed!');
    } catch (error) {
      toast.error('Failed to generate review');
    }
    setIsGenerating(false);
  };

  const latestReview = reviews?.[0]?.review_data;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-900 to-purple-900 border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5" />
              AI Peer Review
            </CardTitle>
            <Button
              onClick={generateAIReview}
              disabled={isGenerating}
              className="bg-white text-purple-900 hover:bg-slate-100"
            >
              {isGenerating ? 'Reviewing...' : 'Generate AI Review'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 text-sm">
            Get comprehensive AI-powered feedback on content quality, pedagogical approach, and student engagement.
          </p>
        </CardContent>
      </Card>

      {latestReview && (
        <>
          <Card className="bg-slate-900 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Overall Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl font-bold text-white">
                  {latestReview.overall_rating?.score}/10
                </div>
                <Progress value={latestReview.overall_rating?.score * 10} className="flex-1 h-3" />
              </div>
              <p className="text-slate-300">{latestReview.overall_rating?.summary}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestReview.strengths?.map((strength, idx) => (
                <div key={idx} className="bg-slate-800 rounded-lg p-3 border border-green-500/20">
                  <Badge className="bg-green-600 mb-2">{strength.category}</Badge>
                  <p className="text-sm text-slate-300">{strength.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestReview.improvements?.map((improvement, idx) => (
                <div key={idx} className="bg-slate-800 rounded-lg p-4 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getPriorityColor(improvement.priority)}>
                      {improvement.priority} priority
                    </Badge>
                    <Badge className="bg-slate-700">{improvement.category}</Badge>
                  </div>
                  
                  <p className="text-sm text-red-400 mb-2">Issue: {improvement.issue}</p>
                  <p className="text-sm text-green-400 mb-2">→ {improvement.suggestion}</p>
                  
                  {improvement.example && (
                    <div className="mt-2 p-2 bg-slate-700 rounded border border-slate-600">
                      <p className="text-xs text-slate-400 mb-1">Example:</p>
                      <p className="text-sm text-slate-300">{improvement.example}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Pedagogical Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {latestReview.pedagogical_insights?.map((insight, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-400" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {latestReview.best_practices?.map((practice, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      {practice}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}