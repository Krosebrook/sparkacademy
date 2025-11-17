import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Library, Search, ExternalLink, Trash2, CheckCircle, Circle, FolderOpen } from "lucide-react";

export default function SavedResourcesLibrary({ userEmail }) {
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCollection, setSelectedCollection] = useState("all");

    useEffect(() => {
        loadResources();
    }, [userEmail]);

    const loadResources = async () => {
        setIsLoading(true);
        try {
            const savedResources = await base44.entities.SavedResource.filter({ user_email: userEmail });
            setResources(savedResources);
        } catch (error) {
            console.error("Error loading resources:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteResource = async (id) => {
        try {
            await base44.entities.SavedResource.delete(id);
            setResources(resources.filter(r => r.id !== id));
        } catch (error) {
            console.error("Error deleting resource:", error);
        }
    };

    const toggleComplete = async (resource) => {
        try {
            await base44.entities.SavedResource.update(resource.id, {
                is_completed: !resource.is_completed
            });
            setResources(resources.map(r => 
                r.id === resource.id ? { ...r, is_completed: !r.is_completed } : r
            ));
        } catch (error) {
            console.error("Error updating resource:", error);
        }
    };

    const collections = ["all", ...new Set(resources.map(r => r.collection || "General"))];
    
    const filteredResources = resources.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            r.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCollection = selectedCollection === "all" || r.collection === selectedCollection;
        return matchesSearch && matchesCollection;
    });

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

    if (isLoading) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Library className="h-5 w-5 text-violet-600" />
                    Saved Resources Library
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search saved resources..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {collections.map((collection) => (
                            <Button
                                key={collection}
                                variant={selectedCollection === collection ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCollection(collection)}
                            >
                                <FolderOpen className="h-3 w-3 mr-1" />
                                {collection}
                            </Button>
                        ))}
                    </div>
                </div>

                {filteredResources.length === 0 ? (
                    <div className="text-center py-12">
                        <Library className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Saved Resources</h3>
                        <p className="text-slate-600">
                            Start exploring and save resources to build your learning library
                        </p>
                    </div>
                ) : (
                    <Tabs defaultValue="all" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="all">
                                All ({filteredResources.length})
                            </TabsTrigger>
                            <TabsTrigger value="in-progress">
                                In Progress ({filteredResources.filter(r => !r.is_completed).length})
                            </TabsTrigger>
                            <TabsTrigger value="completed">
                                Completed ({filteredResources.filter(r => r.is_completed).length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-3">
                            {filteredResources.map((resource) => (
                                <ResourceItem
                                    key={resource.id}
                                    resource={resource}
                                    onDelete={deleteResource}
                                    onToggleComplete={toggleComplete}
                                    getTypeIcon={getTypeIcon}
                                />
                            ))}
                        </TabsContent>

                        <TabsContent value="in-progress" className="space-y-3">
                            {filteredResources.filter(r => !r.is_completed).map((resource) => (
                                <ResourceItem
                                    key={resource.id}
                                    resource={resource}
                                    onDelete={deleteResource}
                                    onToggleComplete={toggleComplete}
                                    getTypeIcon={getTypeIcon}
                                />
                            ))}
                        </TabsContent>

                        <TabsContent value="completed" className="space-y-3">
                            {filteredResources.filter(r => r.is_completed).map((resource) => (
                                <ResourceItem
                                    key={resource.id}
                                    resource={resource}
                                    onDelete={deleteResource}
                                    onToggleComplete={toggleComplete}
                                    getTypeIcon={getTypeIcon}
                                />
                            ))}
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    );
}

function ResourceItem({ resource, onDelete, onToggleComplete, getTypeIcon }) {
    return (
        <div className={`p-4 border-2 rounded-lg ${
            resource.is_completed ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'
        }`}>
            <div className="flex items-start gap-3">
                <div className="text-3xl">{getTypeIcon(resource.resource_type)}</div>
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 mb-1">{resource.title}</h4>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{resource.source}</Badge>
                                <Badge variant="outline">{resource.collection || "General"}</Badge>
                                {resource.estimated_duration && (
                                    <Badge variant="outline">{resource.estimated_duration}</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {resource.description && (
                        <p className="text-sm text-slate-700 mb-2">{resource.description}</p>
                    )}

                    {resource.notes && (
                        <div className="mb-2 p-2 bg-slate-50 border border-slate-200 rounded">
                            <p className="text-xs text-slate-600">
                                <strong>Notes:</strong> {resource.notes}
                            </p>
                        </div>
                    )}

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
                            Open
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onToggleComplete(resource)}
                        >
                            {resource.is_completed ? (
                                <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Completed
                                </>
                            ) : (
                                <>
                                    <Circle className="h-3 w-3 mr-1" />
                                    Mark Complete
                                </>
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDelete(resource.id)}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}