import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Briefcase, History, Sparkles } from "lucide-react";
import CareerPathAnalyzer from "@/components/career/CareerPathAnalyzer";
import CareerRoadmap from "@/components/career/CareerRoadmap";

export default function CareerPathing() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [savedPaths, setSavedPaths] = useState([]);
    const [activePath, setActivePath] = useState(null);
    const [roleAnalysis, setRoleAnalysis] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const userData = await base44.auth.me();
        setUser(userData);

        const paths = await base44.entities.CareerPath.filter({ user_email: userData.email });
        setSavedPaths(paths.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        
        setIsLoading(false);
    };

    const handlePathGenerated = (newPath) => {
        setActivePath(newPath);
        setRoleAnalysis(newPath.role_analysis);
        loadData();
    };

    const selectPath = (path) => {
        setActivePath(path);
        setRoleAnalysis(null);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Career Pathing</h1>
                    <p className="text-slate-600">AI-powered career guidance tailored to your skills and goals</p>
                </div>

                <Tabs defaultValue={activePath ? "roadmap" : "generate"} className="space-y-6">
                    <TabsList className="bg-white border border-slate-200">
                        <TabsTrigger value="generate">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Path
                        </TabsTrigger>
                        {activePath && (
                            <TabsTrigger value="roadmap">
                                <Briefcase className="h-4 w-4 mr-2" />
                                Your Roadmap
                            </TabsTrigger>
                        )}
                        {savedPaths.length > 0 && (
                            <TabsTrigger value="history">
                                <History className="h-4 w-4 mr-2" />
                                Saved Paths ({savedPaths.length})
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="generate">
                        <CareerPathAnalyzer 
                            userData={user} 
                            onPathGenerated={handlePathGenerated}
                        />
                    </TabsContent>

                    {activePath && (
                        <TabsContent value="roadmap">
                            <CareerRoadmap 
                                careerPath={activePath}
                                roleAnalysis={roleAnalysis}
                            />
                        </TabsContent>
                    )}

                    <TabsContent value="history">
                        <div className="grid md:grid-cols-2 gap-4">
                            {savedPaths.map(path => (
                                <Card key={path.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 mb-1">
                                                    {path.target_role}
                                                </h3>
                                                <p className="text-sm text-slate-600">
                                                    Created {new Date(path.created_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-violet-600">
                                                    {path.readiness_score}%
                                                </div>
                                                <p className="text-xs text-slate-600">Ready</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Briefcase className="h-4 w-4" />
                                                {path.recommended_courses?.length || 0} courses recommended
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Loader2 className="h-4 w-4" />
                                                {path.total_timeline_months} month timeline
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => selectPath(path)}
                                            className="w-full bg-violet-600 hover:bg-violet-700"
                                        >
                                            View Roadmap
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}