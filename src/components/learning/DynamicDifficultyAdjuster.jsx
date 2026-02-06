import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DynamicDifficultyAdjuster({ courseId, currentContent, userPerformance }) {
  const [adjustedContent, setAdjustedContent] = useState(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [manualDifficulty, setManualDifficulty] = useState([50]);

  const adjustDifficulty = async (manual = false) => {
    setIsAdjusting(true);
    try {
      const response = await base44.functions.invoke('adjustContentDifficulty', {
        courseId,
        currentContent,
        userPerformance: manual ? { ...userPerformance, manualLevel: manualDifficulty[0] } : userPerformance
      });

      setAdjustedContent(response.data);
      toast.success('Content adjusted to your level!');
    } catch (error) {
      toast.error('Failed to adjust content difficulty');
    }
    setIsAdjusting(false);
  };

  useEffect(() => {
    if (userPerformance && Object.keys(userPerformance).length > 0) {
      adjustDifficulty();
    }
  }, [userPerformance]);

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easier':
        return <TrendingDown className="w-5 h-5 text-green-400" />;
      case 'harder':
        return <TrendingUp className="w-5 h-5 text-orange-400" />;
      default:
        return <Minus className="w-5 h-5 text-blue-400" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easier':
        return 'border-green-500/30 bg-green-500/10';
      case 'harder':
        return 'border-orange-500/30 bg-orange-500/10';
      default:
        return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  if (!adjustedContent && !isAdjusting) {
    return (
      <Card className="border-purple-500/30 bg-slate-900">
        <CardContent className="p-6 text-center">
          <TrendingUp className="w-10 h-10 text-purple-400 mx-auto mb-3" />
          <h4 className="font-semibold text-white mb-2">Adaptive Difficulty</h4>
          <p className="text-sm text-slate-400 mb-4">AI will adjust content based on your performance</p>
          <Button onClick={() => adjustDifficulty()} className="bg-purple-600 hover:bg-purple-700">
            Analyze My Level
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isAdjusting) {
    return (
      <Card className="border-purple-500/30 bg-slate-900">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <TrendingUp className="w-10 h-10 text-purple-400 mx-auto mb-3" />
            <p className="text-slate-300">Analyzing your performance...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Difficulty Adjustment Card */}
      <Card className={`border ${getDifficultyColor(adjustedContent.adjustedDifficulty)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getDifficultyIcon(adjustedContent.adjustedDifficulty)}
              <CardTitle className="text-white">
                Content Adjusted: {adjustedContent.adjustedDifficulty?.toUpperCase()}
              </CardTitle>
            </div>
            <Button onClick={() => adjustDifficulty()} variant="outline" size="sm">
              Re-analyze
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reasoning */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <p className="text-sm text-slate-300">{adjustedContent.reasoning}</p>
            </div>
          </div>

          {/* Adjusted Content */}
          <div className="bg-slate-800 rounded-lg p-4 border border-purple-500/20">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Personalized Content
            </h4>
            <div className="prose prose-sm prose-invert max-w-none text-slate-300">
              {adjustedContent.content}
            </div>
          </div>

          {/* Alternative Explanations */}
          {adjustedContent.alternatives && adjustedContent.alternatives.length > 0 && (
            <div>
              <Button
                onClick={() => setShowAlternatives(!showAlternatives)}
                variant="outline"
                size="sm"
                className="mb-3"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {showAlternatives ? 'Hide' : 'Show'} Alternative Explanations
              </Button>
              
              {showAlternatives && (
                <div className="space-y-3">
                  {adjustedContent.alternatives.map((alt, idx) => (
                    <div key={idx} className="bg-slate-800 rounded-lg p-4 border border-yellow-500/20">
                      <p className="text-sm text-slate-300">{alt}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Practice Problems */}
          {adjustedContent.practiceProblems && adjustedContent.practiceProblems.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-4 border border-green-500/20">
              <h4 className="font-semibold text-white mb-3">Personalized Practice</h4>
              <div className="space-y-4">
                {adjustedContent.practiceProblems.map((problem, idx) => (
                  <div key={idx} className="bg-slate-900 rounded p-3 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-purple-600">{problem.difficulty}</Badge>
                      <span className="text-sm font-semibold text-white">Problem {idx + 1}</span>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{problem.problem}</p>
                    {problem.hints && problem.hints.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-purple-400 cursor-pointer">Show hints</summary>
                        <ul className="mt-2 space-y-1 ml-4">
                          {problem.hints.map((hint, hIdx) => (
                            <li key={hIdx} className="text-xs text-slate-400">• {hint}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual Adjustment */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="font-semibold text-white mb-3">Manual Difficulty Override</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Easier</span>
                <span>Current: {manualDifficulty[0]}%</span>
                <span>Harder</span>
              </div>
              <Slider
                value={manualDifficulty}
                onValueChange={setManualDifficulty}
                max={100}
                step={1}
                className="w-full"
              />
              <Button
                onClick={() => adjustDifficulty(true)}
                size="sm"
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Apply Manual Adjustment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}