import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Loader2, BookOpen, Copy, Check, Download } from 'lucide-react';

export default function AISyllabusGenerator() {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [courseTopic, setCourseTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('beginners');
  const [objectives, setObjectives] = useState('');
  const [duration, setDuration] = useState('8');
  const [syllabus, setSyllabus] = useState(null);

  const generateSyllabus = async () => {
    if (!courseTopic.trim()) {
      alert('Please enter a course topic');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateSyllabus', {
        topic: courseTopic.trim(),
        target_audience: targetAudience,
        objectives: objectives.trim() || undefined,
        duration_weeks: parseInt(duration) || 8
      });
      
      if (data) {
        setSyllabus(data);
      }
    } catch (error) {
      console.error('Syllabus generation error:', error);
      alert('Failed to generate syllabus. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = formatSyllabusAsText(syllabus);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSyllabus = () => {
    const text = formatSyllabusAsText(syllabus);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${courseTopic.replace(/\s+/g, '_')}_syllabus.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const formatSyllabusAsText = (syl) => {
    if (!syl) return '';
    
    let text = `${syl.title}\n${'='.repeat(syl.title.length)}\n\n`;
    text += `${syl.overview}\n\n`;
    text += `Duration: ${syl.duration}\n`;
    text += `Target Audience: ${syl.target_audience}\n\n`;
    
    text += `LEARNING OBJECTIVES\n-------------------\n`;
    syl.learning_objectives?.forEach((obj, i) => {
      text += `${i + 1}. ${obj}\n`;
    });
    
    text += `\nPREREQUISITES\n-------------\n`;
    syl.prerequisites?.forEach((pre, i) => {
      text += `• ${pre}\n`;
    });
    
    text += `\nCOURSE STRUCTURE\n----------------\n\n`;
    syl.modules?.forEach((mod, i) => {
      text += `Module ${i + 1}: ${mod.title} (${mod.duration})\n`;
      text += `${mod.description}\n\n`;
      text += `Topics:\n`;
      mod.topics?.forEach(topic => {
        text += `  • ${topic}\n`;
      });
      text += `\nKey Activities:\n`;
      mod.activities?.forEach(activity => {
        text += `  • ${activity}\n`;
      });
      text += `\n`;
    });
    
    text += `\nASSESSMENT STRATEGY\n-------------------\n`;
    syl.assessment?.forEach((assess, i) => {
      text += `• ${assess}\n`;
    });
    
    text += `\nRESOURCES\n---------\n`;
    syl.resources?.forEach((res, i) => {
      text += `• ${res}\n`;
    });
    
    return text;
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          AI Syllabus Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Course Topic</label>
            <Input
              value={courseTopic}
              onChange={(e) => setCourseTopic(e.target.value)}
              placeholder="e.g., Full-Stack Web Development with React and Node.js"
              className="bg-[#1a0a2e]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Target Audience</label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger className="bg-[#1a0a2e]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="absolute_beginners">Absolute Beginners</SelectItem>
                  <SelectItem value="beginners">Beginners</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="professionals">Professionals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-1 block">Duration (weeks)</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-[#1a0a2e]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 weeks</SelectItem>
                  <SelectItem value="6">6 weeks</SelectItem>
                  <SelectItem value="8">8 weeks</SelectItem>
                  <SelectItem value="10">10 weeks</SelectItem>
                  <SelectItem value="12">12 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">
              Learning Objectives (Optional)
            </label>
            <Textarea
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="e.g., Students will build production-ready web applications, master React hooks, implement RESTful APIs..."
              className="bg-[#1a0a2e] h-20"
            />
          </div>

          <Button 
            onClick={generateSyllabus} 
            disabled={loading || !courseTopic.trim()}
            className="w-full btn-primary"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BookOpen className="w-4 h-4 mr-2" />}
            Generate Comprehensive Syllabus
          </Button>
        </div>

        {syllabus && (
          <div className="space-y-4 border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-white">{syllabus.title}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="text-xs">
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadSyllabus} className="text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-300">{syllabus.overview}</p>
                <div className="flex gap-3 mt-2">
                  <Badge className="bg-cyan-500/20 text-cyan-300">{syllabus.duration}</Badge>
                  <Badge className="bg-purple-500/20 text-purple-300">{syllabus.target_audience}</Badge>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-white mb-2">Learning Objectives</h4>
                <ul className="space-y-1">
                  {syllabus.learning_objectives?.map((obj, idx) => (
                    <li key={idx} className="text-sm text-gray-300">• {obj}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-white mb-2">Prerequisites</h4>
                <ul className="space-y-1">
                  {syllabus.prerequisites?.map((pre, idx) => (
                    <li key={idx} className="text-sm text-gray-300">• {pre}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Course Structure</h4>
                <div className="space-y-3">
                  {syllabus.modules?.map((module, idx) => (
                    <div key={idx} className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-semibold text-white">
                          Module {idx + 1}: {module.title}
                        </h5>
                        <Badge className="bg-green-500/20 text-green-300 text-xs">{module.duration}</Badge>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{module.description}</p>
                      
                      <div className="mt-2">
                        <div className="text-xs font-medium text-white mb-1">Topics:</div>
                        <div className="flex flex-wrap gap-1">
                          {module.topics?.map((topic, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{topic}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="text-xs font-medium text-white mb-1">Activities:</div>
                        <ul className="space-y-1">
                          {module.activities?.map((activity, i) => (
                            <li key={i} className="text-xs text-gray-300">• {activity}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-white mb-2">Assessment Strategy</h4>
                <ul className="space-y-1">
                  {syllabus.assessment?.map((assess, idx) => (
                    <li key={idx} className="text-sm text-gray-300">• {assess}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-white mb-2">Recommended Resources</h4>
                <ul className="space-y-1">
                  {syllabus.resources?.map((resource, idx) => (
                    <li key={idx} className="text-sm text-gray-300">• {resource}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}