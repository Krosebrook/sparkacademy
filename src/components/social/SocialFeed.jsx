import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, Lightbulb, TrendingUp, MessageCircle, 
  Heart, ThumbsUp, Sparkles, Send 
} from 'lucide-react';

export default function SocialFeed() {
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('insight');
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['socialPosts'],
    queryFn: async () => {
      const allPosts = await base44.entities.SocialPost.list('-created_date', 50);
      return allPosts;
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      return await base44.entities.SocialPost.create(postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
      setNewPost('');
    }
  });

  const addReactionMutation = useMutation({
    mutationFn: async ({ postId, reactionType }) => {
      const post = posts.find(p => p.id === postId);
      const user = await base44.auth.me();
      const existingReactions = post.reactions || [];
      
      // Toggle reaction
      const hasReacted = existingReactions.some(r => r.user_email === user.email && r.reaction_type === reactionType);
      const newReactions = hasReacted
        ? existingReactions.filter(r => !(r.user_email === user.email && r.reaction_type === reactionType))
        : [...existingReactions, { user_email: user.email, reaction_type: reactionType, timestamp: new Date().toISOString() }];

      return await base44.entities.SocialPost.update(postId, { reactions: newReactions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialPosts'] });
    }
  });

  const handleCreatePost = () => {
    if (newPost.trim()) {
      createPostMutation.mutate({
        post_type: postType,
        content: newPost,
        tags: [],
        visibility: 'public'
      });
    }
  };

  const postTypeIcons = {
    achievement: { icon: Trophy, color: 'text-orange-400', bg: 'bg-orange-900/50' },
    insight: { icon: Lightbulb, color: 'text-purple-400', bg: 'bg-purple-900/50' },
    milestone: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-900/50' }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Loading feed...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            {['insight', 'achievement', 'milestone'].map(type => (
              <Button
                key={type}
                onClick={() => setPostType(type)}
                variant={postType === type ? 'default' : 'outline'}
                size="sm"
                className={postType === type 
                  ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white' 
                  : 'border-slate-700 text-gray-400'
                }
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
          <Textarea
            placeholder="Share your achievements, insights, or milestones..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleCreatePost}
              disabled={!newPost.trim() || createPostMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
            >
              <Send className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      <div className="space-y-4">
        {posts.map(post => {
          const typeConfig = postTypeIcons[post.post_type] || postTypeIcons.insight;
          const Icon = typeConfig.icon;
          const reactionCount = post.reactions?.length || 0;
          const commentCount = post.comments?.length || 0;

          return (
            <Card key={post.id} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 hover:border-purple-500/30 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${typeConfig.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${typeConfig.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-white font-semibold">{post.author_email?.split('@')[0]}</p>
                      <Badge className={`${typeConfig.bg} ${typeConfig.color} border-0`}>
                        {post.post_type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(post.created_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4">{post.content}</p>

                    {/* Achievement Data */}
                    {post.achievement_data && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-purple-900/30 to-orange-900/30 rounded-lg border border-purple-500/30">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-purple-300 font-semibold">
                            {post.achievement_data.title}
                          </span>
                          {post.achievement_data.xp_earned && (
                            <span className="text-xs text-orange-400">+{post.achievement_data.xp_earned} XP</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reactions */}
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addReactionMutation.mutate({ postId: post.id, reactionType: 'like' })}
                        className="text-gray-400 hover:text-purple-400"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {reactionCount > 0 && reactionCount}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-purple-400"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {commentCount > 0 && commentCount}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}