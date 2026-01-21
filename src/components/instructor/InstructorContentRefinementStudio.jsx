import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Sparkles, GitCompare, ChevronRight } from 'lucide-react';
import EnhancedDomainCustomizer from './EnhancedDomainCustomizer';
import ContentVersionComparison from './ContentVersionComparison';

export default function InstructorContentRefinementStudio({ contentType, initialContent }) {
  const [activeTab, setActiveTab] = useState('generate');
  const [generatedVersions, setGeneratedVersions] = useState(null);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState([
    'financial',
    'developer',
    'creative'
  ]);

  const saveVersionMutation = useMutation({
    mutationFn: async (versionData) => {
      return base44.entities.ContentVersion.create(versionData);
    }
  });

  const generateMultipleVersions = async () => {
    setLoadingVersions(true);
    try {
      const { data } = await base44.functions.invoke('generateMultiDomainContentVersions', {
        content_type: contentType,
        current_content: initialContent,
        domains_to_generate: selectedDomains
      });

      setGeneratedVersions(data);
      setActiveTab('compare');
    } catch (error) {
      console.error('Multi-version generation error:', error);
      alert('Failed to generate versions');
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleSelectVersion = async (version) => {
    try {
      const user = await base44.auth.me();
      await saveVersionMutation.mutateAsync({
        instructor_email: user.email,
        content_type: contentType,
        domain: version.domain,
        content: version.customized_content,
        metadata: {
          suitability_score: version.suitability_score,
          case_studies: version.case_studies,
          recommended_tools: version.recommended_tools,
          domain_focus_areas: version.domain_focus_areas,
          generated_date: new Date().toISOString()
        },
        selected: true
      });

      alert(`${version.domain} version selected and saved!`);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save version');
    }
  };

  const domainOptions = [
    { value: 'financial', label: 'Financial AI', icon: '💰' },
    { value: 'developer', label: 'Developer', icon: '💻' },
    { value: 'creative', label: 'Creative', icon: '🎨' },
    { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' }
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#1a0a2e] border border-gray-700">
          <TabsTrigger value="generate">Generate Versions</TabsTrigger>
          <TabsTrigger value="compare">Compare Versions</TabsTrigger>
          <TabsTrigger value="customize">Fine-Tune Single</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Generate Multi-Domain Versions
              </CardTitle>
              <p className="text-sm text-gray-400 mt-2">
                Create multiple domain-specific versions of your content for comparison
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-3 block">
                  Select Domains to Generate (choose multiple)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                  {domainOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => {
                        setSelectedDomains(prev =>
                          prev.includes(option.value)
                            ? prev.filter(d => d !== option.value)
                            : [...prev, option.value]
                        );
                      }}
                      className={`cursor-pointer rounded-lg border-2 p-3 transition-all text-center ${
                        selectedDomains.includes(option.value)
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-gray-600 bg-[#1a0a2e] hover:border-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-xs font-semibold text-white">{option.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={generateMultipleVersions}
                disabled={loadingVersions || selectedDomains.length === 0}
                className="btn-primary w-full"
              >
                {loadingVersions ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating {selectedDomains.length} versions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate {selectedDomains.length} Domain Versions
                  </>
                )}
              </Button>

              {loadingVersions && (
                <div className="text-center py-8">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-400 animate-spin" />
                  <p className="text-gray-400">Creating optimized versions for each domain...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare" className="space-y-4">
          {generatedVersions ? (
            <>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GitCompare className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-white">
                    {generatedVersions.total_versions} Versions Generated
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  Compare different domain-specific versions and select the best fit for your needs
                </p>
              </div>

              <ContentVersionComparison
                versions={generatedVersions.versions}
                onSelectVersion={handleSelectVersion}
              />
            </>
          ) : (
            <Card className="card-glow">
              <CardContent className="pt-6 text-center">
                <div className="text-gray-400">
                  <GitCompare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Generate versions first to compare them</p>
                  <Button
                    onClick={() => setActiveTab('generate')}
                    variant="outline"
                    className="mt-4"
                  >
                    Go to Generate Tab
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="customize" className="space-y-4">
          <EnhancedDomainCustomizer
            contentType={contentType}
            currentContent={initialContent}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}