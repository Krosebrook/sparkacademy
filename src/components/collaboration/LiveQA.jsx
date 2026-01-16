import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Video, Send, ThumbsUp, CheckCircle, Clock, Users } from "lucide-react";

export default function LiveQA({ sessionId, isInstructor }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [answeringId, setAnsweringId] = useState(null);
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ['qa-session', sessionId],
    queryFn: () => base44.entities.LiveQASession.get(sessionId),
    refetchInterval: 3000
  });

  const askQuestionMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const newQuestion = {
        id: Date.now().toString(),
        student_email: user.email,
        student_name: user.full_name,
        question,
        asked_at: new Date().toISOString(),
        upvotes: 0,
        answered: false
      };
      return base44.entities.LiveQASession.update(sessionId, {
        questions: [...(session.questions || []), newQuestion]
      });
    },
    onSuccess: () => {
      setQuestion("");
      queryClient.invalidateQueries({ queryKey: ['qa-session', sessionId] });
    }
  });

  const upvoteQuestionMutation = useMutation({
    mutationFn: (questionId) => {
      const updatedQuestions = session.questions.map(q =>
        q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
      );
      return base44.entities.LiveQASession.update(sessionId, {
        questions: updatedQuestions
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['qa-session', sessionId] })
  });

  const answerQuestionMutation = useMutation({
    mutationFn: ({ questionId, answer }) => {
      const updatedQuestions = session.questions.map(q =>
        q.id === questionId ? {
          ...q,
          answered: true,
          answer,
          answered_at: new Date().toISOString()
        } : q
      );
      return base44.entities.LiveQASession.update(sessionId, {
        questions: updatedQuestions
      });
    },
    onSuccess: () => {
      setAnsweringId(null);
      setAnswer("");
      queryClient.invalidateQueries({ queryKey: ['qa-session', sessionId] });
    }
  });

  const sortedQuestions = [...(session?.questions || [])].sort((a, b) => {
    if (a.answered !== b.answered) return a.answered ? 1 : -1;
    return b.upvotes - a.upvotes;
  });

  return (
    <Card className="card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="w-6 h-6 text-red-400" />
            {session?.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={session?.status === 'live' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}>
              {session?.status === 'live' && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>}
              {session?.status}
            </Badge>
            <Badge variant="outline">
              <Users className="w-3 h-3 mr-1" />
              {session?.participants?.length || 0}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Info */}
        <div className="p-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg">
          <div className="text-sm text-gray-400">{session?.description}</div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {session?.scheduled_time && new Date(session.scheduled_time).toLocaleString()}
            </span>
            <span>{session?.duration_minutes} minutes</span>
          </div>
        </div>

        {/* Ask Question Form */}
        {!isInstructor && session?.status === 'live' && (
          <div className="space-y-2">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your question..."
              className="bg-[#1a0a2e] h-20"
            />
            <Button
              onClick={() => askQuestionMutation.mutate()}
              disabled={!question}
              className="btn-primary w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Ask Question
            </Button>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-cyan-300">
            Questions ({sortedQuestions.length})
          </h4>
          {sortedQuestions.map((q) => (
            <div
              key={q.id}
              className={`p-4 rounded-lg border ${
                q.answered
                  ? 'bg-green-900/20 border-green-500/30'
                  : 'bg-[#0f0618]/50 border-cyan-500/20'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{q.student_name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(q.asked_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{q.question}</p>
                </div>
                <div className="flex items-center gap-2">
                  {q.answered && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {!isInstructor && !q.answered && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => upvoteQuestionMutation.mutate(q.id)}
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {q.upvotes}
                    </Button>
                  )}
                </div>
              </div>

              {q.answered && q.answer && (
                <div className="mt-3 p-3 bg-green-900/30 rounded border-l-2 border-green-400">
                  <div className="text-xs text-gray-400 mb-1">Instructor's Answer:</div>
                  <div className="text-sm text-gray-200">{q.answer}</div>
                </div>
              )}

              {isInstructor && !q.answered && answeringId === q.id && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    className="bg-[#1a0a2e] h-20"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => answerQuestionMutation.mutate({ questionId: q.id, answer })}
                      className="btn-primary"
                    >
                      Submit Answer
                    </Button>
                    <Button variant="outline" onClick={() => setAnsweringId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {isInstructor && !q.answered && answeringId !== q.id && (
                <Button
                  size="sm"
                  onClick={() => setAnsweringId(q.id)}
                  className="mt-2"
                  variant="outline"
                >
                  Answer Question
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}