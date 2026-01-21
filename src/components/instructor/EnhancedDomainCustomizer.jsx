import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { Loader2, Sparkles, Target, CheckCircle, BookOpen } from 'lucide-react';

export default function EnhancedDomainCustomizer({ contentType, currentContent }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    domain_focus: 'financial',
    specific_feedback: ''
  });
  const [refinedResult, setRefinedResult] = useState(null);

  const domainOptions = [
    { value: 'financial', label: 'Financial AI', icon: '💰', description: 'Trading, risk, fraud detection' },
    { value: 'developer', label: 'Developer/Engineer', icon: '💻', description: 'Coding, APIs, deployment' },
    { value: 'creative', label: 'Creative/Artistic', icon: '🎨', description: 'Content, design, media' },
    { value: 'healthcare', label: 'Healthcare', icon: '🏥', description: 'Medical AI, diagnostics' },
    { value: 'manufacturing', label: 'Manufacturing', icon: '🏭', description: 'Operations, automation' }
  ];

  const quickFeedbackByDomain = {
    financial: [
      'Add more algorithmic trading examples',
      'Include fraud detection case studies',
      'Focus on risk assessment applications',
      'Add regulatory compliance considerations'
    ],
    developer: [
      'Add more hands-on coding challenges',
      'Include API integration examples',
      'Focus on model deployment practices',
      'Add debugging and optimization tips'
    ],
    creative: [
      'Add generative AI tool examples',
      'Include creative workflow integration',
      'Focus on human-AI collaboration',
      'Add multimedia project assignments'
    ],
    healthcare: [
      'Add medical diagnostic examples',
      'Include HIPAA compliance considerations',
      'Focus on patient safety and ethics',
      'Add clinical scenario case studies'
    ],
    manufacturing: [
      'Add predictive maintenance examples',
      'Include IoT integration scenarios',
      'Focus on operational efficiency',
      'Add supply chain optimization cases'
    ]
  };

  const refineContent = async () => {
    if (!formData.specific_feedback.trim()) {
      alert('Please provide specific feedback');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('refineContentByDomain', {
        content_type: contentType,
        current_content: currentContent,
        domain_focus: formData.domain_focus,
        specific_feedback: formData.specific_feedback
      });

      setRefinedResult(data);
    } catch (error) {
      console.error('Domain refinement error:', error);
      alert('Failed to refine content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Domain-Specific Content Customizer
          </CardTitle>
          <p className="text-sm text-gray-400">
            Tailor AI course content for specific industries and roles within INTInc client organizations
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Select Domain Focus</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {domainOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => setFormData(prev => ({ ...prev, domain_focus: option.value }))}
                  className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                    formData.domain_focus === option.value
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-600 bg-[#1a0a2e] hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-semibold text-white">{option.label}</span>
                  </div>
                  <p className="text-xs text-gray-400">{option.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Specific Customization Feedback</label>
            <Textarea
              value={formData.specific_feedback}
              onChange={(e) => setFormData(prev => ({ ...prev, specific_feedback: e.target.value }))}
              placeholder={`e.g., Add more ${formData.domain_focus === 'financial' ? 'quantitative analysis examples' : formData.domain_focus === 'developer' ? 'Python code samples' : 'real-world applications'}, include industry-specific case studies...`}
              className="bg-[#1a0a2e] h-32"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Quick Suggestions for {domainOptions.find(d => d.value === formData.domain_focus)?.label}</label>
            <div className="flex flex-wrap gap-2">
              {quickFeedbackByDomain[formData.domain_focus]?.map((suggestion, idx) => (
                <Badge
                  key={idx}
                  className="cursor-pointer hover:bg-purple-600 transition-colors"
                  onClick={() => setFormData(prev => ({ ...prev, specific_feedback: suggestion }))}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={refineContent} disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Target className="w-4 h-4 mr-2" />}
            Customize for {domainOptions.find(d => d.value === formData.domain_focus)?.label}
          </Button>

          {loading && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
              <p className="text-gray-400">Customizing content for {formData.domain_focus} industry...</p>
            </div>
          )}

          {refinedResult && (
            <Tabs defaultValue="summary" className="mt-6">
              <TabsList className="grid w-full grid-cols-3 bg-[#1a0a2e] border border-gray-700">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="enhancements">Enhancements</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <h4 className="font-semibold text-white">Domain Customization Complete</h4>
                    <Badge className="bg-green-500/20 text-green-300 ml-auto">
                      Relevance: {refinedResult.industry_relevance_score || 0}%
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-white mb-2">Changes Summary</h5>
                    <p className="text-sm text-gray-300">{refinedResult.changes_summary}</p>
                  </div>

                  {refinedResult.added_case_studies?.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-white mb-2">Added Case Studies</h5>
                      <ul className="space-y-1">
                        {refinedResult.added_case_studies.map((study, i) => (
                          <li key={i} className="text-xs text-green-300">✓ {study}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="enhancements" className="space-y-3">
                {refinedResult.domain_enhancements?.map((enhancement, idx) => (
                  <div key={idx} className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <Badge className="bg-blue-500/20 text-blue-300 mb-2">{enhancement.enhancement_type}</Badge>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-gray-400">Original:</div>
                        <p className="text-sm text-gray-300">{enhancement.original}</p>
                      </div>
                      <div className="border-l-2 border-green-500 pl-3">
                        <div className="text-xs text-gray-400">Enhanced:</div>
                        <p className="text-sm text-green-300">{enhancement.enhanced}</p>
                      </div>
                      <div className="text-xs text-gray-400 italic">
                        Rationale: {enhancement.rationale}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="resources" className="space-y-3">
                {refinedResult.recommended_resources?.map((resource, idx) => (
                  <div key={idx} className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <Badge className="bg-purple-500/20 text-purple-300">{resource.resource_type}</Badge>
                    </div>
                    <h5 className="font-semibold text-white text-sm mb-1">{resource.title}</h5>
                    <p className="text-xs text-gray-300">{resource.description}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}