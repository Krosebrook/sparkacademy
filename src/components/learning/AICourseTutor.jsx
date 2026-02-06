import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, ThumbsUp, ThumbsDown, Lightbulb, BookOpen, X, Maximize2, Minimize2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function AICourseTutor({ courseId, lessonId, courseContent, embedded = false }) {
  const [isOpen, setIsOpen] = useState(embedded);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `👋 Hi! I'm your AI tutor for this lesson. I can help you:\n\n• Understand difficult concepts\n• Get hints for assignments\n• Answer questions about the material\n• Provide additional examples\n\nWhat would you like help with?`
      }]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await base44.functions.invoke('aiTutorChat', {
        courseId,
        lessonId,
        question: userMessage,
        courseContent,
        conversationHistory: messages
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.tutorAdvice,
        messageId: Date.now()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Sorry, I encountered an error. Please try again.' 
      }]);
    }
    setIsLoading(false);
  };

  const handleFeedback = async (messageId, helpful) => {
    try {
      await base44.functions.invoke('trackEngagement', {
        courseId,
        engagementType: 'ai_tutor',
        data: { helpful, messageId }
      });
      toast.success('Thanks for your feedback!');
    } catch (error) {
      console.error('Failed to submit feedback');
    }
  };

  const quickQuestions = [
    "Can you explain this concept in simpler terms?",
    "What's a real-world example of this?",
    "Can you give me a hint for this problem?",
    "What are the key takeaways from this lesson?"
  ];

  if (!isOpen && !embedded) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 z-40"
        size="icon"
      >
        <Bot className="w-6 h-6" />
      </Button>
    );
  }

  if (isMinimized && !embedded) {
    return (
      <Card className="fixed bottom-24 right-6 w-80 shadow-xl z-40 border-blue-500/30 bg-slate-900">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-white">AI Tutor</span>
              <Badge className="bg-blue-600">Online</Badge>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsMinimized(false)} variant="ghost" size="icon" className="h-8 w-8">
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button onClick={() => setIsOpen(false)} variant="ghost" size="icon" className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${embedded ? '' : 'fixed bottom-24 right-6 w-96 h-[600px]'} shadow-xl z-40 border-blue-500/30 bg-slate-900 flex flex-col`}>
      <CardHeader className="border-b border-blue-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-white">AI Tutor</CardTitle>
            <Badge className="bg-blue-600">Online</Badge>
          </div>
          {!embedded && (
            <div className="flex gap-2">
              <Button onClick={() => setIsMinimized(true)} variant="ghost" size="icon" className="h-8 w-8">
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button onClick={() => setIsOpen(false)} variant="ghost" size="icon" className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="p-3 border-b border-blue-500/30">
          <p className="text-xs text-slate-400 mb-2">Quick questions:</p>
          <div className="space-y-2">
            {quickQuestions.map((q, idx) => (
              <Button
                key={idx}
                onClick={() => {
                  setInput(q);
                  handleSend();
                }}
                size="sm"
                variant="outline"
                className="w-full text-xs text-left justify-start h-auto py-2"
              >
                <Lightbulb className="w-3 h-3 mr-2 flex-shrink-0" />
                {q}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-100 border border-slate-700'
              }`}
            >
              {msg.role === 'assistant' ? (
                <>
                  <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
                    {msg.content}
                  </ReactMarkdown>
                  {msg.messageId && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-slate-700">
                      <Button
                        onClick={() => handleFeedback(msg.messageId, true)}
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs"
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Helpful
                      </Button>
                      <Button
                        onClick={() => handleFeedback(msg.messageId, false)}
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs"
                      >
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        Not helpful
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-blue-500/30">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask your AI tutor..."
            className="min-h-[60px] bg-slate-800 border-slate-700 text-white"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}