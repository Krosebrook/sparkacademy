import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Send, Sparkles, Loader2, BookOpen, Zap, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';

export default function AITutor() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI Learning Assistant. 👋\n\nI can help you with:\n• Explaining course concepts\n• Answering questions about lessons\n• Providing study tips and resources\n• Breaking down complex topics\n\nSelect a course to get started, or ask me anything!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      const userCourses = await base44.entities.Course.filter({ created_by: userData.email });
      setCourses(userCourses);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      let context = `You are an expert AI tutor helping students learn effectively. 
You provide clear, patient explanations and break down complex topics into simple terms.
Be encouraging and supportive.

Student question: ${userMessage}`;

      let addContextFromInternet = true;

      if (selectedCourse) {
        addContextFromInternet = false;
        const course = courses.find(c => c.id === selectedCourse);
        context = `You are an expert AI tutor for the course "${course.title}".

Course description: ${course.description}
Course topics: ${course.lessons?.map(l => l.title).join(', ') || 'General topics'}

Student question: ${userMessage}

Provide a detailed, helpful explanation. Use examples and analogies when appropriate.`;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: context,
        add_context_from_internet: addContextFromInternet
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

  const quickPrompts = [
    { text: 'Explain this in simple terms', icon: Sparkles },
    { text: 'Give me a real-world example', icon: BookOpen },
    { text: 'What are the key points?', icon: Zap },
    { text: 'How can I practice this?', icon: Bot }
  ];

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
  };

  const clearCourse = () => {
    setSelectedCourse(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-xl">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">AI Learning Assistant</h1>
          </div>
          <p className="text-slate-600 text-sm md:text-base">Your personal tutor, available 24/7</p>
        </div>

        {/* Course Selection Bar */}
        <Card className="border-0 shadow-lg mb-6 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-600 mb-2 block">Course Context (Optional)</label>
                <Select value={selectedCourse || ''} onValueChange={(value) => setSelectedCourse(value || null)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a course for context-aware answers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>General Questions (No Course)</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCourse && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearCourse}
                  className="md:mt-6"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
            {selectedCourse && (
              <Badge className="mt-3 bg-purple-100 text-purple-700">
                <BookOpen className="w-3 h-3 mr-1" />
                Context: {courses.find(c => c.id === selectedCourse)?.title}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Quick Prompts - Now prominently displayed */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Quick Prompts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickPrompts.map((prompt, idx) => {
              const Icon = prompt.icon;
              return (
                <Button
                  key={idx}
                  variant="outline"
                  className="h-auto py-3 px-4 text-left justify-start hover:bg-purple-50 hover:border-purple-300 transition-all"
                  onClick={() => handleQuickPrompt(prompt.text)}
                >
                  <Icon className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
                  <span className="text-sm">{prompt.text}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <div className="h-[500px] md:h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                      : 'bg-slate-100 text-slate-800 shadow-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl px-4 py-3 shadow-md">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 border-t bg-slate-50">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask anything about your courses or learning..."
                  disabled={isLoading}
                  className="flex-1 text-sm md:text-base"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg flex-shrink-0"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                💡 Tip: Use quick prompts above or select a course for more specific answers
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}