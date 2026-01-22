import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Plus, 
  TrendingUp, 
  Sparkles, 
  ThumbsUp, 
  MessageCircle,
  User,
  Clock,
  Filter,
  Search
} from 'lucide-react';

export default function CommunityForum() {
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '', category: 'general' });
  const [filterCategory, setFilterCategory] = useState('all');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: discussions } = useQuery({
    queryKey: ['discussions', filterCategory],
    queryFn: async () => {
      const query = filterCategory === 'all' ? {} : { category: filterCategory };
      return base44.entities.CourseDiscussion.filter(query, '-created_date', 20);
    },
    initialData: []
  });

  const createTopicMutation = useMutation({
    mutationFn: async (topicData) => {
      return base44.entities.CourseDiscussion.create({
        ...topicData,
        user_email: user.email,
        user_name: user.full_name,
        likes_count: 0,
        replies_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions']);
      setShowNewTopic(false);
      setNewTopic({ title: '', content: '', category: 'general' });
    }
  });

  const handleCreateTopic = () => {
    if (!newTopic.title || !newTopic.content) return;
    createTopicMutation.mutate(newTopic);
  };

  const mockDiscussions = [
    {
      id: '1',
      title: 'Best practices for React Hooks in production?',
      content: 'Looking for advice on managing state with hooks...',
      user_name: 'Sarah Chen',
      created_date: new Date().toISOString(),
      category: 'Technical',
      likes_count: 24,
      replies_count: 12,
      trending: true
    },
    {
      id: '2',
      title: 'Machine Learning project collaboration',
      content: 'Anyone interested in building a sentiment analysis tool together?',
      user_name: 'Marcus Johnson',
      created_date: new Date(Date.now() - 3600000).toISOString(),
      category: 'Projects',
      likes_count: 15,
      replies_count: 8,
      aiSuggested: true
    },
    {
      id: '3',
      title: 'Tips for preparing for technical interviews?',
      content: 'What resources helped you most when preparing for FAANG interviews?',
      user_name: 'Emma Davis',
      created_date: new Date(Date.now() - 7200000).toISOString(),
      category: 'Career',
      likes_count: 31,
      replies_count: 19
    }
  ];

  const displayDiscussions = discussions.length > 0 ? discussions : mockDiscussions;

  const categories = ['all', 'Technical', 'Projects', 'Career', 'General'];

  return (
    <div className="min-h-screen bg-[#0f0618] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0f0618]/80 backdrop-blur-md border-b border-purple-500/10">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-purple-500/10 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Community Forum</h1>
              <p className="text-xs text-gray-400">Connect, Learn, Collaborate</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowNewTopic(!showNewTopic)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Topic
          </Button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* AI Suggested Topics */}
        <Card className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-1">AI Suggested Discussion</h3>
                <p className="text-xs text-gray-400 mb-3">
                  Based on recent course activity, you might be interested in: "Advanced React Patterns for State Management"
                </p>
                <Button size="sm" variant="outline" className="border-cyan-500/30 hover:bg-cyan-500/10">
                  Explore Topic
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Topic Form */}
        {showNewTopic && (
          <Card className="bg-purple-900/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-lg">Create New Discussion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Topic Title</label>
                <Input
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  placeholder="What would you like to discuss?"
                  className="bg-[#1a0a2e] border-purple-500/30"
                />
              </div>
              
              <div>
                <label className="text-sm font-semibold mb-2 block">Category</label>
                <select
                  value={newTopic.category}
                  onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                  className="w-full bg-[#1a0a2e] border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                >
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="projects">Projects</option>
                  <option value="career">Career</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Description</label>
                <Textarea
                  value={newTopic.content}
                  onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                  placeholder="Share your thoughts, questions, or ideas..."
                  className="bg-[#1a0a2e] border-purple-500/30 min-h-[120px]"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateTopic} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Post Discussion
                </Button>
                <Button onClick={() => setShowNewTopic(false)} variant="outline" className="border-purple-500/30">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {categories.map(cat => (
            <Button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              variant={filterCategory === cat ? 'default' : 'outline'}
              size="sm"
              className={filterCategory === cat 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'border-purple-500/30 hover:bg-purple-500/10'
              }
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>

        {/* Discussion Topics */}
        <div className="space-y-3">
          {displayDiscussions.map((discussion) => (
            <Card key={discussion.id} className="bg-gray-900/40 border-purple-500/20 hover:bg-gray-900/60 transition-all cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    {discussion.user_name?.[0] || 'U'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-base">{discussion.title}</h3>
                      {discussion.trending && (
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      {discussion.aiSuggested && (
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Suggested
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs border-purple-500/30">
                        {discussion.category}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{discussion.content}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {discussion.user_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(discussion.created_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 text-purple-400">
                        <ThumbsUp className="w-3 h-3" />
                        {discussion.likes_count}
                      </span>
                      <span className="flex items-center gap-1 text-blue-400">
                        <MessageCircle className="w-3 h-3" />
                        {discussion.replies_count} replies
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Moderation Notice */}
        <Card className="bg-blue-900/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-gray-400">
                AI moderates all content to ensure quality discussions and suggests relevant topics based on community activity
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}