import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Filter, Upload, Link as LinkIcon, Clock, Target, Sparkles } from 'lucide-react';

export default function AIContentRepository() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const { data: assets, refetch } = useQuery({
    queryKey: ['ai-content-assets'],
    queryFn: async () => base44.entities.AIContentAsset.list('-created_date')
  });

  const uploadAssetMutation = useMutation({
    mutationFn: async (assetData) => {
      // First categorize the content
      const { data: categorization } = await base44.functions.invoke('categorizeAIContent', {
        asset_type: assetData.asset_type,
        content: assetData.content
      });

      // Then create the asset with AI metadata
      return base44.entities.AIContentAsset.create({
        ...assetData,
        ai_metadata: categorization.ai_metadata,
        searchable_text: categorization.searchable_text,
        tags: categorization.tags
      });
    },
    onSuccess: () => refetch()
  });

  const filteredAssets = assets?.filter(asset => {
    const matchesSearch = !searchQuery || 
      asset.searchable_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.ai_metadata?.topics?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDomain = filterDomain === 'all' || asset.ai_metadata?.domain === filterDomain;
    const matchesType = filterType === 'all' || asset.asset_type === filterType;
    const matchesDifficulty = filterDifficulty === 'all' || asset.ai_metadata?.difficulty_level === filterDifficulty;

    return matchesSearch && matchesDomain && matchesType && matchesDifficulty;
  });

  const getDifficultyColor = (level) => {
    const colors = {
      beginner: 'bg-green-500/20 text-green-300',
      intermediate: 'bg-yellow-500/20 text-yellow-300',
      advanced: 'bg-orange-500/20 text-orange-300',
      expert: 'bg-red-500/20 text-red-300'
    };
    return colors[level] || 'bg-gray-500/20 text-gray-300';
  };

  const getDomainIcon = (domain) => {
    const icons = {
      financial: '💰',
      developer: '💻',
      creative: '🎨',
      healthcare: '🏥',
      manufacturing: '🏭',
      general: '📚'
    };
    return icons[domain] || '📚';
  };

  return (
    <div className="space-y-6">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Content Repository
          </CardTitle>
          <p className="text-sm text-gray-400">Searchable library of AI-generated course materials</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, keyword, skill..."
                className="pl-10 bg-[#1a0a2e]"
              />
            </div>
            <Select value={filterDomain} onValueChange={setFilterDomain}>
              <SelectTrigger className="w-40 bg-[#1a0a2e]">
                <SelectValue placeholder="Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                <SelectItem value="financial">💰 Financial</SelectItem>
                <SelectItem value="developer">💻 Developer</SelectItem>
                <SelectItem value="creative">🎨 Creative</SelectItem>
                <SelectItem value="healthcare">🏥 Healthcare</SelectItem>
                <SelectItem value="manufacturing">🏭 Manufacturing</SelectItem>
                <SelectItem value="general">📚 General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 bg-[#1a0a2e]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="practice_problems">Practice</SelectItem>
                <SelectItem value="study_guide">Study Guide</SelectItem>
                <SelectItem value="case_study">Case Study</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="lesson_plan">Lesson Plan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-40 bg-[#1a0a2e]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              {filteredAssets?.length || 0} assets found
            </span>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import New Asset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets?.map((asset) => (
          <Card key={asset.id} className="card-glow hover:border-blue-500/50 transition-all">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getDomainIcon(asset.ai_metadata?.domain)}</span>
                  <Badge className="capitalize">{asset.asset_type?.replace('_', ' ')}</Badge>
                </div>
                <Badge className={getDifficultyColor(asset.ai_metadata?.difficulty_level)}>
                  {asset.ai_metadata?.difficulty_level}
                </Badge>
              </div>

              {asset.ai_metadata?.topics && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">Topics:</div>
                  <div className="flex flex-wrap gap-1">
                    {asset.ai_metadata.topics.slice(0, 3).map((topic, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{topic}</Badge>
                    ))}
                    {asset.ai_metadata.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{asset.ai_metadata.topics.length - 3}</Badge>
                    )}
                  </div>
                </div>
              )}

              {asset.ai_metadata?.key_concepts && (
                <div>
                  <div className="text-xs text-gray-400 mb-1">Key Concepts:</div>
                  <div className="flex flex-wrap gap-1">
                    {asset.ai_metadata.key_concepts.slice(0, 2).map((concept, i) => (
                      <Badge key={i} className="bg-blue-500/20 text-blue-300 text-xs">{concept}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-gray-400">
                {asset.ai_metadata?.estimated_time_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {asset.ai_metadata.estimated_time_minutes}min
                  </div>
                )}
                {asset.connections?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" />
                    {asset.connections.length} connections
                  </div>
                )}
                {asset.usage_stats?.times_used > 0 && (
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Used {asset.usage_stats.times_used}x
                  </div>
                )}
              </div>

              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!filteredAssets || filteredAssets.length === 0) && (
        <Card className="card-glow">
          <CardContent className="pt-6 text-center text-gray-400 py-12">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No assets found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}