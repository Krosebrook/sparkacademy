import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Code } from "lucide-react";
import ProjectDocumentation from "@/components/docs/ProjectDocumentation";
import LLMStrategyDocument from "@/components/docs/LLMStrategyDocument";

export default function Documentation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0618] via-[#1a0a2e] to-[#0f0618] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 gradient-text">Documentation Hub</h1>
          <p className="text-lg text-gray-300">Complete technical and strategic documentation</p>
        </div>

        <Tabs defaultValue="project" className="space-y-6">
          <TabsList className="bg-[#1a0a2e] border border-[#00d9ff]/20">
            <TabsTrigger value="project">
              <Code className="w-4 h-4 mr-2" />
              Project Docs
            </TabsTrigger>
            <TabsTrigger value="strategy">
              <FileText className="w-4 h-4 mr-2" />
              LLM Strategy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="project">
            <ProjectDocumentation />
          </TabsContent>

          <TabsContent value="strategy">
            <LLMStrategyDocument />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}