import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { Loader2, ClipboardList, Copy, Check } from 'lucide-react';

export default function AdvancedAssessmentGenerator({ courseId }) {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [assessmentType, setAssessmentType] = useState('peer_review');
  const [assessment, setAssessment] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateAssessment = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateAdvancedAssessment', {
        topic: topic.trim(),
        type: assessmentType,
        course_id: courseId
      });
      setAssessment(data);
    } catch (error) {
      console.error('Assessment generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyContent = () => {
    const content = JSON.stringify(assessment, null, 2);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-400" />
          Advanced Assessment Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Topic</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., React State Management"
              className="bg-[#1a0a2e]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Assessment Type</label>
            <Select value={assessmentType} onValueChange={setAssessmentType}>
              <SelectTrigger className="bg-[#1a0a2e]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="peer_review">Peer Review Prompts</SelectItem>
                <SelectItem value="rubric">Assessment Rubric</SelectItem>
                <SelectItem value="scenario">Scenario-Based Questions</SelectItem>
                <SelectItem value="portfolio">Portfolio Project</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={generateAssessment} 
            disabled={loading || !topic.trim()}
            className="w-full btn-primary"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ClipboardList className="w-4 h-4 mr-2" />}
            Generate
          </Button>
        </div>

        {assessment && (
          <div className="space-y-3 border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{assessment.title}</span>
              <Button variant="outline" size="sm" onClick={copyContent} className="text-xs">
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>

            {assessment.description && (
              <p className="text-sm text-gray-400">{assessment.description}</p>
            )}

            {assessmentType === 'peer_review' && assessment.prompts && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white">Peer Review Prompts</h4>
                {assessment.prompts.map((prompt, idx) => (
                  <div key={idx} className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <div className="text-sm text-white font-medium mb-1">{prompt.question}</div>
                    <div className="text-xs text-gray-400">{prompt.guidance}</div>
                  </div>
                ))}
              </div>
            )}

            {assessmentType === 'rubric' && assessment.criteria && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white">Rubric Criteria</h4>
                {assessment.criteria.map((criterion, idx) => (
                  <div key={idx} className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                    <div className="text-sm text-white font-medium mb-1">{criterion.name}</div>
                    <div className="text-xs text-gray-400 mb-2">{criterion.description}</div>
                    <div className="grid grid-cols-4 gap-2">
                      {criterion.levels?.map((level, i) => (
                        <div key={i} className="text-xs">
                          <div className="font-medium text-white">{level.name}</div>
                          <div className="text-gray-400">{level.points} pts</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {assessmentType === 'scenario' && assessment.scenarios && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white">Scenario Questions</h4>
                {assessment.scenarios.map((scenario, idx) => (
                  <div key={idx} className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                    <div className="text-sm text-white font-medium mb-2">{scenario.scenario}</div>
                    <div className="text-xs text-gray-400 mb-2">{scenario.question}</div>
                    <div className="text-xs text-cyan-300">Expected: {scenario.expected_approach}</div>
                  </div>
                ))}
              </div>
            )}

            {assessmentType === 'portfolio' && assessment.project && (
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3 space-y-2">
                <h4 className="text-sm font-semibold text-white">Portfolio Project</h4>
                <p className="text-sm text-gray-300">{assessment.project.description}</p>
                <div>
                  <div className="text-xs font-semibold text-white mb-1">Requirements:</div>
                  <ul className="space-y-1">
                    {assessment.project.requirements?.map((req, i) => (
                      <li key={i} className="text-xs text-gray-300">• {req}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white mb-1">Deliverables:</div>
                  <ul className="space-y-1">
                    {assessment.project.deliverables?.map((del, i) => (
                      <li key={i} className="text-xs text-gray-300">• {del}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}