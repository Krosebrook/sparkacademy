import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, HelpCircle } from "lucide-react";
import { useAIGeneration, copyToClipboard } from "./AIGeneratorBase";

const QUESTIONS_JSON_SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          type: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correct_answer: { type: "string" },
          explanation: { type: "string" },
          difficulty: { type: "string" },
          concept: { type: "string" }
        }
      }
    },
    suggested_passing_score: { type: "number" }
  }
};

export default function QuizQuestionSuggester({ onQuestionsGenerated }) {
  const [lessonContent, setLessonContent] = useState("");
  const { isGenerating, result: questions, generateContent } = useAIGeneration();

  const generateQuestions = async () => {
    if (!lessonContent.trim()) {
      alert("Please enter lesson content");
      return;
    }

    try {
      const result = await generateContent(async () => {
        return await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this lesson content, generate 5-7 diverse quiz questions: ${lessonContent}. Create: 1. Multiple choice questions (3-4 options), 2. True/False questions, 3. Short answer questions, 4. Application-based questions. For each include: question text, type, options/answers, correct answer, explanation, difficulty level (easy/medium/hard), and learning concept tested.`,
          response_json_schema: QUESTIONS_JSON_SCHEMA
        });
      });
      
      if (onQuestionsGenerated) {
        onQuestionsGenerated(questions);
      }
    } catch (error) {
      alert("Failed to generate quiz questions. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            AI Quiz Question Suggester
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Lesson Content</label>
            <Textarea
              placeholder="Paste your lesson content here. Include key concepts, examples, and important information you want tested."
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              disabled={isGenerating}
              rows={6}
            />
            <p className="text-xs text-slate-500 mt-2">
              The more detailed your content, the better the questions will be.
            </p>
          </div>

          <Button
            onClick={generateQuestions}
            disabled={isGenerating || !lessonContent.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <HelpCircle className="w-4 h-4 mr-2" />
                Generate Quiz Questions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {questions && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Quiz Questions ({questions.questions?.length})</CardTitle>
              <div className="text-right">
                <p className="text-xs text-slate-600">Suggested Passing Score</p>
                <p className="text-lg font-bold text-emerald-600">{questions.suggested_passing_score}%</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.questions?.map((q, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Question {idx + 1}</p>
                    <p className="text-slate-800 mt-1">{q.question}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                      q.difficulty === "easy" ? "bg-green-100 text-green-800" :
                      q.difficulty === "medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="text-xs px-2 py-1 rounded font-semibold bg-blue-100 text-blue-800">
                      {q.type}
                    </span>
                  </div>
                </div>

                {q.options && q.options.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {q.options.map((option, oidx) => (
                      <div key={oidx} className={`text-sm p-2 rounded border ${
                        option === q.correct_answer
                          ? "bg-green-50 border-green-200 text-green-900 font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}>
                        {String.fromCharCode(65 + oidx)}) {option}
                        {option === q.correct_answer && " ✓"}
                      </div>
                    ))}
                  </div>
                )}

                {!q.options && (
                  <div className="mb-3 bg-green-50 border border-green-200 rounded p-2">
                    <p className="text-sm font-semibold text-green-900">Correct Answer: {q.correct_answer}</p>
                  </div>
                )}

                <div className="bg-blue-50 rounded p-2 text-sm">
                  <p className="font-semibold text-blue-900 mb-1">Explanation:</p>
                  <p className="text-blue-800">{q.explanation}</p>
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  <strong>Tests:</strong> {q.concept}
                </p>
              </div>
            ))}

            <Button
              onClick={() => copyToClipboard(questions) && alert("Questions copied!")}
              variant="outline"
              className="w-full"
            >
              Copy Questions as JSON
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}