/**
 * Enhanced AI Tutor with Cross-Course Context
 * 
 * Now with:
 * - Access to all enrolled courses and lessons
 * - Contextual understanding across courses
 * - Proactive prerequisite suggestions
 * - Knowledge gap identification across curriculum
 */

import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, AlertCircle, Lightbulb, BookOpen, BarChart3 } from 'lucide-react';

export default function EnhancedAITutorCrossContext() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [identifiedGaps, setIdentifiedGaps] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: enrollments } = useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => {
      const enr = await base44.entities.Enrollment.filter({ student_email: user?.email });
      return enr;
    },
    enabled: !!user?.email
  });

  const { data: allCourses } = useQuery({
    queryKey: ['enrolledCourses'],
    queryFn: async () => {
      if (!enrollments?.length) return [];
      const courses = await base44.entities.Course.list();
      return courses.filter(c => enrollments.some(e => e.course_id === c.id));
    },
    enabled: !!enrollments?.length
  });

  const { data: learningPaths } = useQuery({
    queryKey: ['learningPaths'],
    queryFn: async () => {
      const paths = await base44.entities.LearningPathProgress?.filter({ 
        user_email: user?.email 
      }).catch(() => []);
      return paths;
    },
    enabled: !!user?.email
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Build comprehensive context from all courses
      const courseContext = allCourses?.map(course => ({
        title: course.title,
        category: course.category,
        completed: enrollments?.find(e => e.course_id === course.id)?.completion_percentage === 100,
        lessons: course.lessons?.map(l => l.title) || [],
        quiz_score: enrollments?.find(e => e.course_id === course.id)?.quiz_average || 0
      })) || [];

      const gapContext = learningPaths?.flatMap(lp => lp.knowledge_gaps || []) || [];

      // Get AI response with comprehensive context
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an advanced AI Tutor with access to the student's complete learning profile.

Student's Learning Context:
- Enrolled Courses: ${allCourses?.map(c => c.title).join(', ') || 'None'}
- Completed Courses: ${allCourses?.filter(c => enrollments?.find(e => e.course_id === c.id && e.completion_percentage === 100))?.map(c => c.title).join(', ') || 'None'}
- In-Progress Courses: ${allCourses?.filter(c => enrollments?.find(e => e.course_id === c.id && e.completion_percentage < 100))?.map(c => c.title).join(', ') || 'None'}
- Identified Knowledge Gaps: ${gapContext.map(g => g.topic).join(', ') || 'None'}
- Course Details:
${JSON.stringify(courseContext, null, 2)}

Student's Current Question: "${userMessage}"

Based on this comprehensive context:
1. Answer their question thoroughly, referencing relevant lessons from their courses
2. If there are prerequisite gaps, explain what they should learn first
3. Suggest related topics from their other enrolled courses that would help
4. Identify any knowledge gaps that might be relevant to their question

Provide actionable advice and be encouraging.`,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            related_courses: { type: "array", items: { type: "string" } },
            prerequisite_gaps: { type: "array", items: { type: "string" } },
            proactive_suggestions: { type: "array", items: { type: "string" } },
            next_learning_steps: { type: "array", items: { type: "string" } }
          }
        }
      });

      const tutorMessage = response.answer;
      setMessages(prev => [...prev, { 
        role: 'tutor', 
        content: tutorMessage,
        metadata: response
      }]);

      // Update identified gaps and suggestions
      if (response.prerequisite_gaps?.length > 0) {
        setIdentifiedGaps(response.prerequisite_gaps);
      }
      if (response.proactive_suggestions?.length > 0) {
        setSuggestions(response.proactive_suggestions);
      }
    } catch (error) {
      console.error('Error getting tutor response:', error);
      setMessages(prev => [...prev, { 
        role: 'tutor', 
        content: 'I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            AI Tutor - Smart Learning Assistant
          </CardTitle>
          <p className="text-sm text-gray-400 mt-2">
            I have access to your complete learning profile across all courses and can identify knowledge gaps
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <div className="bg-[#0f0618]/50 rounded-lg p-4 h-96 overflow-y-auto space-y-4 border border-[#2d1b4e]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Lightbulb className="w-12 h-12 text-purple-400/30 mb-3" />
                <p className="text-gray-400 text-sm mb-4">Ask me anything about your courses!</p>
                <div className="space-y-2 text-xs text-gray-500">
                  <p>💡 I can answer questions about your lessons</p>
                  <p>📚 Suggest related topics from your courses</p>
                  <p>🎯 Help identify knowledge gaps</p>
                  <p>📈 Guide your personalized learning path</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-purple-600/50 text-white' 
                      : 'bg-cyan-600/20 text-gray-300 border border-cyan-500/30'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 rounded-lg border border-cyan-500/30">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span className="text-sm text-gray-300">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Identified Gaps */}
          {identifiedGaps.length > 0 && (
            <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <p className="text-xs font-semibold text-yellow-300 mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Knowledge Gaps Identified
              </p>
              <div className="space-y-1">
                {identifiedGaps.map((gap, idx) => (
                  <p key={idx} className="text-xs text-yellow-200">• {gap}</p>
                ))}
              </div>
            </div>
          )}

          {/* Proactive Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <p className="text-xs font-semibold text-green-300 mb-2 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> Recommended Next Steps
              </p>
              <div className="space-y-1">
                {suggestions.map((sugg, idx) => (
                  <p key={idx} className="text-xs text-green-200">→ {sugg}</p>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask me about your courses..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="bg-[#1a0a2e] border-[#2d1b4e] text-white"
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !input.trim()}
              className="btn-primary"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course Context Summary */}
      {allCourses && (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Your Learning Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {allCourses.map(course => {
                const enrollment = enrollments?.find(e => e.course_id === course.id);
                return (
                  <div key={course.id} className="p-3 bg-[#0f0618]/50 rounded-lg border border-[#2d1b4e]">
                    <p className="text-sm font-semibold text-white mb-1">{course.title}</p>
                    <div className="flex items-center gap-2">
                      {enrollment?.completion_percentage === 100 ? (
                        <Badge className="bg-green-500/20 text-green-300 text-xs">Completed</Badge>
                      ) : (
                        <Badge className="bg-blue-500/20 text-blue-300 text-xs">{enrollment?.completion_percentage || 0}%</Badge>
                      )}
                      {enrollment?.quiz_average && (
                        <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                          Score: {enrollment.quiz_average.toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}