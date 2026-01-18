import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Wand2, FileText, HelpCircle, Loader2, Copy, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AICourseAssistant({ onContentGenerated }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('outline');
  const [copied, setCopied] = useState(false);

  // Outline generation
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [outline, setOutline] = useState(null);

  // Lesson generation
  const [lessonPrompt, setLessonPrompt] = useState('');
  const [lessonContent, setLessonContent] = useState(null);

  // Quiz generation
  const [quizTopic, setQuizTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizQuestions, setQuizQuestions] = useState(null);

  const generateOutline = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateCourseOutline', {
        topic,
        target_audience: targetAudience
      });
      setOutline(data);
    } catch (error) {
      console.error('Outline generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLesson = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateLessonContent', {
        prompt: lessonPrompt
      });
      setLessonContent(data);
    } catch (error) {
      console.error('Lesson generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateQuizQuestions', {
        topic: quizTopic,
        num_questions: numQuestions
      });
      setQuizQuestions(data);
    } catch (error) {
      console.error('Quiz generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          AI Course Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="outline">Course Outline</TabsTrigger>
            <TabsTrigger value="lesson">Lesson Content</TabsTrigger>
            <TabsTrigger value="quiz">Quiz Questions</TabsTrigger>
          </TabsList>

          {/* Course Outline */}
          <TabsContent value="outline" className="space-y-4">
            <div>
              <Label>Course Topic</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Introduction to Python Programming"
              />
            </div>
            <div>
              <Label>Target Audience</Label>
              <Input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Beginners with no programming experience"
              />
            </div>
            <Button onClick={generateOutline} disabled={loading || !topic}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
              Generate Outline
            </Button>

            {outline && (
              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{outline.title}</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(JSON.stringify(outline, null, 2))}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-sm text-gray-400">{outline.description}</p>
                <div className="space-y-3">
                  {outline.modules?.map((module, idx) => (
                    <div key={idx} className="border-l-2 border-purple-500 pl-4">
                      <h4 className="font-medium text-white mb-1">Module {idx + 1}: {module.title}</h4>
                      <ul className="space-y-1">
                        {module.lessons?.map((lesson, lessonIdx) => (
                          <li key={lessonIdx} className="text-sm text-gray-400">
                            • {lesson}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Lesson Content */}
          <TabsContent value="lesson" className="space-y-4">
            <div>
              <Label>Lesson Description</Label>
              <Textarea
                value={lessonPrompt}
                onChange={(e) => setLessonPrompt(e.target.value)}
                placeholder="Describe what this lesson should cover..."
                rows={4}
              />
            </div>
            <Button onClick={generateLesson} disabled={loading || !lessonPrompt}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
              Generate Content
            </Button>

            {lessonContent && (
              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge>Generated Content</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(lessonContent.content)}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="text-gray-300 whitespace-pre-wrap">{lessonContent.content}</div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Quiz Questions */}
          <TabsContent value="quiz" className="space-y-4">
            <div>
              <Label>Quiz Topic</Label>
              <Input
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                placeholder="e.g., Variables and Data Types in Python"
              />
            </div>
            <div>
              <Label>Number of Questions</Label>
              <Input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                min="3"
                max="10"
              />
            </div>
            <Button onClick={generateQuiz} disabled={loading || !quizTopic}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <HelpCircle className="w-4 h-4 mr-2" />}
              Generate Quiz
            </Button>

            {quizQuestions && (
              <div className="space-y-4">
                {quizQuestions.questions?.map((q, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3">Question {idx + 1}: {q.question}</h4>
                    <div className="space-y-2">
                      {q.options?.map((option, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-2 rounded ${
                            optIdx === q.correct_answer
                              ? 'bg-green-500/20 border border-green-500/50'
                              : 'bg-gray-700'
                          }`}
                        >
                          <span className="text-sm text-gray-300">{option}</span>
                          {optIdx === q.correct_answer && (
                            <Badge className="ml-2 text-xs bg-green-500">Correct</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}