import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Target, Sparkles, Briefcase } from 'lucide-react';

export default function CareerGoalsSetter({ onGoalsSet, currentGoals }) {
  const [goals, setGoals] = useState(currentGoals || '');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const exampleGoals = [
    "Become a full-stack web developer within 12 months",
    "Transition into AI/ML engineering from software development",
    "Master data science and get certified in 6 months",
    "Build expertise in cloud architecture (AWS/Azure)",
    "Launch a career in UX/UI design"
  ];

  return (
    <Card className="card-glow bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5" />
          Set Your Career Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-gray-300 mb-2 block">
            Describe your career aspirations, skill goals, or learning objectives in natural language:
          </label>
          <Textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="e.g., I want to become a senior full-stack developer specializing in React and Node.js, with expertise in cloud deployment on AWS. My goal is to land a senior role at a tech company within 12-18 months..."
            rows={5}
            className="mb-2"
          />
          <Button 
            variant="link" 
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-blue-400 p-0 h-auto"
          >
            {showSuggestions ? 'Hide' : 'Show'} example goals
          </Button>
        </div>

        {showSuggestions && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">Click an example to use it:</p>
            {exampleGoals.map((example, idx) => (
              <Badge 
                key={idx}
                variant="outline" 
                className="cursor-pointer hover:bg-blue-500/20 transition text-xs mr-2"
                onClick={() => setGoals(example)}
              >
                <Briefcase className="w-3 h-3 mr-1" />
                {example}
              </Badge>
            ))}
          </div>
        )}

        <Button 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={() => onGoalsSet(goals)}
          disabled={!goals.trim()}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Personalized Recommendations
        </Button>
      </CardContent>
    </Card>
  );
}