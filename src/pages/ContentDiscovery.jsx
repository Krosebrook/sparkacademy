import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, Search, Compass, AlertTriangle, Library, Route } from "lucide-react";
import PersonalizedRecommendations from "@/components/discovery/PersonalizedRecommendations";
import NaturalLanguageSearch from "@/components/discovery/NaturalLanguageSearch";
import SkillGapRemediation from "@/components/learning/SkillGapRemediation";
import ExternalContentExplorer from "@/components/discovery/ExternalContentExplorer";
import SavedResourcesLibrary from "@/components/discovery/SavedResourcesLibrary";
import HybridLearningPaths from "@/components/discovery/HybridLearningPaths";

export default function ContentDiscovery() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        setIsLoading(true);
        const userData = await base44.auth.me();
        setUser(userData);
        setIsLoading(false);
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
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Compass className="h-8 w-8 text-violet-600" />
                        AI Content Discovery
                    </h1>
                    <p className="text-slate-600">
                        Discover personalized learning content from internal courses and curated external resources
                    </p>
                </div>

                <Tabs defaultValue="personalized" className="space-y-6">
                    <TabsList className="bg-white border border-slate-200">
                        <TabsTrigger value="personalized">
                            <Sparkles className="h-4 w-4 mr-2" />
                            For You
                        </TabsTrigger>
                        <TabsTrigger value="search">
                            <Search className="h-4 w-4 mr-2" />
                            AI Search
                        </TabsTrigger>
                        <TabsTrigger value="remediation">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Skill Gaps
                        </TabsTrigger>
                        <TabsTrigger value="external">
                            <Compass className="h-4 w-4 mr-2" />
                            External Resources
                        </TabsTrigger>
                        <TabsTrigger value="paths">
                            <Route className="h-4 w-4 mr-2" />
                            Learning Paths
                        </TabsTrigger>
                        <TabsTrigger value="library">
                            <Library className="h-4 w-4 mr-2" />
                            My Library
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="personalized">
                        <PersonalizedRecommendations userEmail={user.email} />
                    </TabsContent>

                    <TabsContent value="search">
                        <NaturalLanguageSearch />
                    </TabsContent>

                    <TabsContent value="remediation">
                        <SkillGapRemediation userEmail={user.email} />
                    </TabsContent>

                    <TabsContent value="external">
                        <ExternalContentExplorer userEmail={user.email} />
                    </TabsContent>

                    <TabsContent value="paths">
                        <HybridLearningPaths userEmail={user.email} />
                    </TabsContent>

                    <TabsContent value="library">
                        <SavedResourcesLibrary userEmail={user.email} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}