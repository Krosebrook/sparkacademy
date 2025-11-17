import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Lock, Globe } from "lucide-react";

export default function StudyGroupCard({ group, onJoin, onView, currentUserEmail }) {
    const isMember = group.members?.some(m => m.email === currentUserEmail);
    const isFull = group.members?.length >= group.max_members;

    return (
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{group.name}</CardTitle>
                        <p className="text-sm text-slate-600">{group.description}</p>
                    </div>
                    <div>
                        {group.is_public ? (
                            <Globe className="h-4 w-4 text-green-600" />
                        ) : (
                            <Lock className="h-4 w-4 text-slate-400" />
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{group.members?.length || 0}/{group.max_members}</span>
                        </div>
                        {group.meeting_schedule && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{group.meeting_schedule}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {isMember ? (
                            <Button onClick={() => onView(group)} className="w-full">
                                Open Group
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => onJoin(group)} 
                                disabled={isFull}
                                variant={isFull ? "outline" : "default"}
                                className="w-full"
                            >
                                {isFull ? "Group Full" : "Join Group"}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}