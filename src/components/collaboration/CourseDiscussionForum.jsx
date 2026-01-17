/**
 * Course Discussion Forum
 * Threaded discussions for course collaboration
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ThumbsUp, Reply, Search } from 'lucide-react';

export default function CourseDiscussionForum({ courseId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newDiscussionText, setNewDiscussionText] = useState('');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: discussions, refetch } = useQuery({
    queryKey: ['discussions', courseId],
    queryFn: () => base44.entities.CourseDiscussion?.filter({ 
      course_id: courseId,
      parent_discussion_id: null // Only top-level discussions
    }).catch(() => [])
  });

  const { data: replies } = useQuery({
    queryKey: ['discussionReplies', courseId],
    queryFn: () => base44.entities.CourseDiscussion?.filter({ 
      course_id: courseId
    }).catch(() => [])
  });

  const postDiscussion = async () => {
    if (!newDiscussionText.trim()) return;

    try {
      await base44.entities.CourseDiscussion?.create({
        course_id: courseId,
        student_email: user.email,
        student_name: user.full_name,
        discussion_text: newDiscussionText,
        created_date: new Date().toISOString(),
        upvotes: 0,
        replies_count: 0
      }).catch(() => {});
      
      setNewDiscussionText('');
      refetch();
    } catch (error) {
      console.error('Error posting discussion:', error);
    }
  };

  const postReply = async (parentId) => {
    if (!replyText.trim()) return;

    try {
      await base44.entities.CourseDiscussion?.create({
        course_id: courseId,
        parent_discussion_id: parentId,
        student_email: user.email,
        student_name: user.full_name,
        discussion_text: replyText,
        created_date: new Date().toISOString(),
        upvotes: 0
      }).catch(() => {});

      setReplyText('');
      setShowReplyForm(null);
      refetch();
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const filteredDiscussions = discussions?.filter(d => 
    d.discussion_text.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-cyan-400" />
        Course Discussions
      </h3>

      {/* New Discussion Form */}
      <Card className="card-glow">
        <CardContent className="p-4">
          <Textarea
            placeholder="Start a new discussion..."
            value={newDiscussionText}
            onChange={(e) => setNewDiscussionText(e.target.value)}
            className="bg-[#1a0a2e] border-[#2d1b4e] text-white mb-2 text-sm"
            rows={3}
          />
          <Button 
            onClick={postDiscussion}
            disabled={!newDiscussionText.trim()}
            className="btn-primary text-sm"
          >
            Post Discussion
          </Button>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search discussions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#1a0a2e] border border-[#2d1b4e] rounded-lg text-white text-sm"
        />
      </div>

      {/* Discussions */}
      <div className="space-y-3">
        {filteredDiscussions.map(discussion => {
          const discussionReplies = replies?.filter(r => r.parent_discussion_id === discussion.id) || [];
          return (
            <Card key={discussion.id} className="card-glow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">{discussion.student_name}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {}}
                    className="text-xs text-gray-400 hover:text-cyan-400"
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    {discussion.upvotes || 0}
                  </Button>
                </div>

                <p className="text-white text-sm mb-3">{discussion.discussion_text}</p>

                {/* Replies */}
                {discussionReplies.length > 0 && (
                  <div className="bg-[#0f0618]/50 rounded-lg p-3 mb-3 space-y-2 border-l-2 border-cyan-500/30">
                    <p className="text-xs text-gray-400 font-semibold">{discussionReplies.length} Replies</p>
                    {discussionReplies.slice(0, 2).map(reply => (
                      <div key={reply.id} className="text-xs">
                        <p className="text-cyan-300 font-semibold">{reply.student_name}</p>
                        <p className="text-gray-300">{reply.discussion_text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {showReplyForm === discussion.id ? (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="bg-[#1a0a2e] border-[#2d1b4e] text-white text-xs"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => postReply(discussion.id)}
                        className="btn-primary text-xs flex-1"
                      >
                        Reply
                      </Button>
                      <Button 
                        onClick={() => setShowReplyForm(null)}
                        variant="outline"
                        className="text-xs flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setShowReplyForm(discussion.id)}
                    variant="outline"
                    className="text-xs w-full"
                  >
                    <Reply className="w-3 h-3 mr-1" /> Reply
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}