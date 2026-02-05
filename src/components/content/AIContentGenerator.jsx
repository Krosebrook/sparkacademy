import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { Wand2, FileText, HelpCircle, BookOpen, Link } from 'lucide-react';
import { toast } from 'sonner';

export default function AIContentGenerator() {
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const generateOutline = async (topic, targetAudience) => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateCourseOutline', {
        topic,
        target_audience: targetAudience
      });
      setGeneratedContent({ type: 'outline', data });
      toast.success('Course outline generated!');
    } catch (error) {
      toast.error('Failed to generate outline');
    } finally {
      setLoading(false);
    }
  };

  const generateLessonPlan = async (topic, duration, objectives) => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateLessonPlan', {
        topic,
        duration_minutes: duration,
        learning_objectives: objectives
      });
      setGeneratedContent({ type: 'lesson', data });
      toast.success('Lesson plan generated!');
    } catch (error) {
      toast.error('Failed to generate lesson plan');
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async (content, numQuestions, difficulty) => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateQuizFromText', {
        text_content: content,
        num_questions: numQuestions,
        difficulty
      });
      setGeneratedContent({ type: 'quiz', data });
      toast.success('Quiz generated!');
    } catch (error) {
      toast.error('Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const summarizeContent = async (content, summaryType) => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('summarizeCourseContent', {
        content,
        summary_type: summaryType
      });
      setGeneratedContent({ type: 'summary', data });
      toast.success('Content summarized!');
    } catch (error) {
      toast.error('Failed to summarize content');
    } finally {
      setLoading(false);
    }
  };

  const suggestResources = async (content, topic) => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('suggestSupplementaryResources', {
        course_content: content,
        topic
      });
      setGeneratedContent({ type: 'resources', data });
      toast.success('Resources suggested!');
    } catch (error) {
      toast.error('Failed to suggest resources');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            AI Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="outline">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="outline">
                <FileText className="w-4 h-4 mr-2" />
                Outline
              </TabsTrigger>
              <TabsTrigger value="lesson">
                <BookOpen className="w-4 h-4 mr-2" />
                Lesson
              </TabsTrigger>
              <TabsTrigger value="quiz">
                <HelpCircle className="w-4 h-4 mr-2" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="resources">
                <Link className="w-4 h-4 mr-2" />
                Resources
              </TabsTrigger>
            </TabsList>

            <TabsContent value="outline" className="space-y-4">
              <OutlineGenerator onGenerate={generateOutline} loading={loading} />
            </TabsContent>

            <TabsContent value="lesson" className="space-y-4">
              <LessonPlanGenerator onGenerate={generateLessonPlan} loading={loading} />
            </TabsContent>

            <TabsContent value="quiz" className="space-y-4">
              <QuizGenerator onGenerate={generateQuiz} loading={loading} />
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <ContentSummarizer onGenerate={summarizeContent} loading={loading} />
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <ResourceSuggester onGenerate={suggestResources} loading={loading} />
            </TabsContent>
          </Tabs>

          {generatedContent && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold mb-2">Generated Content:</h3>
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(generatedContent.data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OutlineGenerator({ onGenerate, loading }) {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');

  return (
    <>
      <Input
        placeholder="Enter course topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <Input
        placeholder="Target audience (e.g., beginners, professionals)"
        value={audience}
        onChange={(e) => setAudience(e.target.value)}
      />
      <Button
        onClick={() => onGenerate(topic, audience)}
        disabled={loading || !topic}
        className="w-full"
      >
        {loading ? 'Generating...' : 'Generate Outline'}
      </Button>
    </>
  );
}

function LessonPlanGenerator({ onGenerate, loading }) {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(60);
  const [objectives, setObjectives] = useState('');

  return (
    <>
      <Input
        placeholder="Lesson topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
      />
      <Textarea
        placeholder="Learning objectives (one per line)"
        value={objectives}
        onChange={(e) => setObjectives(e.target.value)}
      />
      <Button
        onClick={() => onGenerate(topic, duration, objectives.split('\n').filter(Boolean))}
        disabled={loading || !topic}
        className="w-full"
      >
        {loading ? 'Generating...' : 'Generate Lesson Plan'}
      </Button>
    </>
  );
}

function QuizGenerator({ onGenerate, loading }) {
  const [content, setContent] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');

  return (
    <>
      <Textarea
        placeholder="Paste course content here"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
      />
      <Input
        type="number"
        placeholder="Number of questions"
        value={numQuestions}
        onChange={(e) => setNumQuestions(Number(e.target.value))}
      />
      <Button
        onClick={() => onGenerate(content, numQuestions, difficulty)}
        disabled={loading || !content}
        className="w-full"
      >
        {loading ? 'Generating...' : 'Generate Quiz'}
      </Button>
    </>
  );
}

function ContentSummarizer({ onGenerate, loading }) {
  const [content, setContent] = useState('');
  const [summaryType, setSummaryType] = useState('detailed');

  return (
    <>
      <Textarea
        placeholder="Paste content to summarize"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
      />
      <Button
        onClick={() => onGenerate(content, summaryType)}
        disabled={loading || !content}
        className="w-full"
      >
        {loading ? 'Summarizing...' : 'Summarize Content'}
      </Button>
    </>
  );
}

function ResourceSuggester({ onGenerate, loading }) {
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');

  return (
    <>
      <Input
        placeholder="Course topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <Textarea
        placeholder="Course content summary"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />
      <Button
        onClick={() => onGenerate(content, topic)}
        disabled={loading || !content || !topic}
        className="w-full"
      >
        {loading ? 'Finding Resources...' : 'Suggest Resources'}
      </Button>
    </>
  );
}