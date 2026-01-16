import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function KnowledgeAssessmentQuiz({ topic, onComplete }) {
  const [questions, setQuestions] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const startQuiz = async () => {
    setIsLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a 5-question assessment quiz to evaluate existing knowledge in: ${topic}

Create questions that are:
1. Multiple choice with 4 options
2. Mix of difficulty (easy to medium)
3. Focused on core concepts
4. Clear and unambiguous

Format as JSON with questions array.`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_option: { type: "number" }
                }
              }
            }
          }
        }
      });
      setQuestions(result.questions);
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (optionIdx) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIdx] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    const score = answers.reduce((sum, answer, idx) => {
      return sum + (answer === questions[idx].correct_option ? 1 : 0);
    }, 0);
    setShowResults(true);
    onComplete?.({
      score: (score / questions.length * 100).toFixed(0),
      totalQuestions: questions.length,
      correctAnswers: score
    });
  };

  if (!questions) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Knowledge Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Let's assess your existing knowledge in {topic} to personalize your learning path.
          </p>
          <Button
            onClick={startQuiz}
            disabled={isLoading}
            className="w-full bg-blue-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Preparing quiz...
              </>
            ) : (
              "Start Assessment"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const correctCount = answers.filter((ans, idx) => ans === questions[idx].correct_option).length;
    const percentage = (correctCount / questions.length * 100).toFixed(0);
    const level = percentage > 70 ? "advanced" : percentage > 40 ? "intermediate" : "beginner";

    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle>Assessment Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{percentage}%</div>
            <div className="text-sm text-slate-700">
              {correctCount} out of {questions.length} correct
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <p className="font-semibold text-slate-900 mb-2">Your Level: <span className="text-blue-600 capitalize">{level}</span></p>
            <p className="text-sm text-slate-700">
              {level === 'beginner' && 'You are new to this topic. We will start with foundational concepts.'}
              {level === 'intermediate' && 'You have basic knowledge. We will build on your existing skills.'}
              {level === 'advanced' && 'You have solid knowledge. We will focus on advanced topics.'}
            </p>
          </div>

          <Button onClick={() => setShowResults(false)} className="w-full bg-blue-600">
            Continue to Learning Path
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];
  const userAnswer = answers[currentQuestionIdx];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Question {currentQuestionIdx + 1} of {questions.length}</CardTitle>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-semibold text-slate-900">{currentQuestion.question}</p>
        
        <div className="space-y-2">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                userAnswer === idx
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full border-2 ${userAnswer === idx ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`} />
                <span className="text-sm">{option}</span>
              </div>
            </button>
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={userAnswer === undefined}
          className="w-full bg-blue-600"
        >
          {currentQuestionIdx === questions.length - 1 ? "See Results" : "Next"}
        </Button>
      </CardContent>
    </Card>
  );
}