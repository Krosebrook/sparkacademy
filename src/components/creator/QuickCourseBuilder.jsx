import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Loader2, Sparkles, CheckCircle, BookOpen, Target, Users, Lightbulb } from 'lucide-react';

export default function QuickCourseBuilder() {
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState({
    topic: '',
    audience: '',
    objectives: ''
  });
  const [generatedContent, setGeneratedContent] = useState(null);

  const generateFullCourse = async () => {
    if (!courseData.topic || !courseData.audience || !courseData.objectives) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Generate syllabus
      const syllabusResponse = await base44.functions.invoke('generateSyllabus', {
        topic: courseData.topic,
        targetAudience: courseData.audience,
        learningObjectives: courseData.objectives,
        duration: '8 weeks'
      });

      // Generate lesson outlines
      const lessonResponse = await base44.functions.invoke('generateLessonPlan', {
        topic: courseData.topic,
        targetAudience: courseData.audience,
        lessonNumber: 1,
        duration: '60 minutes'
      });

      // Generate practice problems
      const practiceResponse = await base44.functions.invoke('generatePracticeProblems', {
        topic: courseData.topic,
        difficulty: 'beginner',
        count: 5
      });

      setGeneratedContent({
        syllabus: syllabusResponse.data,
        lessons: lessonResponse.data,
        practice: practiceResponse.data
      });
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate course content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Quick AI Course Builder
          </CardTitle>
          <p className="text-sm text-gray-400">
            Generate a complete course structure with syllabus, lesson outlines, and practice projects in seconds
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              Course Topic
            </label>
            <Input
              value={courseData.topic}
              onChange={(e) => setCourseData({ ...courseData, topic: e.target.value })}
              placeholder="e.g., Advanced Machine Learning"
              className="bg-[#1a0a2e] border-purple-500/30"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Target Audience
            </label>
            <Input
              value={courseData.audience}
              onChange={(e) => setCourseData({ ...courseData, audience: e.target.value })}
              placeholder="e.g., Data Science Professionals"
              className="bg-[#1a0a2e] border-blue-500/30"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Learning Objectives
            </label>
            <Textarea
              value={courseData.objectives}
              onChange={(e) => setCourseData({ ...courseData, objectives: e.target.value })}
              placeholder="Describe what students will achieve..."
              className="bg-[#1a0a2e] border-emerald-500/30 min-h-[100px]"
            />
          </div>

          <Button 
            onClick={generateFullCourse} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-base shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Course with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Complete Course
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <Card className="bg-purple-900/10 border-purple-500/20">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
            <h3 className="text-lg font-bold mb-2">AI is crafting your course...</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Generating syllabus structure
              </p>
              <p className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating lesson outlines
              </p>
              <p className="flex items-center justify-center gap-2 opacity-50">
                Designing practice projects
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedContent && (
        <div className="space-y-4">
          <Card className="bg-emerald-900/20 border-emerald-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-300">
                <CheckCircle className="w-5 h-5" />
                Course Syllabus Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0a0a0a] rounded-lg p-4 mb-4">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(generatedContent.syllabus, null, 2)}
                </pre>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300">
                {generatedContent.syllabus?.modules?.length || 0} Modules Created
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-300">
                <CheckCircle className="w-5 h-5" />
                Lesson Outlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generatedContent.lessons?.outline?.map((section, idx) => (
                  <div key={idx} className="bg-blue-900/10 rounded-lg p-3 border border-blue-500/20">
                    <h4 className="font-semibold text-sm mb-1">{section.section_title}</h4>
                    <p className="text-xs text-gray-400">{section.duration} • {section.learning_objective}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-300">
                <Lightbulb className="w-5 h-5" />
                Practice Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generatedContent.practice?.problems?.map((problem, idx) => (
                  <div key={idx} className="bg-purple-900/10 rounded-lg p-3 border border-purple-500/20">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{problem.question}</h4>
                      <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                        {problem.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">{problem.hint}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12">
            <CheckCircle className="w-5 h-5 mr-2" />
            Save Course & Continue Editing
          </Button>
        </div>
      )}
    </div>
  );
}