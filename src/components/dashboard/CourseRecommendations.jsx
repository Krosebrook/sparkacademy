import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sparkles, BookOpen, Clock, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseRecommendations({ userEmail }) {
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (userEmail) loadRecommendations();
    }, [userEmail]);

    const loadRecommendations = async () => {
        try {
            const enrollments = await base44.entities.Enrollment.filter({ student_email: userEmail });
            const allCourses = await base44.entities.Course.filter({ is_published: true });

            if (enrollments.length === 0) {
                // New user - show popular courses
                setRecommendations(allCourses.slice(0, 3));
                setIsLoading(false);
                return;
            }

            const enrolledIds = enrollments.map(e => e.course_id);
            const enrolledCourses = allCourses.filter(c => enrolledIds.includes(c.id));
            
            const categories = enrolledCourses.map(c => c.category).filter(Boolean);
            const skills = enrolledCourses.flatMap(c => c.skills_taught || []);

            const prompt = `Based on a user's learning history, recommend 3 relevant courses.

User's completed categories: ${categories.join(', ') || 'None'}
User's learned skills: ${skills.join(', ') || 'None'}

Available courses:
${allCourses.filter(c => !enrolledIds.includes(c.id)).slice(0, 10).map(c => 
    `- ${c.title} (${c.category}, ${c.level})`
).join('\n')}

Return the 3 most relevant course titles that would help this user progress in their learning journey.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        recommendations: {
                            type: "array",
                            items: { type: "string" }
                        }
                    }
                }
            });

            const recommendedTitles = result.recommendations || [];
            const recommended = allCourses.filter(c => 
                recommendedTitles.some(title => c.title.toLowerCase().includes(title.toLowerCase()))
            ).slice(0, 3);

            setRecommendations(recommended.length > 0 ? recommended : allCourses.slice(0, 3));
        } catch (error) {
            console.error("Error loading recommendations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-violet-600" />
                        Recommended for You
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3">
                            <Skeleton className="h-16 w-16 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (recommendations.length === 0) return null;

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-violet-600" />
                    Recommended for You
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {recommendations.map(course => (
                    <Link key={course.id} to={createPageUrl(`CourseViewer?id=${course.id}`)}>
                        <div className="flex gap-4 p-3 rounded-lg bg-white border border-violet-100 hover:border-violet-300 hover:shadow-md transition-all">
                            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                {course.thumbnail_url ? (
                                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <BookOpen className="h-8 w-8 text-white" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-900 mb-1 truncate">{course.title}</h4>
                                <div className="flex items-center gap-2 text-xs">
                                    <Badge variant="outline" className="bg-white">{course.category}</Badge>
                                    <span className="text-slate-500 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {course.duration_hours}h
                                    </span>
                                </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-slate-400 self-center" />
                        </div>
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}