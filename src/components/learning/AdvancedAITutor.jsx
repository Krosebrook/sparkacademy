import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, Lightbulb, HelpCircle, Sparkles, Send, Loader2, AlertTriangle, Briefcase, Target } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdvancedAITutor({ courseId, lessonTitle, lessonContent, userEmail }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [weakSpots, setWeakSpots] = useState(null);
  const [careerPath, setCareerPath] = useState(null);
  const [scenario, setScenario] = useState(null);
  const messagesEndRef = useRef(null);

  const { data: enrollments } = useQuery({
    queryKey: ['enrollments', userEmail],
    queryFn: () => base44.entities.Enrollment?.filter({ student_email: userEmail }),
    enabled: !!userEmail
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeTab === 'weakspots' && !weakSpots) {
      analyzeWeakSpots();
    } else if (activeTab === 'career' && !careerPath) {
      analyzeCareerPath();
    }
  }, [activeTab]);

  const analyzeWeakSpots = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('analyzeWeakSpots', {
        user_email: userEmail,
        course_id: courseId
      });
      setWeakSpots(data);
    } catch (error) {
      console.error('Weak spot analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeCareerPath = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('recommendCareerPath', {
        user_email: userEmail
      });
      setCareerPath(data);
    } catch (error) {
      console.error('Career path error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateScenario = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateScenario', {
        course_id: courseId,
        lesson_title: lessonTitle
      });
      setScenario(data);
    } catch (error) {
      console.error('Scenario generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const context = `You are an advanced AI tutor helping a student learn.
Current lesson: ${lessonTitle || 'General topic'}
Lesson content: ${lessonContent?.substring(0, 500) || 'No specific content provided'}

Provide detailed, personalized help. Use examples and analogies.`;

      const { data } = await base44.functions.invoke('generateAIResponse', {
        prompt: `${context}\n\nStudent: ${userMessage}`
      });

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || 'I apologize, but I encountered an issue. Please try again.' 
      }]);
    } catch (error) {
      console.error('Tutor error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I had trouble responding. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Advanced AI Tutor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="weakspots">Weak Spots</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="career">Career</TabsTrigger>
          </TabsList>

          {/* Chat */}
          <TabsContent value="chat" className="space-y-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Ask me anything - I'm here to help you master this topic!</p>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-100'
                  }`}>
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
                placeholder="Ask me anything..."
                className="resize-none"
                rows={2}
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Weak Spots */}
          <TabsContent value="weakspots" className="space-y-4">
            {loading && <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400" />}
            
            {weakSpots && (
              <div className="space-y-4">
                {weakSpots.weak_areas?.map((area, idx) => (
                  <div key={idx} className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{area.topic}</h4>
                        <p className="text-sm text-gray-300 mb-2">{area.reason}</p>
                        <Progress value={area.mastery_level} className="h-2 mb-2" />
                        <p className="text-xs text-gray-400">Mastery: {area.mastery_level}%</p>
                        <div className="mt-3">
                          <p className="text-sm text-gray-300 mb-2">Recommended actions:</p>
                          <ul className="space-y-1">
                            {area.recommendations?.map((rec, i) => (
                              <li key={i} className="text-sm text-gray-400">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Scenarios */}
          <TabsContent value="scenarios" className="space-y-4">
            {!scenario && (
              <div className="text-center py-8">
                <Button onClick={generateScenario} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lightbulb className="w-4 h-4 mr-2" />}
                  Generate Real-World Scenario
                </Button>
              </div>
            )}

            {scenario && (
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Scenario</h4>
                  <p className="text-sm text-gray-300 mb-4">{scenario.scenario}</p>
                  <h5 className="font-medium text-white mb-2">Your Task:</h5>
                  <p className="text-sm text-gray-300">{scenario.task}</p>
                </div>
                <Textarea
                  placeholder="Write your solution here..."
                  rows={6}
                  className="resize-none"
                />
                <Button>Submit for AI Feedback</Button>
              </div>
            )}
          </TabsContent>

          {/* Career Path */}
          <TabsContent value="career" className="space-y-4">
            {loading && <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400" />}
            
            {careerPath && (
              <div className="space-y-4">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Recommended Career Paths
                  </h4>
                  <div className="space-y-3">
                    {careerPath.paths?.map((path, idx) => (
                      <div key={idx} className="bg-gray-800/50 rounded-lg p-3">
                        <h5 className="font-medium text-white mb-1">{path.title}</h5>
                        <p className="text-sm text-gray-400 mb-2">{path.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{path.match_score}% match</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Skills needed:</p>
                        <div className="flex flex-wrap gap-1">
                          {path.required_skills?.map((skill, i) => (
                            <Badge key={i} className="text-xs bg-purple-600/20 text-purple-300">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Recommended Next Steps
                  </h4>
                  <ul className="space-y-2">
                    {careerPath.next_courses?.map((course, idx) => (
                      <li key={idx} className="text-sm text-gray-300">
                        {idx + 1}. {course}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}