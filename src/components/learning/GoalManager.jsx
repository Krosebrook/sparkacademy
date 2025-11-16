import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target, Plus, Calendar, CheckCircle, Loader2, Trophy, TrendingUp } from "lucide-react";

export default function GoalManager({ userEmail }) {
    const [goals, setGoals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNewGoal, setShowNewGoal] = useState(false);
    const [newGoal, setNewGoal] = useState({
        title: "",
        description: "",
        target_skills: "",
        target_date: ""
    });

    useEffect(() => {
        loadGoals();
    }, [userEmail]);

    const loadGoals = async () => {
        setIsLoading(true);
        const data = await base44.entities.LearningGoal.filter({ user_email: userEmail });
        setGoals(data);
        setIsLoading(false);
    };

    const createGoal = async () => {
        const skills = newGoal.target_skills.split(",").map(s => s.trim());
        
        await base44.entities.LearningGoal.create({
            user_email: userEmail,
            title: newGoal.title,
            description: newGoal.description,
            target_skills: skills,
            target_date: newGoal.target_date,
            status: "active",
            progress_percentage: 0
        });

        setShowNewGoal(false);
        setNewGoal({ title: "", description: "", target_skills: "", target_date: "" });
        loadGoals();
    };

    const completeGoal = async (goalId) => {
        await base44.entities.LearningGoal.update(goalId, {
            status: "completed",
            progress_percentage: 100
        });
        loadGoals();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Target className="h-5 w-5 text-violet-600" />
                    My Learning Goals
                </h3>
                <Dialog open={showNewGoal} onOpenChange={setShowNewGoal}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                            <Plus className="h-4 w-4 mr-2" />
                            New Goal
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Learning Goal</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Goal Title</label>
                                <Input
                                    value={newGoal.title}
                                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                                    placeholder="e.g., Master React Development"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Description</label>
                                <Textarea
                                    value={newGoal.description}
                                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                                    placeholder="Describe your learning goal..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Target Skills (comma-separated)</label>
                                <Input
                                    value={newGoal.target_skills}
                                    onChange={(e) => setNewGoal({...newGoal, target_skills: e.target.value})}
                                    placeholder="React, JavaScript, State Management"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Target Date</label>
                                <Input
                                    type="date"
                                    value={newGoal.target_date}
                                    onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                                />
                            </div>
                            <Button
                                onClick={createGoal}
                                disabled={!newGoal.title || !newGoal.target_skills}
                                className="w-full bg-violet-600 hover:bg-violet-700"
                            >
                                Create Goal
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {goals.length === 0 ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-8 text-center">
                        <Target className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-600 mb-4">No learning goals yet</p>
                        <Button onClick={() => setShowNewGoal(true)} variant="outline">
                            Set Your First Goal
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {goals.map(goal => (
                        <Card key={goal.id} className="border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-bold text-slate-900 mb-1">{goal.title}</h4>
                                        <p className="text-sm text-slate-600 mb-3">{goal.description}</p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {goal.target_skills?.map((skill, idx) => (
                                                <Badge key={idx} variant="secondary">{skill}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <Badge className={
                                        goal.status === "completed" ? "bg-green-100 text-green-800" :
                                        goal.status === "paused" ? "bg-amber-100 text-amber-800" :
                                        "bg-blue-100 text-blue-800"
                                    }>
                                        {goal.status}
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-slate-700">Progress</span>
                                            <span className="text-sm font-bold text-violet-600">{goal.progress_percentage}%</span>
                                        </div>
                                        <Progress value={goal.progress_percentage} className="h-2" />
                                    </div>

                                    {goal.target_date && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Calendar className="h-4 w-4" />
                                            Target: {new Date(goal.target_date).toLocaleDateString()}
                                        </div>
                                    )}

                                    {goal.milestones && goal.milestones.length > 0 && (
                                        <div className="pt-3 border-t">
                                            <p className="text-sm font-semibold text-slate-700 mb-2">Milestones</p>
                                            <div className="space-y-1">
                                                {goal.milestones.map((milestone, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                                        {milestone.completed ? (
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
                                                        )}
                                                        <span className={milestone.completed ? "text-slate-500 line-through" : "text-slate-700"}>
                                                            {milestone.title}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {goal.status === "active" && goal.progress_percentage < 100 && (
                                        <Button
                                            onClick={() => completeGoal(goal.id)}
                                            size="sm"
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Trophy className="h-4 w-4 mr-2" />
                                            Mark as Completed
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}