import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Shield, Trash2, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AIModeration({ courseId }) {
    const [discussions, setDiscussions] = useState([]);
    const [flaggedContent, setFlaggedContent] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        loadDiscussions();
    }, [courseId]);

    const loadDiscussions = async () => {
        const data = await base44.entities.CourseDiscussion.filter({ course_id: courseId });
        setDiscussions(data);
    };

    const moderateDiscussions = async () => {
        setIsAnalyzing(true);
        try {
            const recentDiscussions = discussions.slice(0, 50);
            
            const discussionTexts = recentDiscussions.map(d => 
                `ID: ${d.id}\nAuthor: ${d.author_name}\nMessage: ${d.message}`
            ).join("\n\n---\n\n");

            const prompt = `Analyze these discussion forum posts for moderation purposes:

${discussionTexts}

Identify and flag content that:
1. Contains inappropriate language, harassment, or hate speech
2. Includes spam or promotional content
3. Contains plagiarism or academic dishonesty indicators
4. Is off-topic or disruptive
5. Violates basic forum etiquette

For each flagged post, provide:
- Post ID
- Severity (low/medium/high)
- Reason for flagging
- Recommended action
- Suggested response to the user`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        flagged_posts: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    post_id: { type: "string" },
                                    severity: { 
                                        type: "string",
                                        enum: ["low", "medium", "high"]
                                    },
                                    reason: { type: "string" },
                                    category: { 
                                        type: "string",
                                        enum: ["inappropriate", "spam", "dishonesty", "off-topic", "etiquette"]
                                    },
                                    recommended_action: { type: "string" },
                                    suggested_response: { type: "string" }
                                }
                            }
                        },
                        summary: { type: "string" }
                    }
                }
            });

            setFlaggedContent(result.flagged_posts || []);
        } catch (error) {
            console.error("Error moderating discussions:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const deletePost = async (postId) => {
        await base44.entities.CourseDiscussion.delete(postId);
        setFlaggedContent(prev => prev.filter(f => f.post_id !== postId));
        loadDiscussions();
    };

    const dismissFlag = (postId) => {
        setFlaggedContent(prev => prev.filter(f => f.post_id !== postId));
    };

    const getSeverityColor = (severity) => {
        const colors = {
            low: "bg-yellow-100 text-yellow-800",
            medium: "bg-orange-100 text-orange-800",
            high: "bg-red-100 text-red-800"
        };
        return colors[severity] || "bg-slate-100 text-slate-800";
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-violet-600" />
                        AI Moderation
                    </CardTitle>
                    <Button
                        onClick={moderateDiscussions}
                        disabled={isAnalyzing}
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Shield className="w-4 h-4 mr-2" />
                                Run Moderation
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {flaggedContent.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                        <p className="text-slate-600">No flagged content</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {flaggedContent.map((flag, idx) => {
                            const post = discussions.find(d => d.id === flag.post_id);
                            if (!post) return null;

                            return (
                                <div key={idx} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                            <Badge className={getSeverityColor(flag.severity)}>
                                                {flag.severity} severity
                                            </Badge>
                                            <Badge variant="outline">{flag.category}</Badge>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <p className="text-sm font-semibold text-slate-900 mb-1">
                                            {post.author_name}
                                        </p>
                                        <p className="text-sm text-slate-700 bg-white p-2 rounded">
                                            {post.message}
                                        </p>
                                    </div>

                                    <div className="space-y-2 mb-3">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-700 mb-1">Reason:</p>
                                            <p className="text-sm text-slate-600">{flag.reason}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-700 mb-1">Recommended Action:</p>
                                            <p className="text-sm text-slate-600">{flag.recommended_action}</p>
                                        </div>
                                    </div>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="w-full mb-2">
                                                View Suggested Response
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Suggested Response</DialogTitle>
                                            </DialogHeader>
                                            <div className="p-4 bg-slate-50 rounded-lg">
                                                <p className="text-sm text-slate-700">{flag.suggested_response}</p>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => deletePost(post.id)}
                                            size="sm"
                                            variant="destructive"
                                            className="flex-1"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Post
                                        </Button>
                                        <Button
                                            onClick={() => dismissFlag(post.id)}
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            Dismiss Flag
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}