import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { Loader2, Zap, Copy, Check } from 'lucide-react';

export default function AIInteractiveElementsSuggester() {
  const [loading, setLoading] = useState(false);
  const [lessonTopic, setLessonTopic] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [elements, setElements] = useState(null);
  const [copiedType, setCopiedType] = useState(null);

  const generate = async () => {
    if (!lessonTopic.trim()) {
      alert('Please enter a lesson topic');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateInteractiveElements', {
        lesson_topic: lessonTopic.trim(),
        learning_objectives: learningObjectives.trim()
      });
      
      if (data) {
        setElements(data);
      }
    } catch (error) {
      console.error('Interactive elements error:', error);
      alert('Failed to generate interactive elements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyContent = (type, content) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Interactive Elements Suggester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Lesson Topic</label>
            <Input
              value={lessonTopic}
              onChange={(e) => setLessonTopic(e.target.value)}
              placeholder="e.g., Introduction to React Hooks"
              className="bg-[#1a0a2e]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Learning Objectives (Optional)</label>
            <Textarea
              value={learningObjectives}
              onChange={(e) => setLearningObjectives(e.target.value)}
              placeholder="e.g., Students will understand useState and useEffect..."
              className="bg-[#1a0a2e] h-20"
            />
          </div>

          <Button onClick={generate} disabled={loading} className="w-full btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
            Generate Interactive Elements
          </Button>
        </div>

        {elements && (
          <div className="border-t border-gray-700 pt-4">
            <Tabs defaultValue="quizzes" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-[#1a0a2e] border border-gray-700">
                <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                <TabsTrigger value="polls">Polls</TabsTrigger>
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
              </TabsList>

              <TabsContent value="quizzes" className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-blue-500/20 text-blue-300">
                    {elements.quizzes?.length || 0} Quiz Questions
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyContent('quizzes', elements.quizzes)}
                  >
                    {copiedType === 'quizzes' ? <><Check className="w-3 h-3 mr-1" /> Copied!</> : <><Copy className="w-3 h-3 mr-1" /> Copy All</>}
                  </Button>
                </div>
                {elements.quizzes?.map((quiz, idx) => (
                  <div key={idx} className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <div className="font-medium text-white text-sm mb-2">{quiz.question}</div>
                    <div className="space-y-1 mb-2">
                      {quiz.options?.map((opt, i) => (
                        <div key={i} className={`text-xs p-2 rounded ${opt === quiz.correct_answer ? 'bg-green-500/20 text-green-300' : 'bg-gray-800/50 text-gray-400'}`}>
                          {opt} {opt === quiz.correct_answer && '✓'}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-400">💡 {quiz.explanation}</div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="polls" className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-purple-500/20 text-purple-300">
                    {elements.polls?.length || 0} Poll Questions
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyContent('polls', elements.polls)}
                  >
                    {copiedType === 'polls' ? <><Check className="w-3 h-3 mr-1" /> Copied!</> : <><Copy className="w-3 h-3 mr-1" /> Copy All</>}
                  </Button>
                </div>
                {elements.polls?.map((poll, idx) => (
                  <div key={idx} className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                    <div className="font-medium text-white text-sm mb-2">{poll.question}</div>
                    <div className="space-y-1 mb-2">
                      {poll.options?.map((opt, i) => (
                        <div key={i} className="text-xs p-2 rounded bg-gray-800/50 text-gray-300">
                          {opt}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-400">Purpose: {poll.purpose}</div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="discussions" className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-cyan-500/20 text-cyan-300">
                    {elements.discussion_prompts?.length || 0} Discussion Prompts
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyContent('discussions', elements.discussion_prompts)}
                  >
                    {copiedType === 'discussions' ? <><Check className="w-3 h-3 mr-1" /> Copied!</> : <><Copy className="w-3 h-3 mr-1" /> Copy All</>}
                  </Button>
                </div>
                {elements.discussion_prompts?.map((prompt, idx) => (
                  <div key={idx} className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3">
                    <div className="font-medium text-white text-sm mb-2">{prompt.prompt}</div>
                    <div className="text-xs text-gray-400 mb-2">Type: {prompt.type}</div>
                    <div className="bg-gray-800/50 rounded p-2">
                      <div className="text-xs text-white mb-1">Follow-up questions:</div>
                      {prompt.follow_up_questions?.map((q, i) => (
                        <div key={i} className="text-xs text-gray-300">• {q}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}