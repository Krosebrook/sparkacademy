import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PenTool, HelpCircle, Video } from "lucide-react";
import AIDescriptionGenerator from "@/components/course-creator/AIDescriptionGenerator";
import AIQuizGenerator from "@/components/course-creator/AIQuizGenerator";
import AIVideoScriptGenerator from "@/components/course-creator/AIVideoScriptGenerator";

export default function AdvancedCreatorTools() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Advanced Creator Tools</h1>
          <p className="text-slate-600">
            AI-powered tools for generating marketing copy, assessments, and video scripts
          </p>
        </div>

        <Tabs defaultValue="descriptions" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="descriptions">
              <PenTool className="w-4 h-4 mr-2" />
              Descriptions
            </TabsTrigger>
            <TabsTrigger value="quizzes">
              <HelpCircle className="w-4 h-4 mr-2" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="scripts">
              <Video className="w-4 h-4 mr-2" />
              Video Scripts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="descriptions">
            <div className="space-y-4">
              <p className="text-slate-600">
                Generate compelling marketing copy and course descriptions optimized for enrollment.
              </p>
              <AIDescriptionGenerator />
            </div>
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="space-y-4">
              <p className="text-slate-600">
                Auto-generate quizzes with multiple-choice and essay questions from lesson content.
              </p>
              <AIQuizGenerator />
            </div>
          </TabsContent>

          <TabsContent value="scripts">
            <div className="space-y-4">
              <p className="text-slate-600">
                Create complete video scripts with timing, visual cues, and presenter notes.
              </p>
              <AIVideoScriptGenerator />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}