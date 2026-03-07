import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, XCircle, TrendingUp, TrendingDown,
  Minus, Loader2, Brain, Sparkles, AlertCircle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Difficulty metadata
const DIFFICULTY_META = {
  easy:   { label: 'Foundational', color: 'bg-emerald-100 text-emerald-700', icon: TrendingDown, bar: 'bg-emerald-400' },
  medium: { label: 'Intermediate', color: 'bg-blue-100 text-blue-700',      icon: Minus,        bar: 'bg-blue-500'    },
  hard:   { label: 'Advanced',     color: 'bg-red-100 text-red-700',         icon: TrendingUp,   bar: 'bg-red-500'     },
};

// Derive next difficulty based on correctness
function nextDifficulty(current, wasCorrect) {
  if (wasCorrect) return current === 'easy' ? 'medium' : 'hard';
  return current === 'hard' ? 'medium' : 'easy';
}

// Detect difficulty of a static question (fallback for seed questions)
function detectDifficulty(question) {
  return question.difficulty || 'medium';
}

export default function QuizView({ quiz, onComplete }) {
  const [queue, setQueue] = useState([]); // array of question objects
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answers, setAnswers] = useState([]);  // { question, selectedAnswer, correct, difficulty }
  const [currentDifficulty, setCurrentDifficulty] = useState('medium');
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [isAdaptive, setIsAdaptive] = useState(false); // true once AI kicks in
  const [aiExplanation, setAiExplanation] = useState(null);

  const seedQuestions = quiz?.questions || [];
  const totalQuestions = quiz?.total_questions || Math.max(seedQuestions.length, 5);

  // Initialise queue from seed questions
  useEffect(() => {
    if (seedQuestions.length > 0) {
      setQueue(seedQuestions.map(q => ({ ...q, difficulty: detectDifficulty(q) })));
      setCurrentDifficulty(detectDifficulty(seedQuestions[0]));
    }
  }, [quiz]);

  const currentQuestion = queue[currentIndex];
  const progress = Math.round(((currentIndex) / totalQuestions) * 100);
  const isLastQuestion = currentIndex >= totalQuestions - 1;
  const meta = DIFFICULTY_META[currentDifficulty] || DIFFICULTY_META.medium;

  // Fetch next adaptive question from AI
  const fetchAdaptiveQuestion = async (wasCorrect, questionText, difficulty) => {
    setIsGeneratingQuestion(true);
    const previousQuestions = queue.map(q => q.question_text);
    const topic = quiz?.topic || quiz?.title || 'the course material';

    const response = await base44.functions.invoke('generateAdaptiveQuestion', {
      topic,
      currentQuestion: questionText,
      wasCorrect,
      difficulty,
      previousQuestions,
    });

    setIsGeneratingQuestion(false);
    return response.data?.question || null;
  };

  const handleAnswerSelect = (optionIndex) => {
    if (!showFeedback) setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = async () => {
    const correct = selectedAnswer === currentQuestion.correct_option_index;
    setIsCorrect(correct);
    setShowFeedback(true);
    setAiExplanation(currentQuestion.explanation || null);

    const newAnswer = {
      question: currentQuestion.question_text,
      selectedAnswer,
      correct,
      difficulty: currentDifficulty,
    };
    setAnswers(prev => [...prev, newAnswer]);

    const next = nextDifficulty(currentDifficulty, correct);
    setCurrentDifficulty(next);

    // Pre-fetch next adaptive question if we haven't reached the end
    if (currentIndex < totalQuestions - 1) {
      const nextQueued = queue[currentIndex + 1];
      // Only replace with AI if it's the last seed question or already past seeds
      if (!nextQueued || currentIndex + 1 >= seedQuestions.length) {
        setIsAdaptive(true);
        const aiQ = await fetchAdaptiveQuestion(correct, currentQuestion.question_text, currentDifficulty);
        if (aiQ) {
          setQueue(prev => {
            const updated = [...prev];
            updated[currentIndex + 1] = aiQ;
            return updated;
          });
        }
      }
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const correctCount = answers.filter(a => a.correct).length;
      const score = Math.round((correctCount / answers.length) * 100);
      const passed = score >= (quiz?.passing_score || 70);
      onComplete({ score, passed, performanceLevel: currentDifficulty, adaptiveQuestions: isAdaptive });
      return;
    }
    setCurrentIndex(i => i + 1);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAiExplanation(null);
  };

  if (!quiz || seedQuestions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">No quiz available for this lesson.</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
          <p className="text-slate-600">Preparing your next question...</p>
        </CardContent>
      </Card>
    );
  }

  const DiffIcon = meta.icon;

  return (
    <Card className="max-w-2xl mx-auto border-0 shadow-xl">
      {/* Header */}
      <CardHeader className="border-b bg-gradient-to-r from-violet-50 to-purple-50 pb-4">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-lg font-bold text-slate-800">{quiz.title}</CardTitle>
          <div className="flex items-center gap-2">
            {isAdaptive && (
              <Badge className="bg-purple-100 text-purple-700 border-0 text-xs flex items-center gap-1">
                <Brain className="w-3 h-3" /> Adaptive
              </Badge>
            )}
            <Badge className={`${meta.color} border-0 text-xs flex items-center gap-1`}>
              <DiffIcon className="w-3 h-3" />
              {meta.label}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
            <span>{answers.filter(a => a.correct).length} correct so far</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${meta.bar}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* Question */}
        <p className="text-base font-semibold text-slate-800 leading-relaxed">
          {currentQuestion.question_text}
        </p>

        {/* Options */}
        <RadioGroup
          value={selectedAnswer?.toString()}
          onValueChange={(v) => handleAnswerSelect(parseInt(v))}
        >
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === currentQuestion.correct_option_index;

              let border = 'border-slate-200 hover:border-violet-300';
              let bg = 'bg-white';

              if (showFeedback) {
                if (isCorrectAnswer) { border = 'border-green-500'; bg = 'bg-green-50'; }
                else if (isSelected && !isCorrect) { border = 'border-red-500'; bg = 'bg-red-50'; }
              } else if (isSelected) {
                border = 'border-violet-500'; bg = 'bg-violet-50';
              }

              return (
                <div
                  key={index}
                  onClick={() => !showFeedback && handleAnswerSelect(index)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${border} ${bg} ${!showFeedback ? 'cursor-pointer' : ''}`}
                >
                  <RadioGroupItem value={index.toString()} id={`opt-${index}`} disabled={showFeedback} />
                  <Label htmlFor={`opt-${index}`} className="flex-1 cursor-pointer text-sm">
                    {option}
                  </Label>
                  {showFeedback && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                  {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                </div>
              );
            })}
          </div>
        </RadioGroup>

        {/* Feedback panel */}
        {showFeedback && (
          <div className="space-y-3">
            {/* Result banner */}
            <div className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`font-semibold text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Not quite right'}
              </p>
              {!isCorrect && (
                <p className="text-sm text-slate-600 mt-1">
                  Correct answer: <span className="font-medium">{currentQuestion.options[currentQuestion.correct_option_index]}</span>
                </p>
              )}
            </div>

            {/* AI explanation (available for AI-generated questions or when present) */}
            {aiExplanation && (
              <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg flex gap-3">
                <Sparkles className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-violet-900 mb-1">Explanation</p>
                  <p className="text-sm text-slate-700">{aiExplanation}</p>
                </div>
              </div>
            )}

            {/* Adaptive hint */}
            {isGeneratingQuestion && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <p className="text-sm text-purple-700">
                  {isCorrect
                    ? 'Great work! Generating a harder challenge...'
                    : 'Preparing a reinforcement question to help you...'}
                </p>
              </div>
            )}

            {!isGeneratingQuestion && !isLastQuestion && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${isCorrect ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-sky-50 border border-sky-200 text-sky-800'}`}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                {isCorrect
                  ? `Nice! The next question will be ${DIFFICULTY_META[currentDifficulty].label.toLowerCase()}-level.`
                  : `Next up: a ${DIFFICULTY_META[currentDifficulty].label.toLowerCase()} question to reinforce this concept.`}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end pt-2">
          {!showFeedback ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={isGeneratingQuestion}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {isGeneratingQuestion
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Preparing next...</>
                : isLastQuestion ? 'Finish Quiz' : 'Next Question'
              }
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}