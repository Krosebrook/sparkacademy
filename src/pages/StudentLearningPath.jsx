import React from "react";
import PersonalizedPathGenerator from "@/components/learning/PersonalizedPathGenerator";

export default function StudentLearningPath() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0618] via-[#1a0a2e] to-[#0f0618] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Your Personalized Learning Path</h1>
          <p className="text-gray-400">AI-powered course recommendations based on your goals and current knowledge</p>
        </div>

        <PersonalizedPathGenerator />
      </div>
    </div>
  );
}