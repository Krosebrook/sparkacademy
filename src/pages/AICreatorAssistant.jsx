import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, BookOpen, Layout } from "lucide-react";
import AITopicSuggester from "@/components/course-creator/AITopicSuggester";
import AILessonDrafter from "@/components/course-creator/AILessonDrafter";
import CourseStructureOptimizer from "@/components/course-creator/CourseStructureOptimizer";

export default function AICreatorAssistant() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Creator Assistant</h1>
          <p className="text-slate-600">
            Intelligent tools to help you design, create, and optimize your courses
          </p>
        </div>

        <Tabs defaultValue="topics" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="topics">
              <Lightbulb className="w-4 h-4 mr-2" />
              Topic Ideas
            </TabsTrigger>
            <TabsTrigger value="lessons">
              <BookOpen className="w-4 h-4 mr-2" />
              Lesson Drafter
            </TabsTrigger>
            <TabsTrigger value="structure">
              <Layout className="w-4 h-4 mr-2" />
              Structure Optimizer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topics">
            <div className="space-y-4">
              <p className="text-slate-600">
                Get AI-powered course topic suggestions based on market trends, student demand, and competitive analysis.
              </p>
              <AITopicSuggester />
            </div>
          </TabsContent>

          <TabsContent value="lessons">
            <div className="space-y-4">
              <p className="text-slate-600">
                Draft complete lesson modules with explanations, real-world examples, and practice exercises.
              </p>
              <AILessonDrafter />
            </div>
          </TabsContent>

          <TabsContent value="structure">
            <div className="space-y-4">
              <p className="text-slate-600">
                Optimize your course structure based on learning science principles, proper sequencing, and cognitive load management.
              </p>
              <CourseStructureOptimizer />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}