import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { FileText, Loader2, Copy } from 'lucide-react';

export default function AISyllabusGenerator() {
  const [loading, setLoading] = useState(false);
  const [objectives, setObjectives] = useState('');
  const [audience, setAudience] = useState('');
  const [syllabus, setSyllabus] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!objectives.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateSyllabus', {
        objectives: objectives.trim(),
        target_audience: audience.trim()
      });
      setSyllabus(data);
    } catch (error) {
      console.error('Syllabus generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = JSON.stringify(syllabus, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5" />
          AI Syllabus Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Learning Objectives</label>
          <Textarea
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder="What should students learn? (e.g., Build full-stack web apps, understand databases...)"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Target Audience</label>
          <Input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g., Beginners, Intermediate developers..."
          />
        </div>

        <Button onClick={generate} disabled={loading || !objectives.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
          Generate Syllabus
        </Button>

        {syllabus && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white">{syllabus.course_title}</h4>
              <Button size="sm" variant="outline" onClick={copyToClipboard}>
                {copied ? 'Copied!' : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
              </Button>
            </div>
            <p className="text-sm text-gray-300">{syllabus.course_description}</p>
            
            <div>
              <h5 className="font-medium text-white mb-2">Modules</h5>
              {syllabus.modules?.map((module, idx) => (
                <div key={idx} className="bg-gray-800/50 rounded-lg p-3 mb-2">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-white text-sm">Module {module.module_number}: {module.title}</span>
                    <Badge variant="outline" className="text-xs">{module.duration}</Badge>
                  </div>
                  <ul className="space-y-1">
                    {module.topics?.map((topic, i) => (
                      <li key={i} className="text-sm text-gray-300">• {topic}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}