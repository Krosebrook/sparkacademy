import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Target } from "lucide-react";
import SkillGapAnalysis from "@/components/career/SkillGapAnalysis";

export default function SkillGapReport() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        setIsLoading(true);
        try {
            const userData = await base44.auth.me();
            setUser(userData);
        } catch (error) {
            console.error("Error loading user:", error);
        } finally {
            setIsLoading(false);
        }
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
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Target className="h-8 w-8 text-violet-600" />
                        Skill Gap Report
                    </h1>
                    <p className="text-slate-600">
                        Comprehensive analysis of your skills against your career goals with personalized recommendations
                    </p>
                </div>

                <SkillGapAnalysis userEmail={user.email} />
            </div>
        </div>
    );
}