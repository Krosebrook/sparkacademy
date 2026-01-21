import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Loader2, Globe, Briefcase, History, FileText, Lightbulb } from 'lucide-react';

export default function AIRealWorldExamplesIntegrator() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    lesson_topic: '',
    lesson_content: '',
    target_audience: ''
  });
  const [examples, setExamples] = useState(null);

  const generateExamples = async () => {
    if (!formData.lesson_topic || !formData.lesson_content) {
      alert('Please fill in lesson topic and content');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('suggestRealWorldExamples', formData);
      setExamples(data);
    } catch (error) {
      console.error('Error generating examples:', error);
      alert('Failed to generate real-world examples');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-green-400" />
          AI Real-World Examples Integrator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-gray-300 mb-1 block">Lesson Topic</label>
          <Input
            value={formData.lesson_topic}
            onChange={(e) => setFormData(prev => ({ ...prev, lesson_topic: e.target.value }))}
            placeholder="e.g., Blockchain Technology"
            className="bg-[#1a0a2e]"
          />
        </div>

        <div>
          <label className="text-sm text-gray-300 mb-1 block">Lesson Content</label>
          <Textarea
            value={formData.lesson_content}
            onChange={(e) => setFormData(prev => ({ ...prev, lesson_content: e.target.value }))}
            placeholder="Paste the main concepts and learning objectives..."
            className="bg-[#1a0a2e] h-32"
          />
        </div>

        <div>
          <label className="text-sm text-gray-300 mb-1 block">Target Audience (Optional)</label>
          <Input
            value={formData.target_audience}
            onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
            placeholder="e.g., Computer Science students, Business professionals"
            className="bg-[#1a0a2e]"
          />
        </div>

        <Button onClick={generateExamples} disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
          Generate Real-World Examples
        </Button>

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-green-400 animate-spin" />
            <p className="text-gray-400">Searching for relevant real-world examples...</p>
          </div>
        )}

        {examples && (
          <Tabs defaultValue="current" className="mt-6">
            <TabsList className="grid w-full grid-cols-5 bg-[#1a0a2e] border border-gray-700">
              <TabsTrigger value="current">Current Events</TabsTrigger>
              <TabsTrigger value="industry">Industry</TabsTrigger>
              <TabsTrigger value="historical">Historical</TabsTrigger>
              <TabsTrigger value="cases">Case Studies</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-3">
              <div className="text-sm text-gray-400 mb-3">
                {examples.current_events?.length || 0} recent events relevant to your lesson
              </div>
              {examples.current_events?.map((event, idx) => (
                <div key={idx} className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white">{event.event_title}</h4>
                    <Badge className="bg-blue-500/20 text-blue-300 text-xs">{event.relevance_score}</Badge>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{event.description}</p>
                  <div className="bg-blue-900/10 border border-blue-500/20 rounded p-2 mb-2">
                    <div className="text-xs text-blue-300 font-semibold mb-1">Connection to Lesson:</div>
                    <p className="text-xs text-gray-300">{event.lesson_connection}</p>
                  </div>
                  {event.discussion_questions?.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-400">Discussion Questions:</div>
                      {event.discussion_questions.map((q, i) => (
                        <div key={i} className="text-xs text-gray-300">❓ {q}</div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{event.date}</Badge>
                    <Badge variant="outline" className="text-xs">{event.source}</Badge>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="industry" className="space-y-3">
              {examples.industry_applications?.map((app, idx) => (
                <div key={idx} className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Briefcase className="w-5 h-5 text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{app.company_organization}</h4>
                      <Badge className="bg-green-500/20 text-green-300 text-xs">Industry Application</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-400">Use Case:</div>
                      <p className="text-sm text-gray-300">{app.use_case}</p>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Impact:</div>
                      <p className="text-sm text-gray-300">{app.impact}</p>
                    </div>
                    {app.learning_points?.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Learning Points:</div>
                        {app.learning_points.map((point, i) => (
                          <div key={i} className="text-xs text-green-300">✓ {point}</div>
                        ))}
                      </div>
                    )}
                    <div className="bg-green-900/10 border border-green-500/20 rounded p-2 mt-2">
                      <div className="text-xs text-green-300">💼 Career Relevance: {app.career_relevance}</div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="historical" className="space-y-3">
              {examples.historical_context?.map((hist, idx) => (
                <div key={idx} className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <History className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{hist.event_milestone}</h4>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-400">Connection:</div>
                      <p className="text-sm text-gray-300">{hist.lesson_connection}</p>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Evolution:</div>
                      <p className="text-sm text-gray-300">{hist.evolution}</p>
                    </div>
                    <div className="bg-purple-900/10 border border-purple-500/20 rounded p-2">
                      <div className="text-xs text-purple-300">🔮 Modern Relevance: {hist.modern_relevance}</div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="cases" className="space-y-3">
              {examples.case_studies?.map((caseStudy, idx) => (
                <div key={idx} className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <FileText className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <h4 className="font-semibold text-white">{caseStudy.title}</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Background:</div>
                      <p className="text-sm text-gray-300">{caseStudy.background}</p>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Challenge:</div>
                      <p className="text-sm text-gray-300">{caseStudy.challenge}</p>
                    </div>
                    <div className="bg-cyan-900/10 border border-cyan-500/20 rounded p-2">
                      <div className="text-xs text-cyan-300 font-semibold mb-1">Concept Application:</div>
                      <p className="text-xs text-gray-300">{caseStudy.concept_application}</p>
                    </div>
                    {caseStudy.discussion_points?.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Discussion Points:</div>
                        {caseStudy.discussion_points.map((point, i) => (
                          <div key={i} className="text-xs text-gray-300">💬 {point}</div>
                        ))}
                      </div>
                    )}
                    {caseStudy.learning_outcomes?.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Learning Outcomes:</div>
                        {caseStudy.learning_outcomes.map((outcome, i) => (
                          <div key={i} className="text-xs text-cyan-300">✓ {outcome}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="integration" className="space-y-3">
              {examples.integration_guide?.map((guide, idx) => (
                <div key={idx} className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">{guide.activity_type}</Badge>
                        <Badge className="bg-orange-500/20 text-orange-300 text-xs">{guide.timing}</Badge>
                      </div>
                      <p className="text-sm text-gray-300">{guide.suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}