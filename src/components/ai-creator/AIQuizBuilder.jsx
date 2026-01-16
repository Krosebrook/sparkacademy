import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2 } from "lucide-react";

export default function AIQuizBuilder({ onQuizGenerated }) {
  const [lessonContent, setLessonContent] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [quiz, setQuiz] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuiz = async () => {
    if (!lessonContent) return;
    
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this lesson content, generate ${numQuestions} high-quality quiz questions:

${lessonContent}

Create questions that:
1. Test understanding, not just memorization
2. Cover different difficulty levels
3. Include practical application scenarios
4. Have clear, unambiguous correct answers
5. Include helpful explanations for each answer`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            passing_score: { type: "number" },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question_text: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_option_index: { type: "number" },
                  difficulty: { type: "string" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      setQuiz(result);
      if (onQuizGenerated) onQuizGenerated(result);
    } catch (error) {
      console.error("Failed to generate quiz:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-400" />
          AI Quiz Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Lesson Content</label>
          <Textarea
            value={lessonContent}
            onChange={(e) => setLessonContent(e.target.value)}
            placeholder="Paste your lesson content here..."
            className="bg-[#1a0a2e] font-mono h-32"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Number of Questions</label>
          <Input
            type="number"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            min={3}
            max={20}
            className="bg-[#1a0a2e]"
          />
        </div>

        <Button
          onClick={generateQuiz}
          disabled={!lessonContent || isGenerating}
          className="btn-primary w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Quiz...
            </>
          ) : (
            'Generate Quiz Questions'
          )}
        </Button>

        {quiz && (
          <div className="space-y-4 mt-6">
            <div className="p-4 bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-500/30 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-2">{quiz.title}</h3>
              <p className="text-sm text-gray-400">Passing Score: {quiz.passing_score}%</p>
            </div>

            <div className="space-y-3">
              {quiz.questions?.map((q, idx) => (
                <div key={idx} className="p-4 bg-[#0f0618]/50 rounded-lg border border-green-500/20">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-white">
                      Question {idx + 1}: {q.question_text}
                    </h4>
                    <Badge className={
                      q.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                      q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }>
                      {q.difficulty}
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-3">
                    {q.options?.map((option, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-2 rounded text-sm ${
                          optIdx === q.correct_option_index
                            ? 'bg-green-900/30 border border-green-500/50 text-green-300'
                            : 'bg-[#1a0a2e] text-gray-400'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}. {option}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 bg-blue-900/20 p-2 rounded">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}