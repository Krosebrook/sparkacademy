import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Bot, Send, Loader2, Lightbulb } from 'lucide-react';

export default function AITutorChat({ courseId, lessonTopic }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your AI tutor. I'm here to help you understand AI concepts, answer questions, and provide personalized guidance. What would you like to learn about?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await base44.functions.invoke('aiTutorChat', {
        question: input,
        course_id: courseId,
        lesson_topic: lessonTopic,
        context: messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer
      }]);
    } catch (error) {
      console.error('Tutor error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Explain this concept in simpler terms",
    "Give me a real-world example",
    "What should I learn next?",
    "How can I apply this in my role?"
  ];

  return (
    <Card className="card-glow h-full flex flex-col">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" />
          AI Tutor
        </CardTitle>
        <p className="text-xs text-gray-400">Ask questions, get explanations, receive personalized guidance</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-blue-400 font-semibold">AI Tutor</span>
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="cursor-pointer hover:bg-blue-900/30 transition-colors"
                onClick={() => setInput(prompt)}
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                {prompt}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask a question..."
              className="bg-[#1a0a2e] resize-none"
              rows={2}
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="btn-primary"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}