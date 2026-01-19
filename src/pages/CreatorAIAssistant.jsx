import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, FileText, PenTool, HelpCircle } from 'lucide-react';
import AILessonOutlineGenerator from '@/components/creator/AILessonOutlineGenerator';
import AILessonContentDrafter from '@/components/creator/AILessonContentDrafter';
import AIQuizAssignmentGenerator from '@/components/creator/AIQuizAssignmentGenerator';
import AdvancedAssessmentGenerator from '@/components/creator/AdvancedAssessmentGenerator';

export default function CreatorAIAssistant() {
  const [generatedOutline, setGeneratedOutline] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0618] via-[#1a0a2e] to-[#0f0618] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">AI Creator Assistant</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Generate lesson outlines, draft content, and create engaging assessments with AI
          </p>
        </div>

        {/* Info Card */}
        <Card className="card-glow bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-medium mb-1">AI-Powered Course Creation</p>
                <p className="text-gray-300 text-xs">
                  Save hours of work with AI-generated outlines, content drafts, and assessments. 
                  Review and customize the output to match your teaching style.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Tools Tabs */}
        <Tabs defaultValue="outline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-[#1a0a2e] border border-gray-700">
            <TabsTrigger value="outline" className="data-[state=active]:bg-purple-500/20">
              <FileText className="w-4 h-4 mr-2" />
              Lesson Outline
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-purple-500/20">
              <PenTool className="w-4 h-4 mr-2" />
              Content Draft
            </TabsTrigger>
            <TabsTrigger value="quiz" className="data-[state=active]:bg-purple-500/20">
              <HelpCircle className="w-4 h-4 mr-2" />
              Basic Assessments
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-purple-500/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Advanced Assessments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="outline">
            <AILessonOutlineGenerator 
              onOutlineGenerated={setGeneratedOutline}
            />
          </TabsContent>

          <TabsContent value="content">
            <AILessonContentDrafter 
              lessonOutline={generatedOutline}
            />
          </TabsContent>

          <TabsContent value="quiz">
            <AIQuizAssignmentGenerator 
              lessonTopic={generatedOutline?.title}
            />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedAssessmentGenerator />
          </TabsContent>
        </Tabs>

        {/* Tips Section */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="text-white text-sm">Tips for Best Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <p className="text-gray-300 text-sm">
                <strong className="text-white">Be specific:</strong> Detailed topics and objectives generate better outlines
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <p className="text-gray-300 text-sm">
                <strong className="text-white">Review and customize:</strong> AI-generated content is a starting point—add your expertise
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <p className="text-gray-300 text-sm">
                <strong className="text-white">Start with outlines:</strong> Generate an outline first, then use it for content and quizzes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}