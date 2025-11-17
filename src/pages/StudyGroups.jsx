import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Users as UsersIcon, MessageSquare } from "lucide-react";
import StudyGroupCard from "@/components/collaboration/StudyGroupCard";
import StudyGroupChat from "@/components/collaboration/StudyGroupChat";

export default function StudyGroups() {
    const [user, setUser] = useState(null);
    const [groups, setGroups] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newGroup, setNewGroup] = useState({
        name: "",
        description: "",
        course_id: "",
        max_members: 10,
        is_public: true,
        meeting_schedule: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const userData = await base44.auth.me();
            setUser(userData);

            const [allGroups, allCourses] = await Promise.all([
                base44.entities.StudyGroup.list(),
                base44.entities.Course.filter({ is_published: true })
            ]);

            setGroups(allGroups);
            setCourses(allCourses);
            setMyGroups(allGroups.filter(g => 
                g.members?.some(m => m.email === userData.email)
            ));
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const createGroup = async () => {
        if (!newGroup.name || !newGroup.course_id) return;

        try {
            await base44.entities.StudyGroup.create({
                ...newGroup,
                creator_email: user.email,
                members: [{
                    email: user.email,
                    name: user.full_name,
                    joined_date: new Date().toISOString(),
                    role: "admin"
                }],
                chat_messages: [],
                shared_resources: []
            });

            setShowCreateDialog(false);
            setNewGroup({
                name: "",
                description: "",
                course_id: "",
                max_members: 10,
                is_public: true,
                meeting_schedule: ""
            });
            loadData();
        } catch (error) {
            console.error("Error creating group:", error);
        }
    };

    const joinGroup = async (group) => {
        try {
            const updatedMembers = [
                ...(group.members || []),
                {
                    email: user.email,
                    name: user.full_name,
                    joined_date: new Date().toISOString(),
                    role: "member"
                }
            ];

            await base44.entities.StudyGroup.update(group.id, {
                members: updatedMembers
            });

            loadData();
        } catch (error) {
            console.error("Error joining group:", error);
        }
    };

    const sendMessage = async (message) => {
        if (!selectedGroup) return;

        try {
            const newMessage = {
                sender_email: user.email,
                sender_name: user.full_name,
                message,
                timestamp: new Date().toISOString()
            };

            await base44.entities.StudyGroup.update(selectedGroup.id, {
                chat_messages: [...(selectedGroup.chat_messages || []), newMessage]
            });

            setSelectedGroup({
                ...selectedGroup,
                chat_messages: [...(selectedGroup.chat_messages || []), newMessage]
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    if (selectedGroup) {
        const course = courses.find(c => c.id === selectedGroup.course_id);
        
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6">
                <div className="max-w-5xl mx-auto">
                    <Button variant="outline" onClick={() => setSelectedGroup(null)} className="mb-4">
                        ← Back to Groups
                    </Button>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <div>
                                <CardTitle className="text-2xl mb-2">{selectedGroup.name}</CardTitle>
                                <p className="text-slate-600">{selectedGroup.description}</p>
                                <p className="text-sm text-violet-600 mt-2">Course: {course?.title}</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="chat">
                                <TabsList>
                                    <TabsTrigger value="chat">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Chat
                                    </TabsTrigger>
                                    <TabsTrigger value="members">
                                        <UsersIcon className="h-4 w-4 mr-2" />
                                        Members ({selectedGroup.members?.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="chat">
                                    <StudyGroupChat 
                                        group={selectedGroup}
                                        currentUser={user}
                                        onSendMessage={sendMessage}
                                    />
                                </TabsContent>

                                <TabsContent value="members">
                                    <div className="space-y-2">
                                        {selectedGroup.members?.map((member, idx) => (
                                            <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-slate-900">{member.name}</p>
                                                    <p className="text-xs text-slate-600">{member.email}</p>
                                                </div>
                                                {member.role === "admin" && (
                                                    <span className="text-xs bg-violet-600 text-white px-2 py-1 rounded">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-2">Study Groups</h1>
                            <p className="text-slate-600">
                                Join or create study groups to learn together
                            </p>
                        </div>
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Group
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Study Group</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold mb-2 block">Group Name</label>
                                        <Input
                                            value={newGroup.name}
                                            onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                                            placeholder="e.g., JavaScript Study Buddies"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold mb-2 block">Description</label>
                                        <Textarea
                                            value={newGroup.description}
                                            onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                                            placeholder="What will you study together?"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold mb-2 block">Course</label>
                                        <Select value={newGroup.course_id} onValueChange={(value) => setNewGroup({...newGroup, course_id: value})}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a course" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courses.map(course => (
                                                    <SelectItem key={course.id} value={course.id}>
                                                        {course.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={createGroup} className="w-full">
                                        Create Group
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Tabs defaultValue="all" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="all">All Groups</TabsTrigger>
                        <TabsTrigger value="my">My Groups ({myGroups.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groups.map(group => (
                                <StudyGroupCard
                                    key={group.id}
                                    group={group}
                                    currentUserEmail={user.email}
                                    onJoin={joinGroup}
                                    onView={setSelectedGroup}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="my">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myGroups.map(group => (
                                <StudyGroupCard
                                    key={group.id}
                                    group={group}
                                    currentUserEmail={user.email}
                                    onJoin={joinGroup}
                                    onView={setSelectedGroup}
                                />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}