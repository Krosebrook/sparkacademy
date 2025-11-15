import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, ThumbsUp, Reply, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function CourseDiscussions({ courseId, currentUser }) {
    const [discussions, setDiscussions] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDiscussions();
    }, [courseId]);

    const loadDiscussions = async () => {
        try {
            const allDiscussions = await base44.entities.CourseDiscussion.filter(
                { course_id: courseId },
                '-created_date'
            );
            setDiscussions(allDiscussions);
        } catch (error) {
            console.error("Error loading discussions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePost = async () => {
        if (!newMessage.trim()) return;

        try {
            await base44.entities.CourseDiscussion.create({
                course_id: courseId,
                author_email: currentUser.email,
                author_name: currentUser.full_name,
                author_avatar: currentUser.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`,
                message: newMessage,
                parent_id: replyTo?.id || null,
                likes_count: 0,
                liked_by: []
            });
            setNewMessage("");
            setReplyTo(null);
            loadDiscussions();
        } catch (error) {
            console.error("Error posting discussion:", error);
        }
    };

    const handleLike = async (discussion) => {
        try {
            const liked = discussion.liked_by?.includes(currentUser.email);
            const updatedLikedBy = liked
                ? discussion.liked_by.filter(email => email !== currentUser.email)
                : [...(discussion.liked_by || []), currentUser.email];

            await base44.entities.CourseDiscussion.update(discussion.id, {
                liked_by: updatedLikedBy,
                likes_count: updatedLikedBy.length
            });
            loadDiscussions();
        } catch (error) {
            console.error("Error liking discussion:", error);
        }
    };

    const topLevelDiscussions = discussions.filter(d => !d.parent_id);
    const getReplies = (parentId) => discussions.filter(d => d.parent_id === parentId);

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-slate-100">
                    <CardTitle className="flex items-center gap-3">
                        <MessageCircle className="h-6 w-6 text-violet-600" />
                        Course Discussions
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {/* New Post */}
                    <div className="mb-6">
                        {replyTo && (
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-blue-700 font-medium">
                                        Replying to {replyTo.author_name}
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setReplyTo(null)}
                                        className="h-6 text-xs"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                                <p className="text-sm text-slate-600 line-clamp-2">{replyTo.message}</p>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={currentUser.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`} />
                                <AvatarFallback>{currentUser.full_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <Textarea
                                    placeholder={replyTo ? "Write your reply..." : "Share your thoughts, ask questions..."}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="min-h-24 resize-none"
                                />
                                <div className="flex justify-end mt-2">
                                    <Button
                                        onClick={handlePost}
                                        disabled={!newMessage.trim()}
                                        className="bg-gradient-to-r from-violet-600 to-purple-600"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        {replyTo ? "Reply" : "Post"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Discussions List */}
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-500">Loading discussions...</div>
                    ) : topLevelDiscussions.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600">No discussions yet. Be the first to start a conversation!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {topLevelDiscussions.map((discussion) => (
                                <DiscussionItem
                                    key={discussion.id}
                                    discussion={discussion}
                                    replies={getReplies(discussion.id)}
                                    currentUser={currentUser}
                                    onLike={handleLike}
                                    onReply={setReplyTo}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function DiscussionItem({ discussion, replies, currentUser, onLike, onReply }) {
    const isLiked = discussion.liked_by?.includes(currentUser.email);

    return (
        <div>
            <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={discussion.author_avatar} />
                    <AvatarFallback>{discussion.author_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-slate-900">{discussion.author_name}</span>
                        {discussion.is_instructor_response && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                                <Star className="h-3 w-3 mr-1" />
                                Instructor
                            </Badge>
                        )}
                        <span className="text-sm text-slate-500">
                            {formatDistanceToNow(new Date(discussion.created_date), { addSuffix: true })}
                        </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed mb-3">{discussion.message}</p>
                    <div className="flex items-center gap-4">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onLike(discussion)}
                            className={isLiked ? "text-violet-600" : "text-slate-600"}
                        >
                            <ThumbsUp className={`h-4 w-4 mr-1 ${isLiked ? "fill-violet-600" : ""}`} />
                            {discussion.likes_count || 0}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onReply(discussion)}
                            className="text-slate-600"
                        >
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                        </Button>
                    </div>

                    {/* Replies */}
                    {replies.length > 0 && (
                        <div className="mt-4 ml-6 space-y-4 border-l-2 border-slate-200 pl-4">
                            {replies.map((reply) => (
                                <div key={reply.id} className="flex gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={reply.author_avatar} />
                                        <AvatarFallback>{reply.author_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-sm text-slate-900">{reply.author_name}</span>
                                            {reply.is_instructor_response && (
                                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                                                    Instructor
                                                </Badge>
                                            )}
                                            <span className="text-xs text-slate-500">
                                                {formatDistanceToNow(new Date(reply.created_date), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed mb-2">{reply.message}</p>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onLike(reply)}
                                            className={`h-7 text-xs ${reply.liked_by?.includes(currentUser.email) ? "text-violet-600" : "text-slate-600"}`}
                                        >
                                            <ThumbsUp className={`h-3 w-3 mr-1 ${reply.liked_by?.includes(currentUser.email) ? "fill-violet-600" : ""}`} />
                                            {reply.likes_count || 0}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}