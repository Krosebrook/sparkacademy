import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, X, Minimize2, Maximize2, Send, Sparkles, MessageCircle, BookOpen, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

export default function AIAssistant({ currentPage, onStartTour }) {
  const [isOpen, setIsOpen] = useState(false);
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
      // Welcome message when opening
      setMessages([{
        role: 'assistant',
        content: `👋 Hi! I'm your AI assistant. I can help you with:\n\n• Understanding features on this page\n• Step-by-step walkthroughs\n• Best practices and tips\n• Answering questions about the platform\n\nWhat would you like help with?`
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
      const context = `User is on the "${currentPage}" page. Provide helpful, specific guidance about this page and answer their question. Be concise and actionable.`;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${context}\n\nUser question: ${userMessage}`,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Sorry, I encountered an error. Please try again.' 
      }]);
    }
    setIsLoading(false);
  };

  const handleQuickAction = async (action) => {
    setIsLoading(true);
    let prompt = '';

    switch(action) {
      case 'explain':
        prompt = `Explain what the "${currentPage}" page is for and what users can do here. Be specific and practical.`;
        break;
      case 'guide':
        prompt = `Provide a step-by-step guide for using the "${currentPage}" page effectively. Include tips and best practices.`;
        break;
      case 'tips':
        prompt = `Give me 5 actionable tips and best practices for the "${currentPage}" page.`;
        break;
    }

    setMessages(prev => [...prev, { role: 'user', content: prompt }]);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `User is on "${currentPage}" page. ${prompt}`,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Sorry, I encountered an error. Please try again.' 
      }]);
    }
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 z-50"
        size="icon"
      >
        <HelpCircle className="w-6 h-6" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <Card className="fixed bottom-6 right-6 w-80 shadow-xl z-50 border-purple-500/30 bg-slate-900">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="font-semibold text-white">AI Assistant</span>
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
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-xl z-50 border-purple-500/30 bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="font-semibold text-white">AI Assistant</span>
        </div>
        <div className="flex gap-2">
          {onStartTour && (
            <Button 
              onClick={onStartTour}
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              title="Start walkthrough"
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
          <Button onClick={() => setIsMinimized(true)} variant="ghost" size="icon" className="h-8 w-8">
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button onClick={() => setIsOpen(false)} variant="ghost" size="icon" className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-purple-500/30 flex gap-2 flex-wrap">
        <Button 
          onClick={() => handleQuickAction('explain')}
          size="sm"
          variant="outline"
          className="text-xs"
          disabled={isLoading}
        >
          <BookOpen className="w-3 h-3 mr-1" />
          Explain this page
        </Button>
        <Button 
          onClick={() => handleQuickAction('guide')}
          size="sm"
          variant="outline"
          className="text-xs"
          disabled={isLoading}
        >
          <MessageCircle className="w-3 h-3 mr-1" />
          Step-by-step guide
        </Button>
        <Button 
          onClick={() => handleQuickAction('tips')}
          size="sm"
          variant="outline"
          className="text-xs"
          disabled={isLoading}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Tips & tricks
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-100 border border-slate-700'
              }`}
            >
              {msg.role === 'assistant' ? (
                <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
                  {msg.content}
                </ReactMarkdown>
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
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-purple-500/30">
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
            placeholder="Ask me anything..."
            className="min-h-[60px] bg-slate-800 border-slate-700 text-white"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}