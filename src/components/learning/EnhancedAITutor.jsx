import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, Lightbulb, AlertCircle, Target, TrendingUp } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function EnhancedAITutor({ courseId, currentLesson, onConfusionUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [confusionPoints, setConfusionPoints] = useState([]);
  const [studyPlan, setStudyPlan] = useState(null);
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => base44.entities.Course.get(courseId),
    enabled: !!courseId
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', courseId],
    queryFn: async () => {
      const user = await base44.auth.me();
      const enrollments = await base44.entities.Enrollment.filter({
        course_id: courseId,
        student_email: user.email
      });
      return enrollments[0];
    },
    enabled: !!courseId
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length >= 3) {
      analyzeConfusionPoints();
    }
  }, [messages]);

  const analyzeConfusionPoints = async () => {
    const recentMessages = messages.slice(-5);
    const questionCount = recentMessages.filter(m => m.role === 'user' && m.content.includes('?')).length;
    
    if (questionCount >= 2) {
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze these student questions for confusion patterns:

${recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

Current lesson: ${currentLesson?.title || 'N/A'}

Identify:
1. Main confusion points
2. Knowledge gaps
3. Proactive suggestions to clarify`,
          response_json_schema: {
            type: "object",
            properties: {
              confusion_points: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    topic: { type: "string" },
                    severity: { type: "string" },
                    suggestion: { type: "string" }
                  }
                }
              }
            }
          }
        });
        
        const points = result.confusion_points || [];
        setConfusionPoints(points);
        if (onConfusionUpdate) onConfusionUpdate(points);
      } catch (error) {
        console.error("Failed to analyze confusion:", error);
      }
    }
  };

  const generateStudyPlan = async () => {
    setIsTyping(true);
    try {
      const learningGoal = user?.learning_goal || '';
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a personalized study plan for this student:

Course: ${course?.title}
Current Progress: ${enrollment?.completion_percentage || 0}%
Completed Lessons: ${enrollment?.completed_lessons?.length || 0}
Learning Goal: ${learningGoal || 'Complete the course'}
Recent Confusion Points: ${confusionPoints.map(c => c.topic).join(', ')}

Generate a 7-day study plan aligned with their learning goal, including:
1. Daily focus topics
2. Recommended exercises
3. Review sessions
4. Practice problems
5. Milestones`,
        response_json_schema: {
          type: "object",
          properties: {
            plan_name: { type: "string" },
            duration_days: { type: "number" },
            daily_schedule: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  focus_topic: { type: "string" },
                  activities: { type: "array", items: { type: "string" } },
                  estimated_time: { type: "string" }
                }
              }
            },
            milestones: { type: "array", items: { type: "string" } }
          }
        }
      });

      setStudyPlan(result);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I've created a personalized ${result.duration_days}-day study plan for you! Check the Study Plan tab to see it.`
      }]);
    } catch (error) {
      console.error("Failed to generate study plan:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const learningGoal = user?.learning_goal || '';
      
      const context = `
Course: ${course?.title}
Current Lesson: ${currentLesson?.title || 'N/A'}
Student Progress: ${enrollment?.completion_percentage || 0}%
Learning Goal: ${learningGoal || 'Not specified'}
Recent Confusion: ${confusionPoints.map(c => c.topic).join(', ')}
`;

      const conversationHistory = messages.slice(-6).map(m => 
        `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`
      ).join('\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI tutor helping a student. Provide helpful, encouraging responses tailored to their learning goal.

Context:
${context}

Conversation:
${conversationHistory}
Student: ${input}

Adapt your response to align with their learning goal. Provide:
1. Clear explanation relevant to their goal
2. Examples that connect to their goal
3. Guided steps if it's a problem
4. Encouragement that reinforces their goal

Keep responses concise and student-friendly.`
      });

      setMessages(prev => [...prev, { role: 'assistant', content: result }]);
    } catch (error) {
      console.error("Failed to get tutor response:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble right now. Please try again!"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Chat Interface */}
      <div className="lg:col-span-2">
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              AI Tutor - Personalized Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-96 overflow-y-auto space-y-4 p-4 bg-[#0f0618]/50 rounded-lg">
              {messages.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-purple-400/30" />
                  <p>Ask me anything about the course!</p>
                  <p className="text-sm mt-2">I'll provide guided help and adapt to your learning style.</p>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-purple-900/30 border border-purple-500/30' 
                      : 'bg-cyan-900/20 border border-cyan-500/30'
                  }`}>
                    <ReactMarkdown className="text-sm text-gray-200 prose prose-sm prose-invert max-w-none">
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-cyan-900/20 border border-cyan-500/30 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask a question..."
                className="bg-[#1a0a2e]"
              />
              <Button onClick={sendMessage} disabled={!input.trim() || isTyping} className="btn-primary">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Insights */}
      <div className="space-y-4">
        {/* Confusion Points */}
        {confusionPoints.length > 0 && (
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                Detected Confusion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {confusionPoints.map((point, idx) => (
                <div key={idx} className="p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-white text-sm">{point.topic}</div>
                    <Badge className={
                      point.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                      point.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-blue-500/20 text-blue-300'
                    }>
                      {point.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">{point.suggestion}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Study Plan */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-green-400" />
              Personalized Study Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!studyPlan ? (
              <Button onClick={generateStudyPlan} disabled={isTyping} className="btn-secondary w-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate Plan
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-cyan-300">{studyPlan.plan_name}</div>
                <div className="space-y-2">
                  {studyPlan.daily_schedule?.slice(0, 3).map((day) => (
                    <div key={day.day} className="p-2 bg-green-900/20 border border-green-500/30 rounded text-xs">
                      <div className="font-medium text-white mb-1">Day {day.day}: {day.focus_topic}</div>
                      <div className="text-gray-400">{day.estimated_time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Quick Help
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full text-xs justify-start"
              onClick={() => setInput("Can you explain this concept in simpler terms?")}
            >
              Explain simpler
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-xs justify-start"
              onClick={() => setInput("Can you give me a real-world example?")}
            >
              Real-world example
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-xs justify-start"
              onClick={() => setInput("What are the key points I should remember?")}
            >
              Key takeaways
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}