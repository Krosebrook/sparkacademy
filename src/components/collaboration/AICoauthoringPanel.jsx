import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, CheckCircle, Edit3, Zap, BookOpen, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AICoauthoringPanel({ documentId, currentContent, onContentUpdate }) {
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState('');

  const generateSuggestions = async (type) => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('aiCoauthoringSuggestions', {
        documentId,
        currentContent,
        context,
        suggestionType: type
      });
      
      setSuggestions(response.data.suggestions);
      toast.success('AI suggestions generated!');
    } catch (error) {
      toast.error('Failed to generate suggestions');
    }
    setIsLoading(false);
  };

  const applySuggestion = (suggestion) => {
    if (onContentUpdate) {
      onContentUpdate(suggestion.revised_content);
      toast.success('Suggestion applied!');
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            AI Co-Authoring Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 block mb-2">Context (optional)</label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Provide context like: target audience level, course goals, specific topics to focus on..."
              className="bg-slate-800 border-slate-700 text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Button
              onClick={() => generateSuggestions('expand')}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Expand
            </Button>
            <Button
              onClick={() => generateSuggestions('restructure')}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Restructure
            </Button>
            <Button
              onClick={() => generateSuggestions('simplify')}
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Simplify
            </Button>
            <Button
              onClick={() => generateSuggestions('enhance')}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Enhance
            </Button>
            <Button
              onClick={() => generateSuggestions('proofread')}
              disabled={isLoading}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Proofread
            </Button>
          </div>
        </CardContent>
      </Card>

      {suggestions && (
        <Card className="bg-slate-900 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">AI Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.suggestions?.map((suggestion, idx) => (
              <div key={idx} className="bg-slate-800 rounded-lg p-4 border border-purple-500/20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge className="bg-purple-600 mb-2">{suggestion.section}</Badge>
                    <p className="text-sm text-red-400 mb-1">Issue: {suggestion.issue}</p>
                    <p className="text-sm text-green-400">Suggestion: {suggestion.suggestion}</p>
                  </div>
                  <Button
                    onClick={() => applySuggestion(suggestion)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Apply
                  </Button>
                </div>
                
                {suggestion.revised_content && (
                  <div className="mt-3 p-3 bg-slate-700 rounded border border-slate-600">
                    <p className="text-xs text-slate-400 mb-2">Revised Content:</p>
                    <p className="text-sm text-white">{suggestion.revised_content}</p>
                  </div>
                )}
                
                <p className="text-xs text-slate-400 mt-2 italic">{suggestion.rationale}</p>
              </div>
            ))}

            {suggestions.teaching_tips && (
              <div className="bg-slate-800 rounded-lg p-4 border border-blue-500/20">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-400" />
                  Teaching Tips
                </h4>
                <ul className="space-y-2">
                  {suggestions.teaching_tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {suggestions.overall_assessment && (
              <div className="bg-slate-800 rounded-lg p-4 border border-green-500/20">
                <h4 className="text-white font-semibold mb-2">Overall Assessment</h4>
                <p className="text-sm text-slate-300">{suggestions.overall_assessment}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}