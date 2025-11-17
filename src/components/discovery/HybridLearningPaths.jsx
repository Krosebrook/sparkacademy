import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Route, Sparkles, BookOpen, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function HybridLearningPaths({ userEmail }) {
    const navigate = useNavigate();
    const [paths, setPaths] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        generatePaths();
    }, [userEmail]);

    const generatePaths = async () => {
        setIsGenerating(true);
        try {
            const [enrollments, goals, careerPaths, allCourses] = await Promise.all([
                base44.entities.Enrollment.filter({ student_email: userEmail }),
                base44.entities.LearningGoal.filter({ user_email: userEmail }),
                base44.entities.CareerPath.filter({ user_email: userEmail }),
                base44.entities.Course.filter({ is_published: true })
            ]);

            const activeGoals = goals.filter(g => g.status === "active");
            const latestCareerPath = careerPaths.sort((a, b) => 
                new Date(b.created_date) - new Date(a.created_date)
            )[0];

            const completedCourseIds = enrollments
                .filter(e => e.completion_percentage === 100)
                .map(e => e.course_id);

            const prompt = `Create comprehensive hybrid learning paths combining internal courses with external resources:

STUDENT PROFILE:
- Completed Courses: ${completedCourseIds.length}
- Active Goals: ${activeGoals.map(g => g.title).join(", ") || "None"}
- Career Target: ${latestCareerPath?.target_role || "Not set"}
- Skill Gaps: ${latestCareerPath?.required_skills?.map(s => s.skill).join(", ") || "None"}

AVAILABLE INTERNAL COURSES:
${allCourses.map(c => `- ${c.title} (${c.category}, ${c.level})`).join("\n")}

Generate 4-5 curated learning paths that:
1. Combine internal courses with external resources
2. Progress logically from basics to advanced
3. Include diverse content types (articles, videos, tutorials)
4. Address the student's goals and career path
5. Provide realistic external resource suggestions

For each path include:
- Path name and description
- 3-5 internal courses (from available courses)
- 5-8 external resources with realistic details
- Estimated timeline
- Skills gained`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        learning_paths: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    path_name: { type: "string" },
                                    description: { type: "string" },
                                    difficulty: { type: "string" },
                                    estimated_weeks: { type: "number" },
                                    internal_courses: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                course_title: { type: "string" },
                                                order: { type: "number" },
                                                why_included: { type: "string" }
                                            }
                                        }
                                    },
                                    external_resources: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                title: { type: "string" },
                                                type: { type: "string" },
                                                source: { type: "string" },
                                                url: { type: "string" },
                                                duration: { type: "string" },
                                                order: { type: "number" },
                                                purpose: { type: "string" }
                                            }
                                        }
                                    },
                                    skills_gained: { type: "array", items: { type: "string" } },
                                    recommended_for: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            const enrichedPaths = result.learning_paths.map(path => ({
                ...path,
                internal_courses: path.internal_courses.map(ic => {
                    const course = allCourses.find(c => 
                        c.title.toLowerCase().includes(ic.course_title.toLowerCase()) ||
                        ic.course_title.toLowerCase().includes(c.title.toLowerCase())
                    );
                    return { ...ic, course_data: course };
                })
            }));

            setPaths(enrichedPaths);
        } catch (error) {
            console.error("Error generating paths:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (isGenerating) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
                    <p className="text-slate-600">Generating personalized hybrid learning paths...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Route className="h-5 w-5 text-violet-600" />
                        Hybrid Learning Paths
                    </CardTitle>
                    <Button onClick={generatePaths} size="sm" variant="outline">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {paths.map((path, idx) => (
                        <div key={idx} className="p-6 border-2 border-violet-200 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50">
                            <div className="mb-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                                            {path.path_name}
                                        </h3>
                                        <p className="text-sm text-slate-700 mb-3">{path.description}</p>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge>{path.difficulty}</Badge>
                                            <Badge variant="outline">{path.estimated_weeks} weeks</Badge>
                                            <Badge className="bg-violet-100 text-violet-800">
                                                {path.internal_courses.length} courses + {path.external_resources.length} resources
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-white border border-violet-200 rounded mb-4">
                                    <p className="text-sm text-slate-700">
                                        <strong>Recommended for:</strong> {path.recommended_for}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-violet-600" />
                                        Internal Courses
                                    </h4>
                                    <div className="space-y-2">
                                        {path.internal_courses.map((course, cidx) => (
                                            <div key={cidx} className="p-3 bg-white border border-slate-200 rounded">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline">Step {course.order}</Badge>
                                                            <h5 className="font-semibold text-slate-900">
                                                                {course.course_title}
                                                            </h5>
                                                        </div>
                                                        <p className="text-xs text-slate-600">{course.why_included}</p>
                                                    </div>
                                                    {course.course_data && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => navigate(createPageUrl("CourseViewer") + `?id=${course.course_data.id}`)}
                                                        >
                                                            Start
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                        <ExternalLink className="h-4 w-4 text-blue-600" />
                                        External Resources
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-2">
                                        {path.external_resources.map((resource, ridx) => (
                                            <div key={ridx} className="p-3 bg-white border border-slate-200 rounded">
                                                <div className="flex items-start justify-between mb-1">
                                                    <div className="flex-1">
                                                        <Badge variant="outline" className="mb-1">Step {resource.order}</Badge>
                                                        <h5 className="font-semibold text-sm text-slate-900 mb-1">
                                                            {resource.title}
                                                        </h5>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="secondary" className="text-xs">
                                                                {resource.type}
                                                            </Badge>
                                                            <span className="text-xs text-slate-600">{resource.duration}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-600">{resource.purpose}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-green-50 border border-green-200 rounded">
                                    <h4 className="font-semibold text-slate-900 mb-2">Skills You'll Gain</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {path.skills_gained.map((skill, sidx) => (
                                            <Badge key={sidx} variant="secondary">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}