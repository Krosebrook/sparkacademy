import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Loader2, X, MessageSquare, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';

export default function AITutorWidget({ course, currentLesson, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi! I'm your AI tutor for "${course.title}". ${currentLesson ? `We're currently on: "${currentLesson.title}".` : ''}\n\nI can help you understand concepts, answer questions, and clarify anything you're confused about. What would you like to know?`
      }]);
    }
  }, [isOpen, course, currentLesson, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const lessonContext = currentLesson ? `
Current Lesson: ${currentLesson.title}
Lesson Content: ${currentLesson.content?.replace(/<[^>]*>/g, '').substring(0, 1000)}...
` : '';

      const context = `You are an expert AI tutor helping a student learn "${course.title}".

Course Description: ${course.description}
${lessonContext}

Student Question: ${userMessage}

Provide a clear, encouraging explanation. Use examples and analogies. Break down complex topics into simple terms. Be supportive and patient.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: context,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error invoking LLM:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try asking again!' 
      }]);
    }
    setIsLoading(false);
  };

  const quickQuestions = [
    "Can you explain this in simpler terms?",
    "Give me a real-world example",
    "What are the key takeaways?",
    "How does this relate to previous lessons?"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <CardTitle className="text-base">AI Course Tutor</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-4 h-4" />
            </Button>
          </div>
          {currentLesson && (
            <Badge className="bg-white/20 text-white text-xs mt-2">
              Lesson: {currentLesson.title}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-white text-slate-800 shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-xl px-3 py-2 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-white border-t">
              <p className="text-xs text-slate-600 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Quick questions:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((q, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-2 text-left justify-start"
                    onClick={() => setInput(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask anything..."
                disabled={isLoading}
                className="text-sm"
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}