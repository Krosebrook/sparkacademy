import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { ClipboardList, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DiverseAssessmentGenerator() {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [assessments, setAssessments] = useState(null);

  const generate = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateDiverseAssessments', {
        topic: topic.trim()
      });
      setAssessments(data);
    } catch (error) {
      console.error('Assessment generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          Diverse Assessment Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Assessment topic (e.g., React Hooks)"
          />
          <Button onClick={generate} disabled={loading || !topic.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
          </Button>
        </div>

        {assessments && (
          <Tabs defaultValue="essay">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="essay">Essay</TabsTrigger>
              <TabsTrigger value="coding">Coding</TabsTrigger>
              <TabsTrigger value="peer">Peer Review</TabsTrigger>
            </TabsList>

            <TabsContent value="essay" className="space-y-3">
              <h4 className="font-semibold text-white">{assessments.essay?.prompt}</h4>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h5 className="font-medium text-white text-sm mb-2">Rubric</h5>
                {assessments.essay?.rubric?.map((item, idx) => (
                  <div key={idx} className="mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{item.criterion}</span>
                      <Badge variant="outline" className="text-xs">{item.points} pts</Badge>
                    </div>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="coding" className="space-y-3">
              <h4 className="font-semibold text-white">{assessments.coding?.challenge}</h4>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h5 className="font-medium text-white text-sm mb-2">Requirements</h5>
                <ul className="space-y-1">
                  {assessments.coding?.requirements?.map((req, idx) => (
                    <li key={idx} className="text-sm text-gray-300">• {req}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h5 className="font-medium text-white text-sm mb-2">Grading Criteria</h5>
                {assessments.coding?.grading?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{item.aspect}</span>
                    <Badge variant="outline" className="text-xs">{item.weight}%</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="peer" className="space-y-3">
              <h4 className="font-semibold text-white">{assessments.peer_review?.task}</h4>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h5 className="font-medium text-white text-sm mb-2">Review Guidelines</h5>
                <ul className="space-y-1">
                  {assessments.peer_review?.guidelines?.map((guide, idx) => (
                    <li key={idx} className="text-sm text-gray-300">• {guide}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}