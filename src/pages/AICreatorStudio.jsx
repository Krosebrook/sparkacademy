import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, FileText, ClipboardCheck, Video, DollarSign, Zap, Film, BookMarked, Calendar, Target, BookOpen, Globe, Sparkles } from 'lucide-react';
import AISyllabusGenerator from '@/components/creator/AISyllabusGenerator';
import AICourseDescriptionGenerator from '@/components/creator/AICourseDescriptionGenerator';
import DiverseAssessmentGenerator from '@/components/creator/DiverseAssessmentGenerator';
import MultimediaContentSuggester from '@/components/creator/MultimediaContentSuggester';
import MonetizationStrategist from '@/components/creator/MonetizationStrategist';
import AIInteractiveElementsSuggester from '@/components/creator/AIInteractiveElementsSuggester';
import AIVideoScriptGenerator from '@/components/creator/AIVideoScriptGenerator';
import AISupplementaryMaterialsGenerator from '@/components/creator/AISupplementaryMaterialsGenerator';
import AILessonPlanningAssistant from '@/components/creator/AILessonPlanningAssistant';
import AIPracticeProblemsGenerator from '@/components/creator/AIPracticeProblemsGenerator';
import AIStudyGuidesGenerator from '@/components/creator/AIStudyGuidesGenerator';
import AIRealWorldExamplesIntegrator from '@/components/creator/AIRealWorldExamplesIntegrator';
import QuickCourseBuilder from '@/components/creator/QuickCourseBuilder';

export default function AICreatorStudio() {
  return (
    <div className="min-h-screen bg-[#0f0618] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          <div className="flex items-center gap-3 mb-2">
            <Wand2 className="w-8 h-8" />
            <h1 className="text-3xl font-bold">AI Creator Studio</h1>
          </div>
          <p className="text-purple-100">
            Generate complete courses in seconds with AI-powered syllabi, lesson outlines, and practice projects
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="quick" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-12 bg-purple-900/20 border border-purple-500/20">
            <TabsTrigger value="quick" className="data-[state=active]:bg-purple-600">
              <Sparkles className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Quick Build</span>
            </TabsTrigger>
            <TabsTrigger value="syllabus">
              <FileText className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Syllabus</span>
            </TabsTrigger>
            <TabsTrigger value="lessons">
              <Calendar className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Lessons</span>
            </TabsTrigger>
            <TabsTrigger value="descriptions">
              <Wand2 className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Descriptions</span>
            </TabsTrigger>
            <TabsTrigger value="interactive">
              <Zap className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Interactive</span>
            </TabsTrigger>
            <TabsTrigger value="video">
              <Film className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Video</span>
            </TabsTrigger>
            <TabsTrigger value="materials">
              <BookMarked className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Materials</span>
            </TabsTrigger>
            <TabsTrigger value="assessments">
              <ClipboardCheck className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Assessments</span>
            </TabsTrigger>
            <TabsTrigger value="multimedia">
              <Video className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Multimedia</span>
            </TabsTrigger>
            <TabsTrigger value="monetization">
              <DollarSign className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Monetization</span>
            </TabsTrigger>
            <TabsTrigger value="practice">
              <Target className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Practice</span>
            </TabsTrigger>
            <TabsTrigger value="study">
              <BookOpen className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Study Guides</span>
            </TabsTrigger>
            <TabsTrigger value="realworld">
              <Globe className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Real-World</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4">
            <QuickCourseBuilder />
          </TabsContent>

          <TabsContent value="syllabus" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Syllabus Generator</CardTitle>
                <p className="text-sm text-gray-500">
                  Generate comprehensive course syllabi based on learning objectives and target audience
                </p>
              </CardHeader>
              <CardContent>
                <AISyllabusGenerator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-4">
            <AILessonPlanningAssistant />
          </TabsContent>

          <TabsContent value="descriptions" className="space-y-4">
            <AICourseDescriptionGenerator />
          </TabsContent>

          <TabsContent value="interactive" className="space-y-4">
            <AIInteractiveElementsSuggester />
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <AIVideoScriptGenerator />
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <AISupplementaryMaterialsGenerator />
          </TabsContent>

          <TabsContent value="assessments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Diverse Assessment Generator</CardTitle>
                <p className="text-sm text-gray-500">
                  Create essays, coding challenges, and peer review assignments with AI-generated rubrics
                </p>
              </CardHeader>
              <CardContent>
                <DiverseAssessmentGenerator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multimedia" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Multimedia Content Suggester</CardTitle>
                <p className="text-sm text-gray-500">
                  Get AI-powered suggestions for videos, interactive simulations, and visual aids for your lessons
                </p>
              </CardHeader>
              <CardContent>
                <MultimediaContentSuggester />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monetization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monetization Strategist</CardTitle>
                <p className="text-sm text-gray-500">
                  Get AI-driven pricing strategies and premium content tier recommendations to maximize revenue
                </p>
              </CardHeader>
              <CardContent>
                <MonetizationStrategist />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="practice" className="space-y-4">
            <AIPracticeProblemsGenerator />
          </TabsContent>

          <TabsContent value="study" className="space-y-4">
            <AIStudyGuidesGenerator />
          </TabsContent>

          <TabsContent value="realworld" className="space-y-4">
            <AIRealWorldExamplesIntegrator />
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="border-emerald-500/30 bg-emerald-900/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Wand2 className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-emerald-300 mb-1">AI-Powered Course Creation</h4>
                <p className="text-sm text-gray-400">
                  All tools in the AI Creator Studio analyze industry trends, learning science best practices, 
                  and successful course patterns to help you create engaging, effective, and profitable courses.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}