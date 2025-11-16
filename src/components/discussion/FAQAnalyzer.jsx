import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, HelpCircle, Send, MessageCircle, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function FAQAnalyzer({ courseId }) {
    const [discussions, setDiscussions] = useState([]);
    const [faqs, setFaqs] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        loadDiscussions();
    }, [courseId]);

    const loadDiscussions = async () => {
        const data = await base44.entities.CourseDiscussion.filter({ course_id: courseId });
        setDiscussions(data);
    };

    const analyzeFAQs = async () => {
        setIsAnalyzing(true);
        try {
            const discussionTexts = discussions
                .map(d => d.message)
                .join("\n\n");

            const prompt = `Analyze these discussion forum messages and identify frequently asked questions:

${discussionTexts}

Extract and categorize:
1. Most common questions (at least 5-10)
2. Question frequency/importance
3. Themes/categories
4. Suggested comprehensive answers for each question
5. Related topics students might ask about next

For each FAQ provide:
- Question text
- Frequency indicator (very common, common, occasional)
- Category
- Detailed answer suggestion
- Keywords for matching similar questions`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        frequently_asked: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    question: { type: "string" },
                                    frequency: { 
                                        type: "string",
                                        enum: ["very_common", "common", "occasional"]
                                    },
                                    category: { type: "string" },
                                    suggested_answer: { type: "string" },
                                    keywords: { type: "array", items: { type: "string" } },
                                    count: { type: "number" }
                                }
                            }
                        },
                        themes: { type: "array", items: { type: "string" } },
                        related_topics: { type: "array", items: { type: "string" } }
                    }
                }
            });

            setFaqs(result);
        } catch (error) {
            console.error("Error analyzing FAQs:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const postAnswerToForum = async (faq) => {
        const user = await base44.auth.me();
        await base44.entities.CourseDiscussion.create({
            course_id: courseId,
            author_email: user.email,
            author_name: user.full_name,
            author_avatar: user.profile_picture_url,
            message: `**FAQ: ${faq.question}**\n\n${faq.suggested_answer}`,
            is_instructor_response: true
        });
        alert("Answer posted to discussion forum!");
    };

    const getFrequencyColor = (frequency) => {
        const colors = {
            very_common: "bg-red-100 text-red-800",
            common: "bg-amber-100 text-amber-800",
            occasional: "bg-blue-100 text-blue-800"
        };
        return colors[frequency] || "bg-slate-100 text-slate-800";
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-violet-600" />
                        FAQ Analyzer
                    </CardTitle>
                    <Button
                        onClick={analyzeFAQs}
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
                                <Sparkles className="w-4 h-4 mr-2" />
                                Analyze FAQs
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {!faqs ? (
                    <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-slate-600">Click analyze to identify frequently asked questions</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {faqs.themes && faqs.themes.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-slate-900 mb-2">Common Themes</h4>
                                <div className="flex flex-wrap gap-2">
                                    {faqs.themes.map((theme, idx) => (
                                        <Badge key={idx} variant="secondary">{theme}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3">Frequently Asked Questions</h4>
                            <div className="space-y-3">
                                {faqs.frequently_asked?.map((faq, idx) => (
                                    <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-slate-900 mb-2">{faq.question}</h5>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    <Badge className={getFrequencyColor(faq.frequency)}>
                                                        {faq.frequency.replace('_', ' ')}
                                                    </Badge>
                                                    <Badge variant="outline">{faq.category}</Badge>
                                                    <Badge variant="secondary">Asked ~{faq.count} times</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <p className="text-xs font-semibold text-slate-700 mb-1">Suggested Answer:</p>
                                            <div className="p-3 bg-slate-50 rounded text-sm text-slate-700">
                                                {faq.suggested_answer}
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <p className="text-xs font-semibold text-slate-700 mb-1">Keywords:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {faq.keywords?.map((keyword, kidx) => (
                                                    <Badge key={kidx} variant="outline" className="text-xs">
                                                        {keyword}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="outline" className="w-full">
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Post Answer to Forum
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Post Answer to Forum</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-700 mb-2">Question:</p>
                                                        <p className="text-sm text-slate-900 mb-4">{faq.question}</p>
                                                        <p className="text-sm font-semibold text-slate-700 mb-2">Your Answer:</p>
                                                        <Textarea
                                                            defaultValue={faq.suggested_answer}
                                                            className="min-h-40"
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={() => postAnswerToForum(faq)}
                                                        className="w-full bg-violet-600 hover:bg-violet-700"
                                                    >
                                                        Post Answer
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {faqs.related_topics && faqs.related_topics.length > 0 && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-semibold text-blue-900 mb-2">Related Topics Students May Ask About</h4>
                                <ul className="space-y-1">
                                    {faqs.related_topics.map((topic, idx) => (
                                        <li key={idx} className="text-sm text-slate-700">• {topic}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <Button onClick={() => setFaqs(null)} variant="outline" className="w-full">
                            Reanalyze
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}