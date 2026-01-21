import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Loader2, Target, Lightbulb, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function AIPracticeProblemsGenerator() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    lesson_topic: '',
    lesson_content: '',
    difficulty_level: 'mixed',
    problem_count: '5'
  });
  const [problems, setProblems] = useState(null);
  const [expandedProblem, setExpandedProblem] = useState(null);

  const generateProblems = async () => {
    if (!formData.lesson_topic || !formData.lesson_content) {
      alert('Please fill in lesson topic and content');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generatePracticeProblems', formData);
      setProblems(data);
    } catch (error) {
      console.error('Error generating problems:', error);
      alert('Failed to generate practice problems');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-500/20 text-green-300',
      intermediate: 'bg-yellow-500/20 text-yellow-300',
      advanced: 'bg-red-500/20 text-red-300'
    };
    return colors[difficulty?.toLowerCase()] || 'bg-gray-500/20 text-gray-300';
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          AI Practice Problems & Case Studies Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-gray-300 mb-1 block">Lesson Topic</label>
          <Input
            value={formData.lesson_topic}
            onChange={(e) => setFormData(prev => ({ ...prev, lesson_topic: e.target.value }))}
            placeholder="e.g., Python Functions"
            className="bg-[#1a0a2e]"
          />
        </div>

        <div>
          <label className="text-sm text-gray-300 mb-1 block">Lesson Content</label>
          <Textarea
            value={formData.lesson_content}
            onChange={(e) => setFormData(prev => ({ ...prev, lesson_content: e.target.value }))}
            placeholder="Paste the main lesson content or key concepts covered..."
            className="bg-[#1a0a2e] h-32"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Difficulty Level</label>
            <Select value={formData.difficulty_level} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: value }))}>
              <SelectTrigger className="bg-[#1a0a2e]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="mixed">Mixed Levels</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Number of Problems</label>
            <Select value={formData.problem_count} onValueChange={(value) => setFormData(prev => ({ ...prev, problem_count: value }))}>
              <SelectTrigger className="bg-[#1a0a2e]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 problems</SelectItem>
                <SelectItem value="5">5 problems</SelectItem>
                <SelectItem value="7">7 problems</SelectItem>
                <SelectItem value="10">10 problems</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={generateProblems} disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Target className="w-4 h-4 mr-2" />}
          Generate Practice Problems
        </Button>

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
            <p className="text-gray-400">Creating diverse practice problems...</p>
          </div>
        )}

        {problems?.problems && (
          <div className="space-y-3 mt-6">
            <div className="text-sm text-gray-400">Generated {problems.problems.length} practice problems</div>
            {problems.problems.map((problem, idx) => (
              <div key={idx} className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-purple-900/10 transition-colors"
                  onClick={() => setExpandedProblem(expandedProblem === idx ? null : idx)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-purple-500/20 text-purple-300">Problem {problem.problem_number}</Badge>
                        <Badge className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
                        <Badge className="bg-blue-500/20 text-blue-300">{problem.type}</Badge>
                        <Badge className="bg-cyan-500/20 text-cyan-300">
                          <Clock className="w-3 h-3 mr-1" />
                          {problem.estimated_time_minutes}min
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-white">{problem.title}</h4>
                    </div>
                    <Button size="sm" variant="ghost">
                      {expandedProblem === idx ? '−' : '+'}
                    </Button>
                  </div>
                </div>

                {expandedProblem === idx && (
                  <div className="border-t border-purple-500/30 p-4 space-y-4 bg-[#0f0618]/50">
                    <div>
                      <h5 className="text-sm font-semibold text-white mb-2">Problem Statement</h5>
                      <div className="bg-gray-800/50 rounded p-3 text-sm text-gray-300 whitespace-pre-wrap">
                        {problem.problem_statement}
                      </div>
                    </div>

                    {problem.hints?.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-400" />
                          Hints
                        </h5>
                        <div className="space-y-1">
                          {problem.hints.map((hint, i) => (
                            <div key={i} className="bg-yellow-900/10 border border-yellow-500/20 rounded p-2 text-xs text-gray-300">
                              💡 {hint}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Solution
                      </h5>
                      <div className="bg-green-900/10 border border-green-500/20 rounded p-3 text-sm text-gray-300 whitespace-pre-wrap">
                        {problem.solution}
                      </div>
                    </div>

                    {problem.explanation && (
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2">Explanation</h5>
                        <p className="text-sm text-gray-300">{problem.explanation}</p>
                      </div>
                    )}

                    {problem.key_concepts?.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2">Key Concepts</h5>
                        <div className="flex flex-wrap gap-1">
                          {problem.key_concepts.map((concept, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{concept}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {problem.common_mistakes?.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          Common Mistakes
                        </h5>
                        <ul className="space-y-1">
                          {problem.common_mistakes.map((mistake, i) => (
                            <li key={i} className="text-xs text-red-300">⚠️ {mistake}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {problem.extension_challenge && (
                      <div className="bg-orange-900/10 border border-orange-500/20 rounded p-3">
                        <h5 className="text-sm font-semibold text-orange-300 mb-1">Extension Challenge 🚀</h5>
                        <p className="text-xs text-gray-300">{problem.extension_challenge}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}