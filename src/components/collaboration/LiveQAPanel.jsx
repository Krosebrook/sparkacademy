/**
 * Live Q&A Panel Component
 * 
 * Integrated Q&A during live video sessions
 * Features question upvoting, instructor answering, real-time updates
 * 
 * @component
 * @param {Object} session - LiveQASession entity data
 * @param {boolean} isInstructor - Whether user is the instructor
 */

import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, Send, CheckCircle, Clock } from 'lucide-react';

export default function LiveQAPanel({ session, isInstructor = false }) {
  const [questions, setQuestions] = useState(session.questions || []);
  const [newQuestion, setNewQuestion] = useState('');
  const [answerText, setAnswerText] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const questionsEndRef = useRef(null);

  useEffect(() => {
    loadUser();
    // Subscribe to real-time updates
    const unsubscribe = base44.entities.LiveQASession.subscribe((event) => {
      if (event.id === session.id && event.type === 'update') {
        setQuestions(event.data.questions || []);
      }
    });

    return unsubscribe;
  }, [session.id]);

  useEffect(() => {
    questionsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [questions]);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const submitQuestion = async () => {
    if (!newQuestion.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const newQ = {
        id: `q-${Date.now()}`,
        student_email: user.email,
        student_name: user.full_name,
        question: newQuestion,
        asked_at: new Date().toISOString(),
        upvotes: 0,
        answered: false
      };

      const updatedQuestions = [...questions, newQ];
      await base44.entities.LiveQASession.update(session.id, {
        questions: updatedQuestions
      });

      setQuestions(updatedQuestions);
      setNewQuestion('');
    } catch (error) {
      console.error('Failed to submit question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAnswer = async (questionId) => {
    if (!answerText[questionId]?.trim()) return;

    try {
      const updatedQuestions = questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            answered: true,
            answer: answerText[questionId],
            answered_at: new Date().toISOString()
          };
        }
        return q;
      });

      await base44.entities.LiveQASession.update(session.id, {
        questions: updatedQuestions
      });

      setQuestions(updatedQuestions);
      setAnswerText(prev => ({ ...prev, [questionId]: '' }));
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const upvoteQuestion = async (questionId) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        return { ...q, upvotes: (q.upvotes || 0) + 1 };
      }
      return q;
    });

    try {
      await base44.entities.LiveQASession.update(session.id, {
        questions: updatedQuestions
      });
      setQuestions(updatedQuestions);
    } catch (error) {
      console.error('Failed to upvote question:', error);
    }
  };

  // Sort questions: unanswered first, then by upvotes
  const sortedQuestions = [...questions].sort((a, b) => {
    if (a.answered !== b.answered) return a.answered ? 1 : -1;
    return (b.upvotes || 0) - (a.upvotes || 0);
  });

  return (
    <Card className="card-glow h-full">
      <CardHeader>
        <CardTitle>Live Q&A</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Questions List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedQuestions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No questions yet. Ask the instructor!</p>
          ) : (
            sortedQuestions.map((q) => (
              <div
                key={q.id}
                className={`p-4 rounded-lg border ${
                  q.answered
                    ? 'bg-green-900/20 border-green-500/30'
                    : 'bg-cyan-900/20 border-cyan-500/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-white">{q.student_name}</div>
                    <p className="text-sm text-gray-300 mt-2">{q.question}</p>
                  </div>
                  {q.answered && (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  )}
                </div>

                {!q.answered && !isInstructor && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      onClick={() => upvoteQuestion(q.id)}
                      variant="ghost"
                      size="sm"
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {q.upvotes || 0}
                    </Button>
                  </div>
                )}

                {/* Answer Section */}
                {q.answered ? (
                  <div className="mt-3 p-3 bg-black/20 rounded border-l-2 border-green-400">
                    <p className="text-sm text-gray-200">{q.answer}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Answered {new Date(q.answered_at).toLocaleTimeString()}
                    </p>
                  </div>
                ) : isInstructor ? (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      value={answerText[q.id] || ''}
                      onChange={(e) =>
                        setAnswerText(prev => ({
                          ...prev,
                          [q.id]: e.target.value
                        }))
                      }
                      placeholder="Type your answer..."
                      className="bg-[#1a0a2e] border-cyan-500/30 h-20 text-sm"
                    />
                    <Button
                      onClick={() => submitAnswer(q.id)}
                      disabled={!answerText[q.id]?.trim()}
                      size="sm"
                      className="btn-primary w-full"
                    >
                      <Send className="w-3 h-3 mr-2" />
                      Answer
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          )}
          <div ref={questionsEndRef} />
        </div>

        {/* New Question Input */}
        <div className="border-t border-gray-700 pt-4 space-y-2">
          <Textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask a question during the session..."
            className="bg-[#1a0a2e] border-cyan-500/30 h-20"
          />
          <Button
            onClick={submitQuestion}
            disabled={isSubmitting || !newQuestion.trim()}
            className="btn-primary w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Ask Question'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}