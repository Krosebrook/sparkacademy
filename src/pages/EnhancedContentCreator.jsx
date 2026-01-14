import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Briefcase, BookMarked } from "lucide-react";
import InteractiveElementsSuggester from "@/components/course-creator/InteractiveElementsSuggester";
import DiverseScenarioGenerator from "@/components/course-creator/DiverseScenarioGenerator";
import StudyMaterialsGenerator from "@/components/course-creator/StudyMaterialsGenerator";

export default function EnhancedContentCreator() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Enhanced Content Creator</h1>
          <p className="text-slate-600">
            AI-powered tools for creating engaging, diverse, and comprehensive course content
          </p>
        </div>

        <Tabs defaultValue="interactive" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="interactive">
              <Zap className="w-4 h-4 mr-2" />
              Interactive Elements
            </TabsTrigger>
            <TabsTrigger value="scenarios">
              <Briefcase className="w-4 h-4 mr-2" />
              Scenario Generator
            </TabsTrigger>
            <TabsTrigger value="study">
              <BookMarked className="w-4 h-4 mr-2" />
              Study Materials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interactive">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-700">
                  <strong>Interactive Elements Suggester:</strong> Analyze your lesson and get AI-powered suggestions for where to add quizzes, polls, simulations, and exercises to boost student engagement and learning outcomes.
                </p>
              </div>
              <InteractiveElementsSuggester />
            </div>
          </TabsContent>

          <TabsContent value="scenarios">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-700">
                  <strong>Diverse Scenario Generator:</strong> Create industry-specific, real-world example scenarios that show how your content applies in different contexts. Students see practical applications across multiple industries.
                </p>
              </div>
              <DiverseScenarioGenerator />
            </div>
          </TabsContent>

          <TabsContent value="study">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-700">
                  <strong>Study Materials Generator:</strong> Automatically create flashcards, study guides, cheat sheets, and practice questions from your lesson content to help students study effectively.
                </p>
              </div>
              <StudyMaterialsGenerator />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}