import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { FileText, Loader2, Lightbulb, Target, Clock } from 'lucide-react';

export default function AILessonOutlineGenerator({ courseId, onOutlineGenerated }) {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [objectives, setObjectives] = useState('');
  const [outline, setOutline] = useState(null);

  const generateOutline = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateLessonOutline', {
        topic: topic.trim(),
        objectives: objectives.trim(),
        course_id: courseId
      });
      setOutline(data);
      if (onOutlineGenerated) onOutlineGenerated(data);
    } catch (error) {
      console.error('Outline generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          AI Lesson Outline Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Lesson Topic</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Introduction to React Hooks"
              className="bg-[#1a0a2e]"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Learning Objectives (Optional)</label>
            <Textarea
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="e.g., Students will understand useState and useEffect hooks..."
              rows={3}
              className="bg-[#1a0a2e]"
            />
          </div>

          <Button 
            onClick={generateOutline} 
            disabled={loading || !topic.trim()}
            className="w-full btn-primary"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lightbulb className="w-4 h-4 mr-2" />}
            Generate Outline
          </Button>
        </div>

        {outline && (
          <div className="space-y-4 border-t border-gray-700 pt-4">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{outline.title}</h3>
                <Badge className="bg-cyan-500/20 text-cyan-300">
                  <Clock className="w-3 h-3 mr-1" />
                  {outline.estimated_duration}
                </Badge>
              </div>
              <p className="text-sm text-gray-300">{outline.description}</p>
            </div>

            {outline.learning_objectives?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-semibold text-white">Learning Objectives</span>
                </div>
                <ul className="space-y-1">
                  {outline.learning_objectives.map((obj, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {outline.sections?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Lesson Sections</h4>
                <div className="space-y-2">
                  {outline.sections.map((section, idx) => (
                    <div key={idx} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-white text-sm">{idx + 1}. {section.title}</span>
                        <span className="text-xs text-gray-400">{section.duration}</span>
                      </div>
                      <p className="text-xs text-gray-400">{section.description}</p>
                      {section.key_points?.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {section.key_points.map((point, i) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                              <span className="text-cyan-400">→</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {outline.suggested_activities?.length > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-white mb-2">Suggested Activities</h4>
                <ul className="space-y-1">
                  {outline.suggested_activities.map((activity, idx) => (
                    <li key={idx} className="text-sm text-gray-300">• {activity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}