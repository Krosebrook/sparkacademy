import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Bot, User as UserIcon, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AIMentorChat({ session, userEmail, onUpdateSession }) {
    const [messages, setMessages] = useState(session?.messages || []);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = {
            role: "user",
            content: input.trim(),
            timestamp: new Date().toISOString()
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        setIsLoading(true);

        try {
            const [enrollments, courses, careerPaths, goals] = await Promise.all([
                base44.entities.Enrollment.filter({ student_email: userEmail }),
                base44.entities.Course.list(),
                base44.entities.CareerPath.filter({ user_email: userEmail }),
                base44.entities.LearningGoal.filter({ user_email: userEmail })
            ]);

            const completedCourses = enrollments
                .filter(e => e.completion_percentage === 100)
                .map(e => courses.find(c => c.id === e.course_id))
                .filter(Boolean);

            const inProgressCourses = enrollments
                .filter(e => e.completion_percentage > 0 && e.completion_percentage < 100)
                .map(e => {
                    const course = courses.find(c => c.id === e.course_id);
                    return course ? { ...course, progress: e.completion_percentage } : null;
                })
                .filter(Boolean);

            const avgQuizScore = enrollments
                .flatMap(e => e.progress || [])
                .filter(p => p.quiz_score)
                .reduce((sum, p, _, arr) => sum + p.quiz_score / arr.length, 0) || 0;

            const latestCareerPath = careerPaths.sort((a, b) => 
                new Date(b.created_date) - new Date(a.created_date)
            )[0];

            const activeGoals = goals.filter(g => g.status === "active");

            const conversationHistory = updatedMessages.slice(-5).map(m => 
                `${m.role === "user" ? "Student" : "Mentor"}: ${m.content}`
            ).join("\n");

            const mentorPrompt = `You are an experienced AI learning mentor providing personalized guidance to a student.

STUDENT PROFILE:
- Completed Courses: ${completedCourses.map(c => c.title).join(", ") || "None yet"}
- In Progress: ${inProgressCourses.map(c => `${c.title} (${c.progress}%)`).join(", ") || "None"}
- Average Quiz Score: ${avgQuizScore.toFixed(1)}%
- Career Goal: ${latestCareerPath?.target_role || "Not set"}
- Skill Gaps: ${latestCareerPath?.required_skills?.map(s => s.skill).join(", ") || "None identified"}
- Active Learning Goals: ${activeGoals.map(g => g.title).join(", ") || "None"}

CONVERSATION CONTEXT:
${conversationHistory}

CURRENT QUESTION:
${userMessage.content}

Provide personalized, actionable guidance that:
1. References their specific learning history and progress
2. Addresses their career goals and skill gaps
3. Offers concrete next steps and recommendations
4. Is encouraging and supportive
5. Suggests specific courses or resources when relevant

Be conversational, empathetic, and practical. Keep responses focused and under 300 words.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: mentorPrompt,
                add_context_from_internet: false
            });

            const mentorMessage = {
                role: "mentor",
                content: response,
                timestamp: new Date().toISOString()
            };

            const finalMessages = [...updatedMessages, mentorMessage];
            setMessages(finalMessages);

            await base44.entities.MentorSession.update(session.id, {
                messages: finalMessages
            });

            if (onUpdateSession) onUpdateSession();
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-12">
                        <Bot className="h-16 w-16 mx-auto mb-4 text-violet-400" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Welcome to Your AI Mentor
                        </h3>
                        <p className="text-slate-600 text-sm">
                            Ask me anything about your courses, career path, or skill development
                        </p>
                    </div>
                )}

                {messages.map((message, idx) => (
                    <div key={idx} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        {message.role === "mentor" && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.role === "user" 
                                ? "bg-violet-600 text-white" 
                                : "bg-slate-100 text-slate-900"
                        }`}>
                            {message.role === "mentor" ? (
                                <ReactMarkdown className="prose prose-sm max-w-none prose-violet">
                                    {message.content}
                                </ReactMarkdown>
                            ) : (
                                <p className="text-sm">{message.content}</p>
                            )}
                        </div>
                        {message.role === "user" && (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                <UserIcon className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-slate-100 rounded-2xl px-4 py-3">
                            <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4 bg-white">
                <div className="flex gap-2">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Ask your mentor anything..."
                        className="resize-none"
                        rows={2}
                        disabled={isLoading}
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}