/**
 * Discussion & Feedback Manager
 * Manage student discussions, course feedback, and send replies
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Star, Send, Loader2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3 h-3 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
      ))}
    </div>
  );
}

function DiscussionThread({ post, courseId }) {
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleReply = async () => {
    if (!reply.trim()) return;
    setReplying(true);
    const updatedReplies = [...(post.replies || []), {
      author_email: 'instructor',
      content: reply,
      timestamp: new Date().toISOString(),
      helpful_votes: 0
    }];
    await base44.entities.CourseDiscussion.update(post.id, { replies: updatedReplies });
    setReply('');
    setReplying(false);
    queryClient.invalidateQueries(['discussions', courseId]);
    toast.success('Reply posted');
  };

  const generateAIReply = async () => {
    setAiLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful course instructor. A student asked: "${post.content}". Write a concise, helpful reply in 2-3 sentences.`
      });
      setReply(result || '');
    } catch {
      toast.error('Failed to generate reply');
    }
    setAiLoading(false);
  };

  return (
    <Card className="bg-white border border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="font-semibold text-slate-800 text-sm">{post.student_name || post.author_email || 'Student'}</p>
            <p className="text-xs text-slate-500">{new Date(post.created_date).toLocaleDateString()}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="text-slate-500">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-sm text-slate-700 mb-3">{post.content}</p>

        {(post.replies?.length > 0) && (
          <div className="text-xs text-slate-500 mb-2">{post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}</div>
        )}

        {expanded && (
          <div className="mt-3 space-y-3">
            {post.replies?.map((r, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3 border-l-2 border-blue-400">
                <p className="text-xs font-semibold text-blue-700 mb-1">{r.author_email === 'instructor' ? '👨‍🏫 You' : r.author_email}</p>
                <p className="text-sm text-slate-700">{r.content}</p>
              </div>
            ))}

            <div className="space-y-2 mt-3">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply..."
                rows={3}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={generateAIReply} disabled={aiLoading} variant="outline" className="gap-1">
                  {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  AI Draft
                </Button>
                <Button size="sm" onClick={handleReply} disabled={replying || !reply.trim()} className="gap-1 ml-auto">
                  {replying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Reply
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DiscussionFeedbackManager({ courseId }) {
  const { data: discussions, isLoading: loadingDisc } = useQuery({
    queryKey: ['discussions', courseId],
    queryFn: () => base44.entities.CourseDiscussion.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const { data: feedback, isLoading: loadingFeed } = useQuery({
    queryKey: ['feedback', courseId],
    queryFn: () => base44.entities.CourseFeedback.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const avgRating = feedback?.length
    ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : '—';

  const unanswered = discussions?.filter(d => !d.replies?.length) || [];

  return (
    <div className="space-y-4">
      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white border border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{discussions?.length || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Total Discussions</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-orange-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{unanswered.length}</p>
            <p className="text-xs text-slate-500 mt-1">Unanswered</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-amber-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <p className="text-2xl font-bold text-amber-600">{avgRating}</p>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Avg Rating ({feedback?.length || 0} reviews)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="discussions">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="discussions" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Discussions
            {unanswered.length > 0 && (
              <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0">{unanswered.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <Star className="w-4 h-4" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="space-y-3 mt-4">
          {loadingDisc ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : discussions?.length === 0 ? (
            <Card className="bg-white"><CardContent className="p-8 text-center text-slate-400">No discussions yet</CardContent></Card>
          ) : (
            <>
              {unanswered.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">Needs Response</p>
                  <div className="space-y-2">
                    {unanswered.map(post => <DiscussionThread key={post.id} post={post} courseId={courseId} />)}
                  </div>
                </div>
              )}
              {discussions.filter(d => d.replies?.length > 0).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 mt-4">Answered</p>
                  <div className="space-y-2">
                    {discussions.filter(d => d.replies?.length > 0).map(post => (
                      <DiscussionThread key={post.id} post={post} courseId={courseId} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-3 mt-4">
          {loadingFeed ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : feedback?.length === 0 ? (
            <Card className="bg-white"><CardContent className="p-8 text-center text-slate-400">No feedback yet</CardContent></Card>
          ) : (
            feedback.map((f, i) => (
              <Card key={i} className="bg-white border border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <StarRating rating={f.rating} />
                    <span className="text-xs text-slate-400">{new Date(f.created_date).toLocaleDateString()}</span>
                  </div>
                  {f.feedback_text && <p className="text-sm text-slate-700">{f.feedback_text}</p>}
                  {f.strengths && <p className="text-xs text-green-600 mt-2">👍 {f.strengths}</p>}
                  {f.improvements && <p className="text-xs text-orange-600 mt-1">💡 {f.improvements}</p>}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}