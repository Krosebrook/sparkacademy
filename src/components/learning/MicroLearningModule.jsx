import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Target, Star, ChevronDown, ChevronUp } from "lucide-react";

export default function MicroLearningModule({ module, skill, isCompleted, onComplete }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className={`border-2 ${isCompleted ? 'bg-green-50 border-green-300' : 'border-violet-200'}`}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
                            <h4 className="font-bold text-slate-900">{module.title}</h4>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{module.description}</p>
                        <div className="flex items-center gap-3 text-xs">
                            <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                {module.duration_minutes} min
                            </Badge>
                            <Badge className="bg-violet-100 text-violet-800">
                                <Star className="h-3 w-3 mr-1" />
                                {module.points_reward} pts
                            </Badge>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>

                {isExpanded && (
                    <div className="space-y-4 pt-4 border-t">
                        <div>
                            <h5 className="font-semibold text-slate-900 mb-2 flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                Learning Objectives
                            </h5>
                            <ul className="text-sm text-slate-700 space-y-1">
                                {module.learning_objectives?.map((obj, idx) => (
                                    <li key={idx}>• {obj}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-semibold text-slate-900 mb-2">Topics Covered</h5>
                            <div className="flex flex-wrap gap-2">
                                {module.topics?.map((topic, idx) => (
                                    <Badge key={idx} variant="secondary">{topic}</Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h5 className="font-semibold text-slate-900 mb-2">Practice Exercise</h5>
                            <p className="text-sm text-slate-700 p-3 bg-slate-50 rounded border border-slate-200">
                                {module.exercise}
                            </p>
                        </div>

                        <div>
                            <h5 className="font-semibold text-slate-900 mb-2">Assessment</h5>
                            <p className="text-sm text-slate-700">{module.assessment}</p>
                        </div>

                        {!isCompleted && (
                            <Button
                                onClick={onComplete}
                                className="w-full bg-violet-600 hover:bg-violet-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Complete & Earn {module.points_reward} Points
                            </Button>
                        )}

                        {isCompleted && (
                            <div className="text-center py-2 text-green-700 font-semibold">
                                <CheckCircle className="h-5 w-5 inline mr-2" />
                                Completed!
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}