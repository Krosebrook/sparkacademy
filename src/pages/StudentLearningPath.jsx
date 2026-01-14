import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import PersonalizedLearningPath from "@/components/recommendations/PersonalizedLearningPath";

export default function StudentLearningPathPage() {
  const location = useLocation();
  const courseId = new URLSearchParams(location.search).get("id");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Learning Path</h1>
          <p className="text-slate-600">AI-personalized lessons based on your progress and style</p>
        </div>

        {courseId && user && (
          <PersonalizedLearningPath studentEmail={user.email} courseId={courseId} />
        )}
      </div>
    </div>
  );
}