import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, BookOpen, Lightbulb } from 'lucide-react';
import AITutorChat from '@/components/learning/AITutorChat';
import AdaptiveLearningPanel from '@/components/learning/AdaptiveLearningPanel';

export default function AIStudentAssistant() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Bot className="w-8 h-8" />
            <h1 className="text-3xl font-bold">AI Learning Assistant</h1>
          </div>
          <p className="text-blue-100">
            Your personal AI tutor providing guidance, feedback, and adaptive learning
          </p>
        </div>

        <Tabs defaultValue="tutor" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200">
            <TabsTrigger value="tutor">
              <Bot className="w-4 h-4 mr-2" />
              AI Tutor
            </TabsTrigger>
            <TabsTrigger value="resources">
              <BookOpen className="w-4 h-4 mr-2" />
              Adaptive Learning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tutor" className="mt-6">
            <div className="h-[600px]">
              <AITutorChat />
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <AdaptiveLearningPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}