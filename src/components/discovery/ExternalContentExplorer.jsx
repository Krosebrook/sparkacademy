import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Compass, Search, Sparkles } from "lucide-react";
import ExternalContentCard from "./ExternalContentCard";

export default function ExternalContentExplorer({ userEmail }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [externalContent, setExternalContent] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const searchExternalContent = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const prompt = `Find and curate high-quality external learning resources for: "${searchQuery}"

Search across:
- Academic journals and research papers
- Industry blogs and technical articles  
- YouTube educational channels
- Online tutorials and documentation
- Podcasts and video courses

For each resource, provide:
1. Title
2. URL (make realistic, valid URLs based on known platforms)
3. Type (article, video, podcast, tutorial, documentation, research_paper, course)
4. Source platform
5. Brief description
6. Related skills it teaches
7. Estimated duration
8. Difficulty level
9. Why it's relevant

Return 8-10 diverse, high-quality resources from different sources.`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        resources: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    url: { type: "string" },
                                    resource_type: { 
                                        type: "string",
                                        enum: ["article", "video", "podcast", "tutorial", "documentation", "course", "research_paper"]
                                    },
                                    source: { type: "string" },
                                    description: { type: "string" },
                                    related_skills: { type: "array", items: { type: "string" } },
                                    estimated_duration: { type: "string" },
                                    difficulty_level: { 
                                        type: "string",
                                        enum: ["beginner", "intermediate", "advanced"]
                                    },
                                    relevance_reason: { type: "string" },
                                    tags: { type: "array", items: { type: "string" } }
                                }
                            }
                        }
                    }
                }
            });

            setExternalContent(result.resources || []);
        } catch (error) {
            console.error("Error searching external content:", error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-violet-600" />
                    Explore External Resources
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search for learning resources (e.g., 'machine learning tutorials', 'React best practices')..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && searchExternalContent()}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            onClick={searchExternalContent}
                            disabled={isSearching || !searchQuery.trim()}
                        >
                            {isSearching ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Find Resources
                                </>
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                        AI will search across academic journals, industry blogs, YouTube, and more
                    </p>
                </div>

                {isSearching && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                    </div>
                )}

                {!isSearching && externalContent.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-900">
                                Found {externalContent.length} curated resources
                            </h3>
                            <Badge className="bg-violet-100 text-violet-800">
                                AI-Curated
                            </Badge>
                        </div>
                        {externalContent.map((resource, idx) => (
                            <ExternalContentCard
                                key={idx}
                                resource={resource}
                                userEmail={userEmail}
                            />
                        ))}
                    </div>
                )}

                {!isSearching && externalContent.length === 0 && (
                    <div className="text-center py-12">
                        <Compass className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            Discover External Learning Resources
                        </h3>
                        <p className="text-slate-600">
                            Search for any topic to find curated articles, videos, tutorials, and more
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}