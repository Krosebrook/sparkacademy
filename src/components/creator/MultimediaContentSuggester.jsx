import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Video, Loader2, Gamepad2, Image } from 'lucide-react';

export default function MultimediaContentSuggester() {
  const [loading, setLoading] = useState(false);
  const [lessonTopic, setLessonTopic] = useState('');
  const [suggestions, setSuggestions] = useState(null);

  const generate = async () => {
    if (!lessonTopic.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('suggestMultimediaContent', {
        lesson_topic: lessonTopic.trim()
      });
      setSuggestions(data);
    } catch (error) {
      console.error('Multimedia suggestion error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Video className="w-5 h-5" />
          Multimedia Content Ideas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={lessonTopic}
            onChange={(e) => setLessonTopic(e.target.value)}
            placeholder="Lesson topic"
          />
          <Button onClick={generate} disabled={loading || !lessonTopic.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Suggest'}
          </Button>
        </div>

        {suggestions && (
          <div className="space-y-3">
            {suggestions.video_ideas?.map((video, idx) => (
              <div key={idx} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Video className="w-4 h-4 text-red-400 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm mb-1">{video.title}</h4>
                    <p className="text-xs text-gray-400 mb-2">{video.description}</p>
                    <Badge variant="outline" className="text-xs">{video.duration} min</Badge>
                  </div>
                </div>
              </div>
            ))}

            {suggestions.interactive_simulations?.map((sim, idx) => (
              <div key={idx} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Gamepad2 className="w-4 h-4 text-purple-400 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm mb-1">{sim.title}</h4>
                    <p className="text-xs text-gray-400">{sim.description}</p>
                  </div>
                </div>
              </div>
            ))}

            {suggestions.visual_aids?.map((visual, idx) => (
              <div key={idx} className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Image className="w-4 h-4 text-blue-400 mt-1" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-300">{visual}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}