import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { HelpCircle, Loader2, CheckCircle2, Copy, Check } from 'lucide-react';

export default function AIQuizAssignmentGenerator({ courseId, lessonTopic }) {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState(lessonTopic || '');
  const [type, setType] = useState('quiz');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [items, setItems] = useState(null);
  const [copied, setCopied] = useState({});

  const generateItems = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateQuizAssignment', {
        topic: topic.trim(),
        type,
        difficulty,
        count,
        course_id: courseId
      });
      setItems(data);
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyItem = (idx, text) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [idx]: true });
    setTimeout(() => setCopied({ ...copied, [idx]: false }), 2000);
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-green-400" />
          AI Quiz & Assignment Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Topic</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., React Hooks"
              className="bg-[#1a0a2e]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-[#1a0a2e]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz Questions</SelectItem>
                  <SelectItem value="assignment">Assignments</SelectItem>
                  <SelectItem value="discussion">Discussion Prompts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-1 block">Difficulty</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="bg-[#1a0a2e]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-1 block">Count</label>
              <Input
                type="number"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
                min={1}
                max={20}
                className="bg-[#1a0a2e]"
              />
            </div>
          </div>

          <Button 
            onClick={generateItems} 
            disabled={loading || !topic.trim()}
            className="w-full btn-primary"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <HelpCircle className="w-4 h-4 mr-2" />}
            Generate {type === 'quiz' ? 'Quiz' : type === 'assignment' ? 'Assignments' : 'Prompts'}
          </Button>
        </div>

        {items && (
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">
                Generated {items.items?.length || 0} {type === 'quiz' ? 'Questions' : 'Items'}
              </span>
              <Badge className={
                difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                difficulty === 'hard' ? 'bg-red-500/20 text-red-300' :
                'bg-yellow-500/20 text-yellow-300'
              }>
                {difficulty}
              </Badge>
            </div>

            <div className="space-y-3">
              {items.items?.map((item, idx) => (
                <div key={idx} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <span className="text-cyan-400 font-semibold">{idx + 1}.</span>
                        <span className="text-white text-sm">{item.question || item.prompt}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyItem(idx, item.question || item.prompt)}
                      className="h-6 w-6 p-0"
                    >
                      {copied[idx] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>

                  {type === 'quiz' && item.options && (
                    <div className="ml-6 space-y-1">
                      {item.options.map((option, i) => (
                        <div key={i} className="text-sm text-gray-300 flex items-center gap-2">
                          <span className={item.correct_answer === i ? 'text-green-400' : 'text-gray-500'}>
                            {String.fromCharCode(65 + i)}.
                          </span>
                          <span className={item.correct_answer === i ? 'text-green-300' : ''}>
                            {option}
                          </span>
                          {item.correct_answer === i && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {item.explanation && (
                    <div className="ml-6 mt-2 text-xs text-gray-400 bg-blue-500/10 p-2 rounded">
                      <strong>Explanation:</strong> {item.explanation}
                    </div>
                  )}

                  {type === 'assignment' && item.rubric && (
                    <div className="ml-6 mt-2">
                      <div className="text-xs font-semibold text-gray-300 mb-1">Grading Rubric:</div>
                      <ul className="space-y-1">
                        {item.rubric.map((criterion, i) => (
                          <li key={i} className="text-xs text-gray-400">• {criterion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}