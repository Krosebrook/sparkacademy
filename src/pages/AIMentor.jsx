import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MessageSquare, Plus, Bot, Sparkles } from "lucide-react";
import AIMentorChat from "@/components/mentor/AIMentorChat";

export default function AIMentor() {
    const [user, setUser] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
    const [newSessionTitle, setNewSessionTitle] = useState("");
    const [newSessionTopic, setNewSessionTopic] = useState("general");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const userData = await base44.auth.me();
            setUser(userData);

            const userSessions = await base44.entities.MentorSession.filter({ 
                user_email: userData.email 
            });
            setSessions(userSessions.sort((a, b) => 
                new Date(b.updated_date) - new Date(a.updated_date)
            ));

            if (userSessions.length > 0 && !activeSession) {
                setActiveSession(userSessions[0]);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const createSession = async () => {
        if (!newSessionTitle.trim()) return;

        try {
            const newSession = await base44.entities.MentorSession.create({
                user_email: user.email,
                session_title: newSessionTitle,
                topic: newSessionTopic,
                messages: [],
                is_active: true
            });

            setSessions([newSession, ...sessions]);
            setActiveSession(newSession);
            setShowNewSessionDialog(false);
            setNewSessionTitle("");
            setNewSessionTopic("general");
        } catch (error) {
            console.error("Error creating session:", error);
        }
    };

    const getTopicBadgeColor = (topic) => {
        const colors = {
            course_content: "bg-blue-100 text-blue-800",
            career_advice: "bg-green-100 text-green-800",
            skill_development: "bg-purple-100 text-purple-800",
            general: "bg-slate-100 text-slate-800"
        };
        return colors[topic] || colors.general;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Bot className="h-8 w-8 text-violet-600" />
                        AI Mentor
                    </h1>
                    <p className="text-slate-600">
                        Get personalized guidance on your learning journey, career path, and skill development
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Sessions</CardTitle>
                                    <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>New Mentorship Session</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                                                        Session Title
                                                    </label>
                                                    <Input
                                                        placeholder="e.g., Career transition advice"
                                                        value={newSessionTitle}
                                                        onChange={(e) => setNewSessionTitle(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-900 mb-2 block">
                                                        Topic
                                                    </label>
                                                    <Select value={newSessionTopic} onValueChange={setNewSessionTopic}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="general">General</SelectItem>
                                                            <SelectItem value="course_content">Course Content</SelectItem>
                                                            <SelectItem value="career_advice">Career Advice</SelectItem>
                                                            <SelectItem value="skill_development">Skill Development</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button onClick={createSession} className="w-full">
                                                    Create Session
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                                {sessions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <MessageSquare className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                        <p className="text-sm text-slate-600">No sessions yet</p>
                                    </div>
                                ) : (
                                    sessions.map((session) => (
                                        <button
                                            key={session.id}
                                            onClick={() => setActiveSession(session)}
                                            className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                                                activeSession?.id === session.id
                                                    ? "border-violet-400 bg-violet-50"
                                                    : "border-slate-200 hover:border-violet-200"
                                            }`}
                                        >
                                            <h4 className="font-semibold text-sm text-slate-900 mb-1">
                                                {session.session_title}
                                            </h4>
                                            <Badge className={getTopicBadgeColor(session.topic)}>
                                                {session.topic.replace(/_/g, " ")}
                                            </Badge>
                                            <p className="text-xs text-slate-600 mt-1">
                                                {session.messages?.length || 0} messages
                                            </p>
                                        </button>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-3">
                        {activeSession ? (
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="border-b">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Sparkles className="h-5 w-5 text-violet-600" />
                                                {activeSession.session_title}
                                            </CardTitle>
                                            <Badge className={`mt-2 ${getTopicBadgeColor(activeSession.topic)}`}>
                                                {activeSession.topic.replace(/_/g, " ")}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <AIMentorChat 
                                        session={activeSession} 
                                        userEmail={user.email}
                                        onUpdateSession={loadData}
                                    />
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-12 text-center">
                                    <Bot className="h-16 w-16 mx-auto mb-4 text-violet-300" />
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                        Start a Mentorship Session
                                    </h3>
                                    <p className="text-slate-600 mb-6">
                                        Create a new session to get personalized guidance from your AI mentor
                                    </p>
                                    <Button onClick={() => setShowNewSessionDialog(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Session
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}