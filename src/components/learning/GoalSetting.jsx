import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Target, Clock, Briefcase } from 'lucide-react';

export default function GoalSetting({ onComplete }) {
  const [goal, setGoal] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [timeframe, setTimeframe] = useState(12);
  const [details, setDetails] = useState('');

  const handleSubmit = () => {
    if (goal.trim()) {
      onComplete({
        learningGoal: goal,
        targetRole,
        timeframe,
        additionalDetails: details
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <Target className="w-6 h-6 text-orange-400" />
          Define Your Learning Goals
        </CardTitle>
        <p className="text-gray-400 mt-2">Tell us what you want to achieve</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Goal */}
        <div className="space-y-2">
          <label className="text-white font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Primary Learning Goal *
          </label>
          <Input
            placeholder="e.g., Become a Full-Stack Developer, Master Data Science, Learn Cloud Architecture"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>

        {/* Target Role */}
        <div className="space-y-2">
          <label className="text-white font-semibold flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-orange-400" />
            Target Role/Position
          </label>
          <Input
            placeholder="e.g., Senior Software Engineer, Data Scientist, Cloud Architect"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
          />
          <p className="text-sm text-gray-500">Optional: What job title are you aiming for?</p>
        </div>

        {/* Timeframe */}
        <div className="space-y-2">
          <label className="text-white font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Timeframe: {timeframe} weeks
          </label>
          <input
            type="range"
            min="4"
            max="52"
            step="4"
            value={timeframe}
            onChange={(e) => setTimeframe(Number(e.target.value))}
            className="w-full accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1 month</span>
            <span>6 months</span>
            <span>1 year</span>
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-2">
          <label className="text-white font-semibold">
            Additional Details
          </label>
          <Textarea
            placeholder="Any specific areas of interest, constraints, or preferences..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!goal.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-bold py-6 rounded-xl text-lg disabled:opacity-50"
        >
          Generate Personalized Path →
        </Button>
      </CardContent>
    </Card>
  );
}