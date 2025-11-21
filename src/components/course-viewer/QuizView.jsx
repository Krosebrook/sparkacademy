import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function QuizView({ quiz, onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [performanceStreak, setPerformanceStreak] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState('normal');
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    if (performanceStreak >= 3) {
      setDifficultyLevel('hard');
    } else if (performanceStreak <= -2) {
      setDifficultyLevel('easy');
    } else {
      setDifficultyLevel('normal');
    }
  }, [performanceStreak]);

  const generateAIFeedback = async (question, userAnswer, correctAnswer, isCorrect) => {
    setIsGeneratingFeedback(true);
    try {
      const prompt = `A student answered a quiz question ${isCorrect ? 'correctly' : 'incorrectly'}.

Question: ${question.question_text}
Student's Answer: ${question.options[userAnswer]}
Correct Answer: ${question.options[correctAnswer]}

Provide:
1. A brief explanation of why the answer is ${isCorrect ? 'correct' : 'incorrect'}
2. Key concept reinforcement
3. A helpful tip or additional context (2-3 sentences max)

Be encouraging and educational.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            explanation: { type: "string" },
            key_concept: { type: "string" },
            tip: { type: "string" }
          }
        }
      });

      setAiFeedback(result);
    } catch (error) {
      console.error("Error generating AI feedback:", error);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    if (!showFeedback) {
      setSelectedAnswer(optionIndex);
    }
  };

  const handleSubmitAnswer = async () => {
    const correct = selectedAnswer === currentQuestion.correct_option_index;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    const newAnswers = [...answers, { questionIndex: currentQuestionIndex, selectedAnswer, correct }];
    setAnswers(newAnswers);
    
    if (correct) {
      setPerformanceStreak(prev => prev + 1);
    } else {
      setPerformanceStreak(prev => prev - 1);
      await generateAIFeedback(currentQuestion, selectedAnswer, currentQuestion.correct_option_index, false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setAiFeedback(null);
    } else {
      const correctAnswers = answers.filter(a => a.correct).length;
      const score = Math.round((correctAnswers / questions.length) * 100);
      const passed = score >= (quiz.passing_score || 70);
      onComplete({ score, passed, performanceLevel: difficultyLevel });
    }
  };

  const getDifficultyIcon = () => {
    if (difficultyLevel === 'hard') return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (difficultyLevel === 'easy') return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-blue-500" />;
  };

  const getDifficultyText = () => {
    if (difficultyLevel === 'hard') return 'You\'re doing great! Questions are getting harder.';
    if (difficultyLevel === 'easy') return 'Take your time. Questions are adjusted to help you learn.';
    return 'Keep going! You\'re on track.';
  };

  if (!quiz || questions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">No quiz available for this lesson.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto border-0 shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-violet-50 to-purple-50">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl">{quiz.title}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            {getDifficultyIcon()}
            <span className="font-medium">{difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)} Mode</span>
          </div>
        </div>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{getDifficultyText()}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          {currentQuestion.question_text}
        </h3>

        <RadioGroup value={selectedAnswer?.toString()} onValueChange={(v) => handleAnswerSelect(parseInt(v))}>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === currentQuestion.correct_option_index;
              
              let borderColor = 'border-slate-200';
              let bgColor = 'bg-white';
              
              if (showFeedback) {
                if (isCorrectAnswer) {
                  borderColor = 'border-green-500';
                  bgColor = 'bg-green-50';
                } else if (isSelected && !isCorrect) {
                  borderColor = 'border-red-500';
                  bgColor = 'bg-red-50';
                }
              } else if (isSelected) {
                borderColor = 'border-violet-500';
                bgColor = 'bg-violet-50';
              }

              return (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${borderColor} ${bgColor} ${!showFeedback && 'hover:border-violet-300 cursor-pointer'}`}
                  onClick={() => !showFeedback && handleAnswerSelect(index)}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={showFeedback} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                  {showFeedback && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                  {showFeedback && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              );
            })}
          </div>
        </RadioGroup>

        {showFeedback && (
          <div className="mt-4 space-y-3">
            <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Not quite right'}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {isCorrect 
                  ? 'Great job! You\'re mastering this material.' 
                  : `The correct answer is: ${currentQuestion.options[currentQuestion.correct_option_index]}`}
              </p>
            </div>

            {!isCorrect && isGeneratingFeedback && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <p className="text-sm text-blue-800">Generating personalized feedback...</p>
              </div>
            )}

            {!isCorrect && aiFeedback && (
              <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg space-y-3">
                <div>
                  <p className="text-xs font-semibold text-violet-900 mb-1">💡 Explanation</p>
                  <p className="text-sm text-slate-700">{aiFeedback.explanation}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-violet-900 mb-1">🎯 Key Concept</p>
                  <p className="text-sm text-slate-700">{aiFeedback.key_concept}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-violet-900 mb-1">✨ Helpful Tip</p>
                  <p className="text-sm text-slate-700">{aiFeedback.tip}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          {!showFeedback ? (
            <Button 
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="bg-gradient-to-r from-violet-600 to-purple-600"
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNext} 
              disabled={isGeneratingFeedback}
              className="bg-gradient-to-r from-violet-600 to-purple-600"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}