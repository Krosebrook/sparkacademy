import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Sparkles, Brain, TrendingUp, Award, Send } from 'lucide-react';

export default function AIDebate() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [topic, setTopic] = useState('');
  const [position, setPosition] = useState('');
  const [currentSession, setCurrentSession] = useState(null);
  const [userMessage, setUserMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const userCourses = await base44.entities.Course.filter({ is_published: true });
      setCourses(userCourses);

      const userSessions = await base44.entities.DebateSession.filter({ user_email: userData.email });
      setSessions(userSessions);
    } catch (error) {
      console.error('Error loading AI debate data:', error);
    }
  };

  const startDebate = async () => {
    const course = courses.find(c => c.id === selectedCourse);
    
    try {
      const session = await base44.entities.DebateSession.create({
        user_email: user.email,
        course_id: selectedCourse,
        topic,
        position,
        messages: [],
        session_date: new Date().toISOString(),
        status: 'active'
      });

      // AI opens the debate
      const openingMessage = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a skilled debater. The user is defending this position: "${position}" on the topic: "${topic}". This is related to the course: ${course.title}.

Start the debate by presenting a counter-argument. Be respectful but challenging. Encourage critical thinking.`
      });

      session.messages = [{
        role: 'ai',
        content: openingMessage,
        timestamp: new Date().toISOString()
      }];

      await base44.entities.DebateSession.update(session.id, { messages: session.messages });
      setCurrentSession(session);
    } catch (error) {
      console.error('Error starting debate:', error);
      alert('Failed to start debate');
    }
  };

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    setIsThinking(true);
    try {
      // Add user message
      const userMsg = {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      };
      currentSession.messages.push(userMsg);

      // Get AI response
      const conversationHistory = currentSession.messages
        .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
        .join('\n\n');

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are engaged in a debate about: "${currentSession.topic}"
        
The user is defending: "${currentSession.position}"

Conversation so far:
${conversationHistory}

User's latest argument: ${userMessage}

Respond with:
1. A counter-argument or challenge
2. Point out any logical fallacies if present
3. Ask a thought-provoking question
4. Keep it respectful and constructive

Your response should help the user develop better critical thinking and argumentation skills.`
      });

      const aiMsg = {
        role: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      currentSession.messages.push(aiMsg);

      await base44.entities.DebateSession.update(currentSession.id, {
        messages: currentSession.messages,
        duration_minutes: Math.floor((new Date() - new Date(currentSession.session_date)) / 60000)
      });

      setCurrentSession({...currentSession});
      setUserMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
    setIsThinking(false);
  };

  const endDebate = async () => {
    setIsThinking(true);
    try {
      // Get AI feedback on the debate
      const conversationHistory = currentSession.messages
        .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
        .join('\n\n');

      const feedback = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this debate and provide constructive feedback:

Topic: ${currentSession.topic}
User's Position: ${currentSession.position}

Debate Transcript:
${conversationHistory}

Provide feedback on:
1. Overall argumentation quality (score 1-10)
2. Logical consistency (score 1-10)
3. Evidence quality (score 1-10)
4. Critical thinking demonstrated (score 1-10)
5. Key strengths (list 2-3)
6. Areas for improvement (list 2-3)

Return JSON with this structure:
{
  "overall_score": number,
  "logical_consistency": number,
  "evidence_quality": number,
  "critical_thinking": number,
  "strengths": ["strength 1", "strength 2"],
  "improvement_areas": ["area 1", "area 2"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            logical_consistency: { type: "number" },
            evidence_quality: { type: "number" },
            critical_thinking: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            improvement_areas: { type: "array", items: { type: "string" } }
          }
        }
      });

      await base44.entities.DebateSession.update(currentSession.id, {
        ai_feedback: feedback,
        status: 'completed'
      });

      setCurrentSession({
        ...currentSession,
        ai_feedback: feedback,
        status: 'completed'
      });
    } catch (error) {
      console.error('Error ending debate:', error);
      alert('Failed to get feedback');
    }
    setIsThinking(false);
  };

  if (!user) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-500" />
            AI Debate Partner
          </h1>
          <p className="text-slate-600 mt-2">
            Practice critical thinking and argumentation skills with AI
          </p>
        </header>

        {!currentSession || currentSession.status === 'completed' ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Start New Debate */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Start New Debate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Related Course</label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Debate Topic</label>
                  <Textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Is remote work more productive than office work?"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Your Position</label>
                  <Textarea
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g., Yes, remote work is more productive because..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={startDebate}
                  disabled={!selectedCourse || !topic || !position}
                  className="w-full"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Debate
                </Button>
              </CardContent>
            </Card>

            {/* Past Debates */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Past Debates</CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No debates yet. Start your first one!</p>
                ) : (
                  <div className="space-y-3">
                    {sessions.slice(-5).reverse().map(session => (
                      <div key={session.id} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{session.topic}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(session.session_date).toLocaleDateString()}
                            </p>
                          </div>
                          {session.ai_feedback && (
                            <Badge>
                              Score: {Math.round(session.ai_feedback.overall_score)}/10
                            </Badge>
                          )}
                        </div>
                        {session.ai_feedback && (
                          <div className="mt-3 text-xs text-slate-600">
                            <p className="font-medium mb-1">Strengths:</p>
                            <ul className="space-y-0.5">
                              {session.ai_feedback.strengths.slice(0, 2).map((s, i) => (
                                <li key={i}>• {s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Debate Header */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-800 mb-1">{currentSession.topic}</h2>
                    <p className="text-sm text-slate-600">Your position: {currentSession.position}</p>
                  </div>
                  <Badge variant="secondary">
                    {currentSession.messages.filter(m => m.role === 'user').length} Arguments
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Debate Messages */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
                  {currentSession.messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-2xl px-4 py-3">
                        <Sparkles className="w-5 h-5 animate-spin text-slate-600" />
                      </div>
                    </div>
                  )}
                </div>

                {currentSession.status === 'active' ? (
                  <div className="space-y-3">
                    <Textarea
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      placeholder="Present your argument..."
                      rows={4}
                      disabled={isThinking}
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={sendMessage}
                        disabled={!userMessage.trim() || isThinking}
                        className="flex-1"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Argument
                      </Button>
                      <Button
                        onClick={endDebate}
                        variant="outline"
                        disabled={currentSession.messages.length < 4}
                      >
                        End Debate & Get Feedback
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Card className="border-0 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-600" />
                        Debate Feedback
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Overall Score</p>
                          <p className="text-2xl font-bold text-slate-800">
                            {currentSession.ai_feedback.overall_score}/10
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Critical Thinking</p>
                          <p className="text-2xl font-bold text-slate-800">
                            {currentSession.ai_feedback.critical_thinking}/10
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-2">Strengths</p>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {currentSession.ai_feedback.strengths.map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-2">Areas to Improve</p>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {currentSession.ai_feedback.improvement_areas.map((a, i) => (
                              <li key={i}>• {a}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <Button onClick={() => setCurrentSession(null)} className="w-full mt-4">
                        Start New Debate
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}