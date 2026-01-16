import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2, BookOpen, FileText, CheckCircle, Sparkles } from "lucide-react";
import AISyllabusGenerator from "@/components/ai-creator/AISyllabusGenerator";
import AILessonDrafter from "@/components/ai-creator/AILessonDrafter";
import AIQuizBuilder from "@/components/ai-creator/AIQuizBuilder";
import AIContentAnalyzer from "@/components/ai-creator/AIContentAnalyzer";
import InteractiveElementsSuggester from "@/components/ai-creator/InteractiveElementsSuggester";

export default function AICreatorStudio() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0618] via-[#1a0a2e] to-[#0f0618] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 gradient-text flex items-center gap-3">
            <Wand2 className="w-10 h-10" />
            AI Creator Studio
          </h1>
          <p className="text-gray-400">Powerful AI tools to accelerate course creation</p>
        </div>

        <Tabs defaultValue="syllabus" className="space-y-6">
          <TabsList className="bg-[#1a0a2e] border border-cyan-500/20">
            <TabsTrigger value="syllabus">
              <BookOpen className="w-4 h-4 mr-2" />
              Syllabus Generator
            </TabsTrigger>
            <TabsTrigger value="lesson">
              <FileText className="w-4 h-4 mr-2" />
              Lesson Drafter
            </TabsTrigger>
            <TabsTrigger value="quiz">
              <CheckCircle className="w-4 h-4 mr-2" />
              Quiz Builder
            </TabsTrigger>
            <TabsTrigger value="analyzer">
              <Sparkles className="w-4 h-4 mr-2" />
              Content Analyzer
            </TabsTrigger>
            <TabsTrigger value="interactive">
              <Wand2 className="w-4 h-4 mr-2" />
              Interactive Elements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="syllabus">
            <AISyllabusGenerator />
          </TabsContent>

          <TabsContent value="lesson">
            <AILessonDrafter />
          </TabsContent>

          <TabsContent value="quiz">
            <AIQuizBuilder />
          </TabsContent>

          <TabsContent value="analyzer">
            <AIContentAnalyzer />
          </TabsContent>

          <TabsContent value="interactive">
            <InteractiveElementsSuggester />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}