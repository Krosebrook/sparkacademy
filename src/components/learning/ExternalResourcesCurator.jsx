import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Loader2, ExternalLink, Sparkles, Star, Clock, TrendingUp } from 'lucide-react';

export default function ExternalResourcesCurator({ topic, learningStyle, onResourcesFound }) {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [summary, setSummary] = useState('');

  const curateResources = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('curateExternalResources', {
        topic,
        learning_style: learningStyle,
        difficulty_level: 'intermediate',
        resource_types: ['article', 'video', 'interactive_tool', 'tutorial']
      });
      
      setResources(data.resources || []);
      setSummary(data.search_summary || '');
      if (onResourcesFound) onResourcesFound(data.resources);
    } catch (error) {
      console.error('Resource curation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      video: '🎥',
      article: '📄',
      interactive_tool: '🛠️',
      tutorial: '📚',
      documentation: '📖',
      course: '🎓'
    };
    return icons[type] || '🔗';
  };

  const getTypeColor = (type) => {
    const colors = {
      video: 'bg-red-500/20 text-red-300',
      article: 'bg-blue-500/20 text-blue-300',
      interactive_tool: 'bg-purple-500/20 text-purple-300',
      tutorial: 'bg-green-500/20 text-green-300',
      documentation: 'bg-yellow-500/20 text-yellow-300',
      course: 'bg-cyan-500/20 text-cyan-300'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-300';
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Curated External Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {resources.length === 0 ? (
          <div className="text-center py-8">
            <ExternalLink className="w-12 h-12 text-cyan-400/30 mx-auto mb-4" />
            <p className="text-gray-300 mb-4">
              Discover high-quality learning resources from across the web
            </p>
            <Button onClick={curateResources} disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Find Resources for "{topic}"
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {summary && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-gray-300">{summary}</p>
              </div>
            )}

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {resources.map((resource, idx) => (
                <div key={idx} className="bg-[#1a0a2e] border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getTypeIcon(resource.type)}</span>
                        <h4 className="font-semibold text-white text-sm">{resource.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTypeColor(resource.type)} variant="outline">
                          {resource.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {resource.source}
                        </Badge>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs">{resource.quality_score}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mb-3">{resource.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {resource.key_topics?.slice(0, 4).map((topic, i) => (
                      <Badge key={i} className="bg-purple-500/20 text-purple-300 text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {resource.estimated_time}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {resource.difficulty}
                      </div>
                      <div>{resource.learning_style_fit}</div>
                    </div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                    >
                      View Resource
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={curateResources} variant="outline" className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh Resources
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}