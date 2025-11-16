import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Sparkles } from "lucide-react";
import RecommendedContent from "./RecommendedContent";

export default function NaturalLanguageSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        try {
            const allCourses = await base44.entities.Course.filter({ is_published: true });

            const prompt = `A student is searching for learning content with this query: "${query}"

AVAILABLE COURSES:
${allCourses.map(c => `${c.title} - ${c.description} - Category: ${c.category} - Level: ${c.level} - Skills: ${c.skills_taught?.join(", ") || "General"}`).join("\n")}

Analyze the query and provide:
1. Interpretation of what the student is looking for
2. Top 5 most relevant courses from the available courses with match scores
3. Skill recommendations based on the query
4. External learning resources (articles, videos, tutorials) related to the query
5. Career paths that align with this interest

Use internet context to suggest current, relevant external resources.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        query_interpretation: { type: "string" },
                        matched_courses: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    course_title: { type: "string" },
                                    match_score: { type: "number" },
                                    relevance_explanation: { type: "string" },
                                    skills_gained: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        skill_recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    skill: { type: "string" },
                                    why_relevant: { type: "string" }
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
                                    description: { type: "string" },
                                    url: { type: "string" }
                                }
                            }
                        },
                        career_paths: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    role: { type: "string" },
                                    description: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            const enrichedCourses = result.matched_courses.map(match => {
                const course = allCourses.find(c => 
                    c.title.toLowerCase().includes(match.course_title.toLowerCase()) ||
                    match.course_title.toLowerCase().includes(c.title.toLowerCase())
                );
                return { 
                    ...match, 
                    course_data: course,
                    reason: match.relevance_explanation,
                    relevance_score: match.match_score
                };
            });

            setResults({ ...result, matched_courses: enrichedCourses });
        } catch (error) {
            console.error("Error searching content:", error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-violet-600" />
                        Natural Language Content Search
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div>
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder='e.g., "I want to learn about machine learning for healthcare" or "Courses to become a product manager"'
                                className="text-lg"
                            />
                            <p className="text-xs text-slate-600 mt-2">
                                Describe what you want to learn in your own words. AI will understand your intent and find relevant content.
                            </p>
                        </div>
                        <Button
                            type="submit"
                            disabled={isSearching || !query.trim()}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Search with AI
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {results && (
                <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                        <CardContent className="p-6">
                            <h4 className="font-semibold text-slate-900 mb-2">Understanding Your Query</h4>
                            <p className="text-slate-700">{results.query_interpretation}</p>
                        </CardContent>
                    </Card>

                    {results.matched_courses?.length > 0 && (
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Matching Courses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {results.matched_courses.map((course, idx) => (
                                        <RecommendedContent 
                                            key={idx} 
                                            content={course} 
                                            type="course"
                                            showScore={true}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {results.skill_recommendations?.length > 0 && (
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Recommended Skills to Learn</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {results.skill_recommendations.map((skill, idx) => (
                                        <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                                            <h4 className="font-semibold text-slate-900 mb-2">{skill.skill}</h4>
                                            <p className="text-sm text-slate-700">{skill.why_relevant}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {results.external_resources?.length > 0 && (
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>External Learning Resources</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {results.external_resources.map((resource, idx) => (
                                        <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:border-violet-300 transition-colors">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-semibold text-slate-900">{resource.title}</h4>
                                                <span className="text-xs px-2 py-1 bg-slate-100 rounded">{resource.type}</span>
                                            </div>
                                            <p className="text-sm text-slate-700 mb-3">{resource.description}</p>
                                            <a
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-violet-600 hover:text-violet-700 font-semibold"
                                            >
                                                View Resource →
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {results.career_paths?.length > 0 && (
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Related Career Paths</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {results.career_paths.map((path, idx) => (
                                        <div key={idx} className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
                                            <h4 className="font-bold text-slate-900 mb-2">{path.role}</h4>
                                            <p className="text-sm text-slate-700">{path.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}