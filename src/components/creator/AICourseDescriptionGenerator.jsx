import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Loader2, FileText, Copy, Check, Sparkles } from 'lucide-react';

export default function AICourseDescriptionGenerator() {
  const [loading, setLoading] = useState(false);
  const [courseTopic, setCourseTopic] = useState('');
  const [keyBenefits, setKeyBenefits] = useState('');
  const [targetAudience, setTargetAudience] = useState('beginners');
  const [descriptions, setDescriptions] = useState(null);
  const [copiedPlatform, setCopiedPlatform] = useState(null);

  const generateDescriptions = async () => {
    if (!courseTopic.trim()) return;

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateCourseDescription', {
        topic: courseTopic.trim(),
        key_benefits: keyBenefits.trim() || undefined,
        target_audience: targetAudience
      });
      setDescriptions(data);
    } catch (error) {
      console.error('Description generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyDescription = (platform) => {
    const description = descriptions[platform];
    navigator.clipboard.writeText(description);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          AI Course Description Generator
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
            <label className="text-sm text-gray-300 mb-1 block">
              Key Benefits (Optional)
            </label>
            <Textarea
              value={keyBenefits}
              onChange={(e) => setKeyBenefits(e.target.value)}
              placeholder="e.g., Build portfolio projects, get job-ready, learn industry best practices..."
              className="bg-[#1a0a2e] h-20"
            />
          </div>

          <Button 
            onClick={generateDescriptions} 
            disabled={loading || !courseTopic.trim()}
            className="w-full btn-primary"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Generate Descriptions for All Platforms
          </Button>
        </div>

        {descriptions && (
          <div className="border-t border-gray-700 pt-4">
            <Tabs defaultValue="marketing" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-[#1a0a2e] border border-gray-700">
                <TabsTrigger value="marketing" className="data-[state=active]:bg-purple-500/20 text-xs">
                  Marketing Page
                </TabsTrigger>
                <TabsTrigger value="catalog" className="data-[state=active]:bg-purple-500/20 text-xs">
                  Catalog
                </TabsTrigger>
                <TabsTrigger value="email" className="data-[state=active]:bg-purple-500/20 text-xs">
                  Email
                </TabsTrigger>
                <TabsTrigger value="social" className="data-[state=active]:bg-purple-500/20 text-xs">
                  Social Media
                </TabsTrigger>
              </TabsList>

              <TabsContent value="marketing" className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500/20 text-purple-300">Marketing Page</Badge>
                    <span className="text-xs text-gray-400">
                      {descriptions.marketing_page?.split(' ').length} words
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyDescription('marketing_page')}
                    className="text-xs"
                  >
                    {copiedPlatform === 'marketing_page' ? 
                      <><Check className="w-3 h-3 mr-1" /> Copied!</> : 
                      <><Copy className="w-3 h-3 mr-1" /> Copy</>
                    }
                  </Button>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {descriptions.marketing_page}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  Optimized for: Landing pages, course detail pages, conversion-focused copy
                </p>
              </TabsContent>

              <TabsContent value="catalog" className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/20 text-blue-300">Internal Catalog</Badge>
                    <span className="text-xs text-gray-400">
                      {descriptions.internal_catalog?.split(' ').length} words
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyDescription('internal_catalog')}
                    className="text-xs"
                  >
                    {copiedPlatform === 'internal_catalog' ? 
                      <><Check className="w-3 h-3 mr-1" /> Copied!</> : 
                      <><Copy className="w-3 h-3 mr-1" /> Copy</>
                    }
                  </Button>
                </div>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {descriptions.internal_catalog}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  Optimized for: LMS listings, course catalogs, internal documentation
                </p>
              </TabsContent>

              <TabsContent value="email" className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-300">Email Campaign</Badge>
                    <span className="text-xs text-gray-400">
                      {descriptions.email_campaign?.split(' ').length} words
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyDescription('email_campaign')}
                    className="text-xs"
                  >
                    {copiedPlatform === 'email_campaign' ? 
                      <><Check className="w-3 h-3 mr-1" /> Copied!</> : 
                      <><Copy className="w-3 h-3 mr-1" /> Copy</>
                    }
                  </Button>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {descriptions.email_campaign}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  Optimized for: Email marketing, newsletters, promotional campaigns
                </p>
              </TabsContent>

              <TabsContent value="social" className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-cyan-500/20 text-cyan-300">Social Media</Badge>
                    <span className="text-xs text-gray-400">
                      {descriptions.social_media?.split(' ').length} words
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyDescription('social_media')}
                    className="text-xs"
                  >
                    {copiedPlatform === 'social_media' ? 
                      <><Check className="w-3 h-3 mr-1" /> Copied!</> : 
                      <><Copy className="w-3 h-3 mr-1" /> Copy</>
                    }
                  </Button>
                </div>
                <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">
                    {descriptions.social_media}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  Optimized for: LinkedIn, Twitter/X, Facebook posts, Instagram captions
                </p>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}