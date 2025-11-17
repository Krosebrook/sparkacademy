import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExternalLink, Bookmark, BookmarkCheck, Clock, Loader2, Sparkles, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function ExternalContentCard({ resource, userEmail, onSave }) {
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notes, setNotes] = useState("");
    const [collection, setCollection] = useState("");
    const [showSummary, setShowSummary] = useState(false);
    const [summary, setSummary] = useState(resource.ai_summary || null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    const getTypeIcon = (type) => {
        const icons = {
            video: "🎥",
            article: "📰",
            podcast: "🎧",
            tutorial: "📚",
            documentation: "📖",
            course: "🎓",
            research_paper: "🔬"
        };
        return icons[type] || "📄";
    };

    const generateSummary = async () => {
        setIsGeneratingSummary(true);
        try {
            const prompt = `Generate a comprehensive summary of this learning resource:

Title: ${resource.title}
Type: ${resource.resource_type}
Description: ${resource.description || "No description available"}
URL: ${resource.url}

Provide:
1. A concise overview (2-3 sentences)
2. Key concepts covered
3. What learners will gain
4. Recommended prerequisites (if any)
5. Best suited for (beginner/intermediate/advanced)`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overview: { type: "string" },
                        key_concepts: { type: "array", items: { type: "string" } },
                        learning_outcomes: { type: "array", items: { type: "string" } },
                        prerequisites: { type: "array", items: { type: "string" } },
                        best_for: { type: "string" }
                    }
                }
            });

            setSummary(result);
        } catch (error) {
            console.error("Error generating summary:", error);
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const saveResource = async () => {
        setIsSaving(true);
        try {
            await base44.entities.SavedResource.create({
                user_email: userEmail,
                title: resource.title,
                url: resource.url,
                resource_type: resource.resource_type,
                source: resource.source,
                description: resource.description,
                ai_summary: summary ? JSON.stringify(summary) : null,
                tags: resource.tags || [],
                related_skills: resource.related_skills || [],
                estimated_duration: resource.estimated_duration,
                difficulty_level: resource.difficulty_level,
                notes,
                collection: collection || "General"
            });
            setIsSaved(true);
            if (onSave) onSave();
        } catch (error) {
            console.error("Error saving resource:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="border-2 border-slate-200 hover:border-violet-300 transition-colors">
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <div className="text-4xl">{getTypeIcon(resource.resource_type)}</div>
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 mb-1">{resource.title}</h4>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">{resource.source}</Badge>
                                    {resource.estimated_duration && (
                                        <Badge variant="outline">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {resource.estimated_duration}
                                        </Badge>
                                    )}
                                    {resource.difficulty_level && (
                                        <Badge className={
                                            resource.difficulty_level === "beginner" ? "bg-green-100 text-green-800" :
                                            resource.difficulty_level === "intermediate" ? "bg-amber-100 text-amber-800" :
                                            "bg-red-100 text-red-800"
                                        }>
                                            {resource.difficulty_level}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-slate-700 mb-3">{resource.description}</p>

                        {resource.related_skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {resource.related_skills.map((skill, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(resource.url, "_blank")}
                            >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Resource
                            </Button>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        AI Summary
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>AI-Generated Summary</DialogTitle>
                                    </DialogHeader>
                                    {!summary ? (
                                        <div className="text-center py-8">
                                            <Button
                                                onClick={generateSummary}
                                                disabled={isGeneratingSummary}
                                            >
                                                {isGeneratingSummary ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Analyzing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="h-4 w-4 mr-2" />
                                                        Generate Summary
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-slate-900 mb-2">Overview</h4>
                                                <p className="text-sm text-slate-700">{summary.overview}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900 mb-2">Key Concepts</h4>
                                                <ul className="text-sm text-slate-700 space-y-1">
                                                    {summary.key_concepts?.map((concept, idx) => (
                                                        <li key={idx}>• {concept}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900 mb-2">Learning Outcomes</h4>
                                                <ul className="text-sm text-slate-700 space-y-1">
                                                    {summary.learning_outcomes?.map((outcome, idx) => (
                                                        <li key={idx}>✓ {outcome}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            {summary.prerequisites?.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 mb-2">Prerequisites</h4>
                                                    <ul className="text-sm text-slate-700 space-y-1">
                                                        {summary.prerequisites.map((prereq, idx) => (
                                                            <li key={idx}>• {prereq}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <div className="p-3 bg-violet-50 border border-violet-200 rounded">
                                                <p className="text-sm text-slate-700">
                                                    <strong>Best for:</strong> {summary.best_for}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </DialogContent>
                            </Dialog>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" disabled={isSaved}>
                                        {isSaved ? (
                                            <>
                                                <BookmarkCheck className="h-3 w-3 mr-1" />
                                                Saved
                                            </>
                                        ) : (
                                            <>
                                                <Bookmark className="h-3 w-3 mr-1" />
                                                Save
                                            </>
                                        )}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Save Resource</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-slate-900 mb-2 block">
                                                Collection (Optional)
                                            </label>
                                            <Input
                                                placeholder="e.g., Web Development, Career Growth"
                                                value={collection}
                                                onChange={(e) => setCollection(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-slate-900 mb-2 block">
                                                Personal Notes (Optional)
                                            </label>
                                            <Textarea
                                                placeholder="Add notes about why you saved this..."
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                        <Button
                                            onClick={saveResource}
                                            disabled={isSaving}
                                            className="w-full"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                "Save to Library"
                                            )}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}