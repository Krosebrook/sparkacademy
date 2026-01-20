import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Sparkles, User, Briefcase, Code, Award, Eye, Save, Copy, Check, Lightbulb } from 'lucide-react';

export default function AIPortfolioBuilder() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const [portfolioData, setPortfolioData] = useState({
    portfolio_title: '',
    bio: '',
    skills: [],
    projects: [],
    is_public: false
  });

  const { data: portfolio } = useQuery({
    queryKey: ['my-portfolio'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const portfolios = await base44.entities.StudentPortfolio.filter({ student_email: user.email });
      return portfolios[0] || null;
    }
  });

  const savePortfolioMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      if (portfolio) {
        return base44.entities.StudentPortfolio.update(portfolio.id, data);
      } else {
        return base44.entities.StudentPortfolio.create({ ...data, student_email: user.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-portfolio']);
      alert('Portfolio saved successfully!');
    }
  });

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generatePortfolioSuggestions');
      setSuggestions(data);
    } catch (error) {
      console.error('Suggestions error:', error);
      alert('Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (field, value) => {
    setPortfolioData(prev => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const addProject = (project) => {
    setPortfolioData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), {
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        completion_date: new Date().toISOString().split('T')[0]
      }]
    }));
  };

  const addSkill = (skill) => {
    setPortfolioData(prev => ({
      ...prev,
      skills: [...(prev.skills || []), {
        skill_name: skill.skill_name,
        proficiency_level: skill.proficiency.toLowerCase(),
        acquired_from: 'Multiple Courses'
      }]
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="card-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI Portfolio Builder
            </CardTitle>
            <Button onClick={generateSuggestions} disabled={loading} variant="outline">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Get AI Suggestions
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
              <p className="text-gray-400">Analyzing your learning journey...</p>
            </div>
          ) : suggestions ? (
            <Tabs defaultValue="headline" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5 bg-[#1a0a2e] border border-gray-700">
                <TabsTrigger value="headline">Headline</TabsTrigger>
                <TabsTrigger value="bio">Bio</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="tips">Tips</TabsTrigger>
              </TabsList>

              <TabsContent value="headline" className="space-y-3">
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white text-sm">Suggested Headline</h4>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(suggestions.portfolio_headline, 'headline')}>
                        {copiedField === 'headline' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                      <Button size="sm" onClick={() => applySuggestion('portfolio_title', suggestions.portfolio_headline)}>
                        Use This
                      </Button>
                    </div>
                  </div>
                  <p className="text-white">{suggestions.portfolio_headline}</p>
                </div>
              </TabsContent>

              <TabsContent value="bio" className="space-y-3">
                {Object.entries(suggestions.bio_suggestions || {}).map(([type, bio]) => (
                  <div key={type} className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-blue-500/20 text-blue-300 capitalize">{type}</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(bio, `bio-${type}`)}>
                          {copiedField === `bio-${type}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                        <Button size="sm" onClick={() => applySuggestion('bio', bio)}>
                          Use This
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{bio}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="projects" className="space-y-3">
                <div className="text-sm text-gray-400 mb-3">
                  {suggestions.project_ideas?.length || 0} project ideas tailored to your skills
                </div>
                {suggestions.project_ideas?.map((project, idx) => (
                  <div key={idx} className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm mb-1">{project.title}</h4>
                        <div className="flex gap-2 mb-2">
                          <Badge className="bg-green-500/20 text-green-300 text-xs">{project.difficulty}</Badge>
                          <Badge className="bg-blue-500/20 text-blue-300 text-xs">{project.estimated_hours}h</Badge>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => addProject(project)}>
                        Add to Portfolio
                      </Button>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {project.technologies?.map((tech, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{tech}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-yellow-300">💡 {project.why_build_it}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="skills" className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.skills_to_highlight?.map((skill, idx) => (
                    <div key={idx} className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-white text-sm">{skill.skill_name}</h4>
                        <Button size="sm" variant="ghost" onClick={() => addSkill(skill)}>
                          + Add
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-cyan-500/20 text-cyan-300 text-xs">{skill.category}</Badge>
                        <Badge className="bg-purple-500/20 text-purple-300 text-xs">{skill.proficiency}</Badge>
                        <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">{skill.priority} priority</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="tips" className="space-y-3">
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Achievement Showcase
                  </h4>
                  <div className="space-y-2 text-xs text-gray-300">
                    <p><strong>Certificates:</strong> {suggestions.achievement_showcase?.certificates_display}</p>
                    <p><strong>Badges:</strong> {suggestions.achievement_showcase?.badges_display}</p>
                    <div>
                      <strong>Metrics to include:</strong>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        {suggestions.achievement_showcase?.metrics_to_include?.map((metric, i) => (
                          <li key={i}>{metric}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {suggestions.presentation_tips?.map((tip, idx) => (
                  <div key={idx} className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-orange-400 mt-0.5" />
                      <div className="flex-1">
                        <Badge className="bg-orange-500/20 text-orange-300 text-xs mb-1">{tip.category}</Badge>
                        <p className="text-sm text-gray-300">{tip.tip}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Click "Get AI Suggestions" to receive personalized portfolio building recommendations
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Your Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Portfolio Headline</label>
            <Input
              value={portfolioData.portfolio_title}
              onChange={(e) => setPortfolioData(prev => ({ ...prev, portfolio_title: e.target.value }))}
              placeholder="e.g., Full-Stack Developer | AI Enthusiast | Problem Solver"
              className="bg-[#1a0a2e]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Bio</label>
            <Textarea
              value={portfolioData.bio}
              onChange={(e) => setPortfolioData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell your story..."
              className="bg-[#1a0a2e] h-24"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={portfolioData.is_public}
              onChange={(e) => setPortfolioData(prev => ({ ...prev, is_public: e.target.checked }))}
              className="w-4 h-4"
            />
            <label className="text-sm text-gray-300">Make portfolio public</label>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => savePortfolioMutation.mutate(portfolioData)} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Portfolio
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>

          {(portfolioData.projects?.length > 0 || portfolioData.skills?.length > 0) && (
            <div className="border-t border-gray-700 pt-4 space-y-4">
              {portfolioData.projects?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Projects ({portfolioData.projects.length})</h4>
                  <div className="space-y-2">
                    {portfolioData.projects.map((proj, i) => (
                      <div key={i} className="bg-gray-800/50 rounded p-2 text-xs">
                        <div className="font-medium text-white">{proj.title}</div>
                        <div className="text-gray-400">{proj.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {portfolioData.skills?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Skills ({portfolioData.skills.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {portfolioData.skills.map((skill, i) => (
                      <Badge key={i} className="bg-blue-500/20 text-blue-300 text-xs">
                        {skill.skill_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}