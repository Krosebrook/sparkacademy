import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Briefcase, TrendingUp, CheckCircle, Clock, DollarSign, BookOpen, Target, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function CareerRoadmap({ careerPath, roleAnalysis }) {
    const navigate = useNavigate();

    const getSkillGapColor = (gap) => {
        if (gap.toLowerCase().includes("none") || gap.toLowerCase().includes("already")) {
            return "bg-green-100 text-green-800";
        }
        if (gap.toLowerCase().includes("small") || gap.toLowerCase().includes("minor")) {
            return "bg-blue-100 text-blue-800";
        }
        if (gap.toLowerCase().includes("significant") || gap.toLowerCase().includes("large")) {
            return "bg-red-100 text-red-800";
        }
        return "bg-amber-100 text-amber-800";
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: "bg-red-100 text-red-800 border-red-300",
            medium: "bg-amber-100 text-amber-800 border-amber-300",
            low: "bg-blue-100 text-blue-800 border-blue-300"
        };
        return colors[priority] || "bg-slate-100 text-slate-800 border-slate-300";
    };

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-50">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">{careerPath.target_role}</h2>
                            <p className="text-slate-600">{roleAnalysis?.description}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-violet-600 mb-1">{careerPath.readiness_score}%</div>
                            <p className="text-sm text-slate-600">Career Readiness</p>
                        </div>
                    </div>
                    <Progress value={careerPath.readiness_score} className="h-3 mb-4" />
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-xs text-slate-600">Salary Range</p>
                                <p className="font-semibold text-slate-900">
                                    ${careerPath.salary_range.min.toLocaleString()} - ${careerPath.salary_range.max.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-violet-600" />
                            <div>
                                <p className="text-xs text-slate-600">Timeline</p>
                                <p className="font-semibold text-slate-900">{careerPath.total_timeline_months} months</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-xs text-slate-600">Job Outlook</p>
                                <p className="font-semibold text-slate-900">{careerPath.job_outlook}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {roleAnalysis && (
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle>Role Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Typical Responsibilities</h4>
                            <ul className="space-y-1">
                                {roleAnalysis.typical_responsibilities?.map((resp, idx) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                        <span className="text-violet-600">•</span>
                                        {resp}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Work Environment</h4>
                            <p className="text-sm text-slate-700">{roleAnalysis.work_environment}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Career Growth</h4>
                            <p className="text-sm text-slate-700">{roleAnalysis.career_growth}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-violet-600" />
                        Skill Gap Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {careerPath.required_skills?.map((skill, idx) => (
                            <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-slate-900">{skill.skill}</h4>
                                    <Badge className={getSkillGapColor(skill.gap)}>{skill.gap}</Badge>
                                </div>
                                <div className="grid md:grid-cols-3 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-600 mb-1">Required Level</p>
                                        <p className="font-semibold text-slate-900">{skill.proficiency_level}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600 mb-1">Current Level</p>
                                        <p className="font-semibold text-slate-900">{skill.current_level}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600 mb-1">Importance</p>
                                        <p className="font-semibold text-slate-900">{skill.importance}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-violet-600" />
                        Recommended Learning Path
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {careerPath.recommended_courses
                            ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((course, idx) => (
                            <div key={idx} className={`p-4 border-2 rounded-lg ${getPriorityColor(course.priority)}`}>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-1">{course.course_title}</h4>
                                            <p className="text-sm text-slate-700 mb-2">{course.reason}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {course.skills_gained?.map((skill, sidx) => (
                                                    <Badge key={sidx} variant="secondary" className="text-xs">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge className={getPriorityColor(course.priority)}>
                                        {course.priority} priority
                                    </Badge>
                                </div>
                                {course.course_id && (
                                    <Button
                                        onClick={() => navigate(createPageUrl("CourseViewer") + `?id=${course.course_id}`)}
                                        size="sm"
                                        className="w-full mt-3 bg-violet-600 hover:bg-violet-700"
                                    >
                                        Start Course
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-violet-600" />
                        Career Milestones
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {careerPath.career_milestones?.map((milestone, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-bold text-violet-600">{idx + 1}</span>
                                    </div>
                                    {idx < careerPath.career_milestones.length - 1 && (
                                        <div className="w-0.5 h-16 bg-slate-200 my-2" />
                                    )}
                                </div>
                                <div className="flex-1 pb-8">
                                    <h4 className="font-bold text-slate-900 mb-1">{milestone.title}</h4>
                                    <p className="text-sm text-slate-600 mb-2">{milestone.description}</p>
                                    <Badge variant="outline">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {milestone.timeline_months} months
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                    <CardTitle>Your Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="space-y-3">
                        {careerPath.next_steps?.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {idx + 1}
                                </div>
                                <p className="text-slate-700">{step}</p>
                            </li>
                        ))}
                    </ol>
                </CardContent>
            </Card>

            {careerPath.alternative_roles?.length > 0 && (
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle>Alternative Career Paths</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {careerPath.alternative_roles.map((role, idx) => (
                                <Badge key={idx} variant="outline" className="text-sm py-2 px-3">
                                    <Briefcase className="h-3 w-3 mr-1" />
                                    {role}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}