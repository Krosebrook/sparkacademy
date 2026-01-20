import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Loader2, Video, Copy, Check, Download } from 'lucide-react';

export default function AIVideoScriptGenerator() {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [moduleTopic, setModuleTopic] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [targetDuration, setTargetDuration] = useState('10');
  const [script, setScript] = useState(null);

  const generate = async () => {
    if (!moduleTopic.trim()) {
      alert('Please enter a module topic');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateVideoScript', {
        module_topic: moduleTopic.trim(),
        key_points: keyPoints.trim(),
        target_duration_minutes: parseInt(targetDuration) || 10
      });
      
      if (data) {
        setScript(data);
      }
    } catch (error) {
      console.error('Video script error:', error);
      alert('Failed to generate video script. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyScript = () => {
    const text = formatScriptAsText(script);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    const text = formatScriptAsText(script);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${moduleTopic.replace(/\s+/g, '_')}_script.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const formatScriptAsText = (scr) => {
    if (!scr) return '';
    
    let text = `VIDEO SCRIPT: ${scr.title}\n${'='.repeat(scr.title.length + 14)}\n\n`;
    text += `Duration: ${scr.estimated_duration}\n`;
    text += `Target Audience: ${scr.target_audience}\n\n`;
    
    text += `HOOK (${scr.hook?.duration})\n${'-'.repeat(30)}\n${scr.hook?.script}\n\n`;
    
    scr.sections?.forEach((section, i) => {
      text += `SECTION ${i + 1}: ${section.title} (${section.duration})\n${'-'.repeat(30)}\n`;
      text += `${section.script}\n\n`;
      if (section.visual_suggestions?.length > 0) {
        text += `Visual Suggestions:\n`;
        section.visual_suggestions.forEach(v => text += `  • ${v}\n`);
        text += '\n';
      }
    });
    
    text += `CALL TO ACTION (${scr.call_to_action?.duration})\n${'-'.repeat(30)}\n${scr.call_to_action?.script}\n\n`;
    
    if (scr.production_notes?.length > 0) {
      text += `PRODUCTION NOTES\n${'-'.repeat(30)}\n`;
      scr.production_notes.forEach(note => text += `• ${note}\n`);
    }
    
    return text;
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Video className="w-5 h-5 text-red-400" />
          AI Video Script Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Module Topic</label>
            <Input
              value={moduleTopic}
              onChange={(e) => setModuleTopic(e.target.value)}
              placeholder="e.g., Understanding JavaScript Async/Await"
              className="bg-[#1a0a2e]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Key Points to Cover</label>
            <Textarea
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="e.g., Promise basics, async syntax, error handling, real examples..."
              className="bg-[#1a0a2e] h-20"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Target Duration (minutes)</label>
            <Select value={targetDuration} onValueChange={setTargetDuration}>
              <SelectTrigger className="bg-[#1a0a2e]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="20">20 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={generate} disabled={loading} className="w-full btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Video className="w-4 h-4 mr-2" />}
            Generate Video Script
          </Button>
        </div>

        {script && (
          <div className="border-t border-gray-700 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{script.title}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyScript}>
                  {copied ? <><Check className="w-3 h-3 mr-1" /> Copied!</> : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadScript}>
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Badge className="bg-red-500/20 text-red-300">{script.estimated_duration}</Badge>
              <Badge className="bg-blue-500/20 text-blue-300">{script.target_audience}</Badge>
            </div>

            <div className="space-y-3">
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white text-sm">Hook ({script.hook?.duration})</h4>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{script.hook?.script}</p>
              </div>

              {script.sections?.map((section, idx) => (
                <div key={idx} className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white text-sm">
                      Section {idx + 1}: {section.title}
                    </h4>
                    <Badge className="bg-purple-500/20 text-purple-300 text-xs">{section.duration}</Badge>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap mb-2">{section.script}</p>
                  {section.visual_suggestions?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-purple-500/20">
                      <div className="text-xs font-medium text-white mb-1">Visual Suggestions:</div>
                      {section.visual_suggestions.map((vis, i) => (
                        <div key={i} className="text-xs text-gray-400">• {vis}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                <h4 className="font-semibold text-white text-sm mb-2">Call to Action ({script.call_to_action?.duration})</h4>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{script.call_to_action?.script}</p>
              </div>

              {script.production_notes?.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                  <h4 className="font-semibold text-white text-sm mb-2">Production Notes</h4>
                  <ul className="space-y-1">
                    {script.production_notes.map((note, idx) => (
                      <li key={idx} className="text-xs text-gray-300">• {note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}