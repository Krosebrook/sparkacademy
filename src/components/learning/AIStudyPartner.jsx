import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { MessageCircle, Lightbulb, HelpCircle, Sparkles, Send, Loader2 } from 'lucide-react';

export default function AIStudyPartner({ courseId, lessonTitle, lessonContent }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('chat'); // chat, explain, practice, quiz
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const context = `You are an AI study partner helping a student learn. 
Current lesson: ${lessonTitle || 'General topic'}
Lesson content: ${lessonContent?.substring(0, 500) || 'No specific content provided'}

Mode: ${mode}
${mode === 'explain' ? 'Explain concepts in simple terms with analogies and examples.' : ''}
${mode === 'practice' ? 'Generate practice problems or flashcards based on the content.' : ''}
${mode === 'quiz' ? 'Ask quiz questions to test understanding and provide feedback.' : ''}`;

      const { data } = await base44.functions.invoke('generateAIResponse', {
        prompt: `${context}\n\nStudent: ${userMessage}`,
        max_tokens: 500
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || 'I apologize, but I encountered an issue. Please try again.' 
      }]);
    } catch (error) {
      console.error('Study partner error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I had trouble responding. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Explain this', mode: 'explain', icon: Lightbulb },
    { label: 'Practice problems', mode: 'practice', icon: Sparkles },
    { label: 'Quiz me', mode: 'quiz', icon: HelpCircle }
  ];

  return (
    <Card className="card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            AI Study Partner
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {mode === 'chat' && 'Chat Mode'}
            {mode === 'explain' && 'Explain Mode'}
            {mode === 'practice' && 'Practice Mode'}
            {mode === 'quiz' && 'Quiz Mode'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <Button
                key={action.mode}
                size="sm"
                variant={mode === action.mode ? 'default' : 'outline'}
                onClick={() => setMode(action.mode)}
                className="text-xs"
              >
                <Icon className="w-3 h-3 mr-1" />
                {action.label}
              </Button>
            );
          })}
        </div>

        {/* Messages */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Ask me anything about this lesson!</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-100 rounded-lg px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              mode === 'explain' ? 'Ask me to explain a concept...' :
              mode === 'practice' ? 'Request practice problems...' :
              mode === 'quiz' ? 'Ask me to quiz you...' :
              'Ask me anything...'
            }
            className="resize-none"
            rows={2}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}