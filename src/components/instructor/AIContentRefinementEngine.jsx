import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Sparkles, RefreshCw, CheckCircle, ArrowRight, History } from 'lucide-react';

export default function AIContentRefinementEngine({ contentRevisionId, initialContent, contentType }) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [refinedResult, setRefinedResult] = useState(null);
  const queryClient = useQueryClient();

  const { data: revisionHistory } = useQuery({
    queryKey: ['revision-history', contentRevisionId],
    queryFn: async () => {
      if (!contentRevisionId) return null;
      const revisions = await base44.entities.AIContentRevision.filter({ id: contentRevisionId });
      return revisions[0];
    },
    enabled: !!contentRevisionId
  });

  const saveRevisionMutation = useMutation({
    mutationFn: async (data) => {
      if (contentRevisionId) {
        const current = await base44.entities.AIContentRevision.filter({ id: contentRevisionId });
        const revision = current[0];
        
        const updatedHistory = [...(revision.revision_history || []), {
          version: (revision.revision_history?.length || 0) + 1,
          feedback: data.feedback,
          changes_made: data.changes_summary,
          revised_content: data.refined_content,
          revised_date: new Date().toISOString()
        }];

        return base44.entities.AIContentRevision.update(contentRevisionId, {
          current_content: data.refined_content,
          revision_history: updatedHistory
        });
      } else {
        return base44.entities.AIContentRevision.create({
          course_id: data.course_id || 'default',
          instructor_email: data.instructor_email,
          content_type: contentType,
          original_content: initialContent,
          current_content: data.refined_content,
          revision_history: [{
            version: 1,
            feedback: data.feedback,
            changes_made: data.changes_summary,
            revised_content: data.refined_content,
            revised_date: new Date().toISOString()
          }]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['revision-history']);
    }
  });

  const refineContent = async () => {
    if (!feedback.trim()) {
      alert('Please provide feedback for refinement');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('refineAIContent', {
        content_type: contentType,
        current_content: revisionHistory?.current_content || initialContent,
        feedback,
        refinement_instructions: feedback
      });

      setRefinedResult(data);
    } catch (error) {
      console.error('Refinement error:', error);
      alert('Failed to refine content');
    } finally {
      setLoading(false);
    }
  };

  const applyRefinement = async () => {
    if (!refinedResult) return;

    try {
      const user = await base44.auth.me();
      await saveRevisionMutation.mutateAsync({
        feedback,
        changes_summary: refinedResult.changes_summary,
        refined_content: refinedResult.refined_content,
        course_id: 'default',
        instructor_email: user.email
      });

      setFeedback('');
      setRefinedResult(null);
      alert('Content refinement applied successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save refinement');
    }
  };

  const quickFeedbackOptions = [
    'Make this more hands-on with practical exercises',
    'Increase focus on real-world applications',
    'Adjust difficulty level to be more accessible',
    'Add more interactive elements and engagement',
    'Improve clarity and simplify explanations',
    'Include more diverse examples and case studies'
  ];

  return (
    <div className="space-y-4">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Content Refinement Engine
          </CardTitle>
          <p className="text-sm text-gray-400">Provide feedback to refine and improve AI-generated content</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Your Refinement Feedback</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g., Make this lesson more hands-on with practical examples, reduce theoretical content..."
              className="bg-[#1a0a2e] h-32"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Quick Suggestions</label>
            <div className="flex flex-wrap gap-2">
              {quickFeedbackOptions.map((option, idx) => (
                <Badge
                  key={idx}
                  className="cursor-pointer hover:bg-purple-600 transition-colors"
                  onClick={() => setFeedback(option)}
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={refineContent} disabled={loading || !feedback} className="btn-primary w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refine Content with AI
          </Button>

          {loading && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
              <p className="text-gray-400">Analyzing feedback and refining content...</p>
            </div>
          )}

          {refinedResult && (
            <div className="space-y-4 mt-6">
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h4 className="font-semibold text-white">Refinement Complete</h4>
                  <Badge className="bg-green-500/20 text-green-300 ml-auto">
                    Quality: {refinedResult.quality_score || 0}%
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-white mb-2">Changes Summary</h5>
                  <p className="text-sm text-gray-300">{refinedResult.changes_summary}</p>
                </div>

                {refinedResult.specific_improvements?.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-white mb-2">Specific Improvements</h5>
                    <div className="space-y-2">
                      {refinedResult.specific_improvements.map((improvement, idx) => (
                        <div key={idx} className="bg-green-900/10 border border-green-500/20 rounded p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <ArrowRight className="w-3 h-3 text-green-400" />
                            <span className="text-xs font-semibold text-green-300">{improvement.area}</span>
                          </div>
                          <p className="text-xs text-gray-300 ml-5">{improvement.change}</p>
                          <p className="text-xs text-gray-400 ml-5 italic">→ {improvement.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={applyRefinement} className="btn-primary flex-1">
                    Apply Refinement
                  </Button>
                  <Button onClick={() => setRefinedResult(null)} variant="outline">
                    Discard
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {revisionHistory?.revision_history?.length > 0 && (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" />
              Revision History ({revisionHistory.revision_history.length} versions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revisionHistory.revision_history.slice().reverse().map((rev, idx) => (
                <div key={idx} className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-500/20 text-blue-300">Version {rev.version}</Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(rev.revised_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="text-xs text-gray-400">Feedback:</div>
                    <p className="text-sm text-gray-300">{rev.feedback}</p>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Changes:</div>
                    <p className="text-sm text-gray-300">{rev.changes_made}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}