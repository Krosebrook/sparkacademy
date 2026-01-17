/**
 * AI Content Assistant for Instructors
 * Generates outlines, lesson plans, quizzes, and resources
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Copy, FileText } from 'lucide-react';

export default function AIContentAssistant() {
  const [activeTab, setActiveTab] = useState('outline');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  // Form states
  const [outlineForm, setOutlineForm] = useState({
    topic: '',
    level: 'beginner',
    duration_hours: 10
  });

  const [lessonForm, setLessonForm] = useState({
    topic: '',
    level: 'beginner',
    duration_hours: 2
  });

  const [quizForm, setQuizForm] = useState({
    lesson_text: ''
  });

  const [resourceForm, setResourceForm] = useState({
    topic: '',
    level: 'beginner'
  });

  const generateContent = async (type) => {
    setLoading(true);
    try {
      const payload = 
        type === 'outline' ? { content_type: 'outline', ...outlineForm } :
        type === 'lesson_plan' ? { content_type: 'lesson_plan', ...lessonForm } :
        type === 'quiz' ? { content_type: 'quiz', ...quizForm } :
        { content_type: 'resources', ...resourceForm };

      const result = await base44.functions.invoke('generateAIContentOutline', payload);
      setGeneratedContent(result.data);
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <Card className="card-glow bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Content Assistant
          </CardTitle>
          <p className="text-sm text-gray-400 mt-2">
            Generate course content with AI assistance
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#1a0a2e]/50">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="lesson">Lesson Plan</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Course Outline */}
        <TabsContent value="outline" className="space-y-4">
          <Card className="card-glow">
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Course Topic</label>
                <Input
                  placeholder="e.g., Advanced React Development"
                  value={outlineForm.topic}
                  onChange={(e) => setOutlineForm({ ...outlineForm, topic: e.target.value })}
                  className="bg-[#1a0a2e] border-[#2d1b4e]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">Level</label>
                  <select
                    value={outlineForm.level}
                    onChange={(e) => setOutlineForm({ ...outlineForm, level: e.target.value })}
                    className="w-full bg-[#1a0a2e] border border-[#2d1b4e] rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">Duration (hours)</label>
                  <Input
                    type="number"
                    value={outlineForm.duration_hours}
                    onChange={(e) => setOutlineForm({ ...outlineForm, duration_hours: parseInt(e.target.value) })}
                    className="bg-[#1a0a2e] border-[#2d1b4e]"
                  />
                </div>
              </div>

              <Button 
                onClick={() => generateContent('outline')}
                disabled={loading || !outlineForm.topic}
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Course Outline
                  </>
                )}
              </Button>

              {generatedContent?.content_type === 'outline' && (
                <div className="bg-[#0f0618]/50 rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
                  <h4 className="font-semibold text-cyan-300">Learning Objectives</h4>
                  <ul className="space-y-1">
                    {generatedContent.generated_content.learning_objectives?.map((obj, i) => (
                      <li key={i} className="text-sm text-gray-300">• {obj}</li>
                    ))}
                  </ul>

                  <h4 className="font-semibold text-cyan-300 mt-4">Course Modules</h4>
                  <div className="space-y-2">
                    {generatedContent.generated_content.modules?.map((mod, i) => (
                      <div key={i} className="p-2 bg-cyan-900/20 rounded border-l-2 border-cyan-500">
                        <p className="font-semibold text-white text-sm">{mod.title}</p>
                        <p className="text-xs text-gray-400">{mod.duration_hours}h • {mod.topics.join(', ')}</p>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => copyToClipboard(JSON.stringify(generatedContent.generated_content, null, 2))}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    <Copy className="w-3 h-3 mr-2" /> Copy All
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lesson Plan */}
        <TabsContent value="lesson" className="space-y-4">
          <Card className="card-glow">
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Lesson Topic</label>
                <Input
                  placeholder="e.g., React Hooks Fundamentals"
                  value={lessonForm.topic}
                  onChange={(e) => setLessonForm({ ...lessonForm, topic: e.target.value })}
                  className="bg-[#1a0a2e] border-[#2d1b4e]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">Level</label>
                  <select
                    value={lessonForm.level}
                    onChange={(e) => setLessonForm({ ...lessonForm, level: e.target.value })}
                    className="w-full bg-[#1a0a2e] border border-[#2d1b4e] rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-white mb-2 block">Duration (hours)</label>
                  <Input
                    type="number"
                    value={lessonForm.duration_hours}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration_hours: parseInt(e.target.value) })}
                    className="bg-[#1a0a2e] border-[#2d1b4e]"
                  />
                </div>
              </div>

              <Button 
                onClick={() => generateContent('lesson_plan')}
                disabled={loading || !lessonForm.topic}
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Lesson Plan
                  </>
                )}
              </Button>

              {generatedContent?.content_type === 'lesson_plan' && (
                <div className="bg-[#0f0618]/50 rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
                  <h4 className="font-semibold text-cyan-300">{generatedContent.generated_content.title}</h4>
                  <div className="space-y-2">
                    {generatedContent.generated_content.content_sections?.map((section, i) => (
                      <div key={i} className="p-2 bg-cyan-900/20 rounded">
                        <p className="font-semibold text-white text-sm">{section.section_title}</p>
                        <p className="text-xs text-gray-400">{section.duration_minutes} min</p>
                        <p className="text-xs text-gray-300 mt-1">{section.content.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(generatedContent.generated_content.summary)}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    <Copy className="w-3 h-3 mr-2" /> Copy Summary
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Questions */}
        <TabsContent value="quiz" className="space-y-4">
          <Card className="card-glow">
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Lesson Content</label>
                <Textarea
                  placeholder="Paste your lesson text here..."
                  value={quizForm.lesson_text}
                  onChange={(e) => setQuizForm({ lesson_text: e.target.value })}
                  className="bg-[#1a0a2e] border-[#2d1b4e] text-white"
                  rows={5}
                />
              </div>

              <Button 
                onClick={() => generateContent('quiz')}
                disabled={loading || !quizForm.lesson_text.trim()}
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Quiz
                  </>
                )}
              </Button>

              {generatedContent?.content_type === 'quiz' && (
                <div className="bg-[#0f0618]/50 rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
                  {generatedContent.generated_content.questions?.map((q, i) => (
                    <div key={i} className="p-3 bg-cyan-900/20 rounded-lg border-l-2 border-cyan-500">
                      <p className="font-semibold text-white text-sm mb-2">Q{i + 1}: {q.question}</p>
                      <ul className="space-y-1">
                        {q.options.map((opt, j) => (
                          <li key={j} className={`text-xs px-2 py-1 rounded ${opt === q.correct_answer ? 'bg-green-500/20 text-green-300' : 'text-gray-300'}`}>
                            {String.fromCharCode(65 + j)}) {opt}
                          </li>
                        ))}
                      </ul>
                      <Badge className="mt-2 text-xs">{q.difficulty}</Badge>
                    </div>
                  ))}
                  <Button
                    onClick={() => copyToClipboard(JSON.stringify(generatedContent.generated_content.questions, null, 2))}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                  >
                    <Copy className="w-3 h-3 mr-2" /> Copy Quiz
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources" className="space-y-4">
          <Card className="card-glow">
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Topic</label>
                <Input
                  placeholder="e.g., Machine Learning"
                  value={resourceForm.topic}
                  onChange={(e) => setResourceForm({ ...resourceForm, topic: e.target.value })}
                  className="bg-[#1a0a2e] border-[#2d1b4e]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-white mb-2 block">Level</label>
                <select
                  value={resourceForm.level}
                  onChange={(e) => setResourceForm({ ...resourceForm, level: e.target.value })}
                  className="w-full bg-[#1a0a2e] border border-[#2d1b4e] rounded px-3 py-2 text-white text-sm"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <Button 
                onClick={() => generateContent('resources')}
                disabled={loading || !resourceForm.topic}
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finding Resources...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Suggest Resources
                  </>
                )}
              </Button>

              {generatedContent?.content_type === 'resources' && (
                <div className="bg-[#0f0618]/50 rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
                  {generatedContent.generated_content.videos?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-cyan-300 mb-2">📹 Videos</h4>
                      {generatedContent.generated_content.videos.map((v, i) => (
                        <div key={i} className="text-xs mb-2 p-2 bg-cyan-900/20 rounded">
                          <p className="font-semibold text-white">{v.title}</p>
                          <p className="text-gray-400">{v.source}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {generatedContent.generated_content.articles?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-cyan-300 mb-2">📄 Articles</h4>
                      {generatedContent.generated_content.articles.map((a, i) => (
                        <div key={i} className="text-xs mb-2 p-2 bg-cyan-900/20 rounded">
                          <p className="font-semibold text-white">{a.title}</p>
                          <p className="text-gray-400">{a.source}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}