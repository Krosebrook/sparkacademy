import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, HelpCircle, Copy } from "lucide-react";

export default function AIQuizGenerator() {
  const [lessonContent, setLessonContent] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateQuiz = async () => {
    if (!lessonContent.trim()) return;
    setIsLoading(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a comprehensive quiz from this lesson content:

${lessonContent}

Generate:
1. 5-8 multiple-choice questions covering key concepts
2. Mix of difficulty levels (easy, medium, hard)
3. Clear, unambiguous options
4. One correct answer per question
5. Explanations for why correct answer is right
6. 2-3 essay/short-answer questions for deeper assessment

Format each MC question with 4 options (A, B, C, D).
Include a passing score suggestion (0-100).`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            passing_score: { type: "number" },
            multiple_choice: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_option: { type: "number" },
                  explanation: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            },
            essay_questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  rubric: { type: "string" }
                }
              }
            }
          }
        }
      });

      setQuiz(result);
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-green-600" />
          AI Quiz Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!quiz ? (
          <>
            <p className="text-sm text-slate-600">
              Paste lesson content and AI will generate a complete quiz with MC questions, explanations, and essay prompts.
            </p>

            <Textarea
              placeholder="Paste your lesson content here..."
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              className="min-h-32"
            />

            <Button
              onClick={generateQuiz}
              disabled={isLoading || !lessonContent.trim()}
              className="w-full bg-green-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating quiz...
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Generate Quiz
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">{quiz.title}</h3>
              <span className="text-sm text-slate-600">
                Passing: {quiz.passing_score}%
              </span>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Multiple Choice Questions</h4>
              <div className="space-y-3">
                {quiz.multiple_choice?.map((q, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <p className="font-semibold text-slate-900 text-sm">
                        Q{idx + 1}. {q.question}
                      </p>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {q.difficulty}
                      </span>
                    </div>
                    <ul className="space-y-1 mb-2">
                      {q.options?.map((opt, i) => (
                        <li key={i} className={`text-sm p-1 rounded ${i === q.correct_option ? "bg-green-100 text-green-900 font-semibold" : "text-slate-700"}`}>
                          {String.fromCharCode(65 + i)}. {opt}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">
                      💡 {q.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {quiz.essay_questions?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Essay Questions</h4>
                <div className="space-y-2">
                  {quiz.essay_questions?.map((q, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-semibold text-slate-900 text-sm mb-1">
                        Essay {idx + 1}: {q.question}
                      </p>
                      <p className="text-xs text-slate-700">Rubric: {q.rubric}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => setQuiz(null)}
              variant="outline"
              className="w-full"
            >
              Generate Another Quiz
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}