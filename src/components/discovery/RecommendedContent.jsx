import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Target } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function RecommendedContent({ content, type, showScore = false }) {
    const navigate = useNavigate();

    if (type === "course" && content.course_data) {
        return (
            <div className="p-4 border-2 border-slate-200 rounded-lg hover:border-violet-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-slate-900">{content.course_data.title}</h4>
                            {showScore && content.relevance_score && (
                                <Badge className="bg-violet-100 text-violet-800">
                                    {Math.round(content.relevance_score * 100)}% match
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-slate-700 mb-3">{content.reason}</p>
                        
                        {content.skills_gained && content.skills_gained.length > 0 && (
                            <div className="mb-3">
                                <p className="text-xs font-semibold text-slate-600 mb-1">Skills you'll gain:</p>
                                <div className="flex flex-wrap gap-1">
                                    {content.skills_gained.map((skill, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {content.addresses_goals && content.addresses_goals.length > 0 && (
                            <div className="mb-3">
                                <p className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    Aligns with your goals:
                                </p>
                                <ul className="space-y-1">
                                    {content.addresses_goals.map((goal, idx) => (
                                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                                            <span>•</span>
                                            <span>{goal}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                    <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {content.course_data.lessons?.length || 0} lessons
                    </span>
                    <Badge variant="outline">{content.course_data.category}</Badge>
                    <Badge variant="outline">{content.course_data.level}</Badge>
                </div>

                <Button
                    onClick={() => navigate(createPageUrl("CourseViewer") + `?id=${content.course_data.id}`)}
                    className="w-full bg-violet-600 hover:bg-violet-700"
                >
                    View Course
                    <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 border border-slate-200 rounded-lg">
            <h4 className="font-semibold text-slate-900 mb-2">{content.course_title || content.title}</h4>
            <p className="text-sm text-slate-700">{content.reason || content.description}</p>
        </div>
    );
}