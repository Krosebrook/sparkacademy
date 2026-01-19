import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { PenTool, Loader2, Copy, Check, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AILessonContentDrafter({ courseId, lessonOutline }) {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState(lessonOutline?.title || '');
  const [keyPoints, setKeyPoints] = useState('');
  const [content, setContent] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateContent = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateLessonContent', {
        topic: topic.trim(),
        key_points: keyPoints.trim(),
        outline: lessonOutline,
        course_id: courseId
      });
      setContent(data);
    } catch (error) {
      console.error('Content generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (content?.content) {
      navigator.clipboard.writeText(content.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <PenTool className="w-5 h-5 text-purple-400" />
          AI Lesson Content Drafter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Lesson Topic</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Introduction to React Hooks"
              className="bg-[#1a0a2e]"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Key Points to Cover (Optional)</label>
            <Textarea
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="e.g., useState basics, useEffect lifecycle, custom hooks..."
              rows={3}
              className="bg-[#1a0a2e]"
            />
          </div>

          <Button 
            onClick={generateContent} 
            disabled={loading || !topic.trim()}
            className="w-full btn-primary"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PenTool className="w-4 h-4 mr-2" />}
            Generate Content
          </Button>
        </div>

        {content && (
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-white text-sm">Generated Content</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="text-xs"
              >
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>

            {content.word_count && (
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {content.word_count} words
                </Badge>
                {content.reading_time && (
                  <Badge variant="outline" className="text-xs">
                    ~{content.reading_time} min read
                  </Badge>
                )}
              </div>
            )}

            <div className="bg-[#1a0a2e] border border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
              <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
                {content.content}
              </ReactMarkdown>
            </div>

            {content.suggestions?.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-white mb-2">Enhancement Suggestions</h4>
                <ul className="space-y-1">
                  {content.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-gray-300">• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}