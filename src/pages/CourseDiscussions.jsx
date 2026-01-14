
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp, Reply, Send, Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CourseDiscussions() {
  const location = useLocation();
  const courseId = new URLSearchParams(location.search).get('id');
  
  const [course, setCourse] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiPrompts, setAiPrompts] = useState([]);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const courseData = await base44.entities.Course.get(courseId);
      setCourse(courseData);

      const discussionData = await base44.entities.CourseDiscussion.filter(
        { course_id: courseId },
        '-created_date'
      );
      setDiscussions(discussionData);
    } catch (error) {
      console.error('Error loading discussions:', error);
    }
    setIsLoading(false);
  };

  const generateAIPrompts = async () => {
    if (!course) return;
    setIsGeneratingPrompts(true);

    try {
      const prompt = `Generate 3 engaging discussion prompts for students taking the course "${course.title}".

Course Description: ${course.description}
Course Topics: ${course.lessons?.map(l => l.title).join(', ') || 'Various topics'}

Create prompts that:
- Encourage critical thinking
- Relate to real-world applications
- Spark debate and different perspectives
- Are open-ended and thought-provoking

Format as a JSON array of objects with "prompt" and "category" fields.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            prompts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  prompt: { type: "string" },
                  category: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAiPrompts(result.prompts || []);
    } catch (error) {
      console.error('Error generating prompts:', error);
    }
    setIsGeneratingPrompts(false);
  };

  // Safe refactor: Renamed from useAIPrompt to avoid React Hook naming convention
  // This is a regular callback function, not a React Hook
  const applyAIPrompt = (prompt) => {
    setNewMessage(prompt);
    setAiPrompts([]);
  };

  const handlePostMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await base44.entities.CourseDiscussion.create({
        course_id: courseId,
        author_email: user.email,
        author_name: user.full_name,
        author_avatar: user.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
        message: newMessage,
        parent_id: replyingTo,
        is_instructor_response: course.created_by === user.email
      });

      setNewMessage('');
      setReplyingTo(null);
      loadData();
    } catch (error) {
      console.error('Error posting message:', error);
    }
  };

  const handleLike = async (discussionId, currentLikes, likedBy) => {
    const hasLiked = likedBy?.includes(user.email);
    const newLikedBy = hasLiked
      ? likedBy.filter(email => email !== user.email)
      : [...(likedBy || []), user.email];

    try {
      await base44.entities.CourseDiscussion.update(discussionId, {
        likes_count: hasLiked ? currentLikes - 1 : currentLikes + 1,
        liked_by: newLikedBy
      });
      loadData();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Course not found</p>
      </div>
    );
  }

  const topLevelDiscussions = discussions.filter(d => !d.parent_id);
  const getReplies = (parentId) => discussions.filter(d => d.parent_id === parentId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Course Discussions</h1>
          <p className="text-slate-600">{course?.title}</p>
        </div>

        {/* AI Discussion Prompts */}
        {aiPrompts.length === 0 ? (
          <Card className="border-0 shadow-lg mb-6 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Need discussion ideas?</h3>
                    <p className="text-sm text-slate-600">Get AI-generated prompts to start engaging conversations</p>
                  </div>
                </div>
                <Button
                  onClick={generateAIPrompts}
                  disabled={isGeneratingPrompts}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {isGeneratingPrompts ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get AI Prompts
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                AI-Generated Discussion Prompts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiPrompts.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <Badge className="mb-2 bg-purple-100 text-purple-700">{item.category}</Badge>
                      <p className="text-slate-700">{item.prompt}</p>
                    </div>
                    <Button
                      onClick={() => applyAIPrompt(item.prompt)}
                      size="sm"
                      variant="outline"
                    >
                      Use This
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                onClick={() => setAiPrompts([])}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                Hide Prompts
              </Button>
            </CardContent>
          </Card>
        )}

        {/* New Post */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Start a Discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {replyingTo && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Reply className="w-4 h-4" />
                Replying to a message
                <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
              </div>
            )}
            <Textarea
              placeholder="Ask a question, share an insight, or start a discussion..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={4}
            />
            <Button onClick={handlePostMessage} disabled={!newMessage.trim()} className="bg-purple-500 hover:bg-purple-600">
              <Send className="w-4 h-4 mr-2" />
              Post Message
            </Button>
          </CardContent>
        </Card>

        {/* Discussion List */}
        <div className="space-y-4">
          {topLevelDiscussions.map(discussion => (
            <DiscussionItem
              key={discussion.id}
              discussion={discussion}
              replies={getReplies(discussion.id)}
              onLike={handleLike}
              onReply={setReplyingTo}
              currentUser={user}
              isInstructor={course.created_by === discussion.author_email}
            />
          ))}

          {topLevelDiscussions.length === 0 && (
            <Card className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No discussions yet. Be the first to start one!</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function DiscussionItem({ discussion, replies, onLike, onReply, currentUser, isInstructor }) {
  const hasLiked = discussion.liked_by?.includes(currentUser.email);

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src={discussion.author_avatar} />
            <AvatarFallback>{discussion.author_name?.[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-slate-800">{discussion.author_name}</span>
              {discussion.is_instructor_response && (
                <Badge variant="secondary" className="text-xs">Instructor</Badge>
              )}
              <span className="text-xs text-slate-500">
                {formatDistanceToNow(new Date(discussion.created_date), { addSuffix: true })}
              </span>
            </div>
            
            <p className="text-slate-700 mb-3 whitespace-pre-wrap">{discussion.message}</p>
            
            <div className="flex items-center gap-4 text-sm">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onLike(discussion.id, discussion.likes_count || 0, discussion.liked_by)}
                className={hasLiked ? 'text-purple-600' : 'text-slate-600'}
              >
                <ThumbsUp className={`w-4 h-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
                {discussion.likes_count || 0}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReply(discussion.id)}
                className="text-slate-600"
              >
                <Reply className="w-4 h-4 mr-1" />
                Reply
              </Button>
            </div>

            {/* Replies */}
            {replies.length > 0 && (
              <div className="mt-4 pl-4 border-l-2 border-slate-200 space-y-3">
                {replies.map(reply => (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={reply.author_avatar} />
                      <AvatarFallback>{reply.author_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{reply.author_name}</span>
                        {reply.is_instructor_response && (
                          <Badge variant="secondary" className="text-xs">Instructor</Badge>
                        )}
                        <span className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(reply.created_date), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{reply.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
