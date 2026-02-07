import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Sparkles, TrendingUp, BookOpen, Send, Bot } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function InstructorForumAI() {
  const [newTopic, setNewTopic] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('course_design');
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: threads, refetch } = useQuery({
    queryKey: ['instructorForums'],
    queryFn: () => base44.entities.InstructorForum.list('-created_date')
  });

  const createThread = async () => {
    if (!newTopic.trim() || !newContent.trim()) {
      toast.error('Please provide topic and content');
      return;
    }

    try {
      await base44.entities.InstructorForum.create({
        topic: newTopic,
        category: newCategory,
        author_email: user.email,
        content: newContent,
        tags: []
      });
      
      setNewTopic('');
      setNewContent('');
      await refetch();
      toast.success('Discussion created!');
    } catch (error) {
      toast.error('Failed to create discussion');
    }
  };

  const addReply = async (threadId) => {
    if (!replyContent.trim()) return;

    try {
      const thread = threads.find(t => t.id === threadId);
      await base44.entities.InstructorForum.update(threadId, {
        replies: [
          ...(thread.replies || []),
          {
            author_email: user.email,
            content: replyContent,
            timestamp: new Date().toISOString(),
            helpful_votes: 0
          }
        ]
      });
      
      setReplyContent('');
      await refetch();
      toast.success('Reply added!');
    } catch (error) {
      toast.error('Failed to add reply');
    }
  };

  const getAIInsight = async (threadId, action) => {
    try {
      const response = await base44.functions.invoke('aiForumModerator', {
        forumThreadId: threadId,
        action
      });
      
      await refetch();
      toast.success('AI insight generated!');
    } catch (error) {
      toast.error('Failed to generate insight');
    }
  };

  const categories = [
    { value: 'course_design', label: 'Course Design' },
    { value: 'student_challenges', label: 'Student Challenges' },
    { value: 'assessment_strategies', label: 'Assessment Strategies' },
    { value: 'engagement_techniques', label: 'Engagement Techniques' },
    { value: 'technology_tools', label: 'Technology Tools' },
    { value: 'general', label: 'General' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            AI-Enhanced Instructor Forums
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 text-sm mb-4">
            Collaborate with fellow instructors, get AI-powered insights, and discover best practices
          </p>
          <Tabs defaultValue="browse">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="browse">Browse Discussions</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-slate-300 block mb-2">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-300 block mb-2">Topic</label>
                <Input
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="What would you like to discuss?"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 block mb-2">Content</label>
                <Textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share your thoughts, questions, or experiences..."
                  className="bg-slate-800 border-slate-700 text-white"
                  rows={5}
                />
              </div>

              <Button onClick={createThread} className="w-full bg-purple-600 hover:bg-purple-700">
                <Send className="w-4 h-4 mr-2" />
                Start Discussion
              </Button>
            </TabsContent>

            <TabsContent value="browse" className="space-y-4 mt-4">
              {threads?.map(thread => (
                <Card key={thread.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-600">{thread.category}</Badge>
                          {thread.status === 'resolved' && (
                            <Badge className="bg-green-600">Resolved</Badge>
                          )}
                        </div>
                        <h3 className="text-white font-semibold mb-1">{thread.topic}</h3>
                        <p className="text-sm text-slate-400 mb-2">{thread.content}</p>
                        <p className="text-xs text-slate-500">
                          by {thread.author_email} • {thread.replies?.length || 0} replies
                        </p>
                      </div>
                      <Button
                        onClick={() => setSelectedThread(selectedThread === thread.id ? null : thread.id)}
                        size="sm"
                        variant="outline"
                      >
                        {selectedThread === thread.id ? 'Close' : 'View'}
                      </Button>
                    </div>

                    {selectedThread === thread.id && (
                      <div className="mt-4 space-y-4 border-t border-slate-700 pt-4">
                        {/* AI Actions */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => getAIInsight(thread.id, 'summarize')}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Bot className="w-3 h-3 mr-1" />
                            Summarize
                          </Button>
                          <Button
                            onClick={() => getAIInsight(thread.id, 'suggest_resources')}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <BookOpen className="w-3 h-3 mr-1" />
                            Resources
                          </Button>
                          <Button
                            onClick={() => getAIInsight(thread.id, 'insights')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Insights
                          </Button>
                        </div>

                        {/* AI Insights Display */}
                        {thread.ai_insights?.length > 0 && (
                          <div className="bg-slate-900 rounded-lg p-3 border border-purple-500/30">
                            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                              <Bot className="w-4 h-4 text-purple-400" />
                              AI Insights
                            </h4>
                            {thread.ai_insights.slice(-1).map((insight, idx) => (
                              <div key={idx} className="text-sm text-slate-300">
                                <pre className="whitespace-pre-wrap">
                                  {JSON.stringify(JSON.parse(insight.content), null, 2)}
                                </pre>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Replies */}
                        <div className="space-y-2">
                          {thread.replies?.map((reply, idx) => (
                            <div key={idx} className="bg-slate-900 rounded p-3">
                              <p className="text-sm text-slate-300">{reply.content}</p>
                              <p className="text-xs text-slate-500 mt-1">{reply.author_email}</p>
                            </div>
                          ))}
                        </div>

                        {/* Add Reply */}
                        <div className="flex gap-2">
                          <Input
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Add your reply..."
                            className="bg-slate-900 border-slate-700 text-white"
                          />
                          <Button
                            onClick={() => addReply(thread.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}