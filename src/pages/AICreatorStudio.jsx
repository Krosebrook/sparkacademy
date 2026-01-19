import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, FileText, ClipboardCheck, Video, DollarSign } from 'lucide-react';
import AISyllabusGenerator from '@/components/creator/AISyllabusGenerator';
import DiverseAssessmentGenerator from '@/components/creator/DiverseAssessmentGenerator';
import MultimediaContentSuggester from '@/components/creator/MultimediaContentSuggester';
import MonetizationStrategist from '@/components/creator/MonetizationStrategist';

export default function AICreatorStudio() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Wand2 className="w-8 h-8" />
            <h1 className="text-3xl font-bold">AI Creator Studio</h1>
          </div>
          <p className="text-amber-100">
            Supercharge your course creation with AI-powered syllabi, assessments, content ideas, and monetization strategies
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="syllabus" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="syllabus">
              <FileText className="w-4 h-4 mr-2" />
              Syllabus
            </TabsTrigger>
            <TabsTrigger value="assessments">
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Assessments
            </TabsTrigger>
            <TabsTrigger value="multimedia">
              <Video className="w-4 h-4 mr-2" />
              Multimedia
            </TabsTrigger>
            <TabsTrigger value="monetization">
              <DollarSign className="w-4 h-4 mr-2" />
              Monetization
            </TabsTrigger>
          </TabsList>

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
        </Tabs>

        {/* Info Card */}
        <Card className="border-green-500/30 bg-green-50/50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Wand2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">AI-Powered Course Creation</h4>
                <p className="text-sm text-green-800">
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