import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Eye, ArrowRight, Star, AlertCircle } from 'lucide-react';

export default function ContentVersionComparison({ versions, onSelectVersion }) {
  const [comparisonMode, setComparisonMode] = useState('side-by-side');
  const [selectedVersions, setSelectedVersions] = useState([versions[0]?.domain, versions[1]?.domain]);
  const [expandedDetails, setExpandedDetails] = useState(null);

  if (!versions || versions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-gray-500">
          No versions to compare
        </CardContent>
      </Card>
    );
  }

  const getVersion = (domain) => versions.find(v => v.domain === domain);
  const v1 = getVersion(selectedVersions[0]);
  const v2 = getVersion(selectedVersions[1]);

  const getDomainColor = (domain) => {
    const colors = {
      financial: 'from-blue-500 to-cyan-500',
      developer: 'from-purple-500 to-pink-500',
      creative: 'from-orange-500 to-red-500',
      healthcare: 'from-green-500 to-emerald-500',
      manufacturing: 'from-yellow-500 to-orange-500'
    };
    return colors[domain] || 'from-gray-500 to-gray-600';
  };

  const domainIcons = {
    financial: '💰',
    developer: '💻',
    creative: '🎨',
    healthcare: '🏥',
    manufacturing: '🏭'
  };

  return (
    <div className="space-y-6">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Content Version Comparison
            </span>
            <div className="flex items-center gap-2">
              <Select value={comparisonMode} onValueChange={setComparisonMode}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="side-by-side">Side by Side</SelectItem>
                  <SelectItem value="highlights">Highlights</SelectItem>
                  <SelectItem value="metrics">Metrics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Select Version 1</label>
              <Select value={selectedVersions[0]} onValueChange={(val) => setSelectedVersions([val, selectedVersions[1]])}>
                <SelectTrigger className="bg-[#1a0a2e]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {versions.map(v => (
                    <SelectItem key={v.domain} value={v.domain}>
                      {domainIcons[v.domain]} {v.domain.charAt(0).toUpperCase() + v.domain.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-2 block">Select Version 2</label>
              <Select value={selectedVersions[1]} onValueChange={(val) => setSelectedVersions([selectedVersions[0], val])}>
                <SelectTrigger className="bg-[#1a0a2e]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {versions.map(v => (
                    <SelectItem key={v.domain} value={v.domain}>
                      {domainIcons[v.domain]} {v.domain.charAt(0).toUpperCase() + v.domain.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {comparisonMode === 'side-by-side' && v1 && v2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[v1, v2].map((version, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${getDomainColor(version.domain)} rounded-lg p-0.5`}>
                  <div className="bg-[#0f0618] rounded p-4 space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <span className="text-2xl">{domainIcons[version.domain]}</span>
                        {version.domain.charAt(0).toUpperCase() + version.domain.slice(1)} Version
                      </h4>
                      {version.selected && (
                        <Badge className="bg-green-500/20 text-green-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="bg-blue-900/20 rounded p-2">
                        <div className="text-xs text-gray-400">Suitability Score</div>
                        <div className="text-2xl font-bold text-blue-400">{version.suitability_score || 0}%</div>
                      </div>

                      {version.domain_focus_areas?.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Domain Focus:</div>
                          <div className="flex flex-wrap gap-1">
                            {version.domain_focus_areas.slice(0, 3).map((area, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                            ))}
                            {version.domain_focus_areas.length > 3 && (
                              <Badge variant="outline" className="text-xs">+{version.domain_focus_areas.length - 3}</Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {version.case_studies?.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Case Studies: {version.case_studies.length}</div>
                        </div>
                      )}

                      {version.recommended_tools?.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Recommended Tools:</div>
                          <div className="flex flex-wrap gap-1">
                            {version.recommended_tools.slice(0, 2).map((tool, i) => (
                              <Badge key={i} className="bg-purple-500/20 text-purple-300 text-xs">{tool}</Badge>
                            ))}
                            {version.recommended_tools.length > 2 && (
                              <Badge className="bg-purple-500/20 text-purple-300 text-xs">+{version.recommended_tools.length - 2}</Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => onSelectVersion(version)}
                      className="w-full"
                      variant={version.selected ? 'default' : 'outline'}
                    >
                      {version.selected ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4 mr-2" />
                          Select This Version
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {comparisonMode === 'metrics' && v1 && v2 && (
            <div className="space-y-3">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Version Metrics Comparison</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Suitability Score</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-400">{v1.suitability_score || 0}%</span>
                        <span className="text-gray-500">vs</span>
                        <span className="text-sm text-purple-400">{v2.suitability_score || 0}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2 h-2 rounded overflow-hidden">
                      <div
                        className="bg-blue-500 rounded"
                        style={{ width: `${v1.suitability_score || 0}%` }}
                      />
                      <div
                        className="bg-purple-500 rounded"
                        style={{ width: `${v2.suitability_score || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Case Studies</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-400">{v1.case_studies?.length || 0}</span>
                        <span className="text-gray-500">vs</span>
                        <span className="text-sm text-purple-400">{v2.case_studies?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Recommended Tools</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-400">{v1.recommended_tools?.length || 0}</span>
                        <span className="text-gray-500">vs</span>
                        <span className="text-sm text-purple-400">{v2.recommended_tools?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Focus Areas</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-400">{v1.domain_focus_areas?.length || 0}</span>
                        <span className="text-gray-500">vs</span>
                        <span className="text-sm text-purple-400">{v2.domain_focus_areas?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {comparisonMode === 'highlights' && v1 && v2 && (
            <div className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  {domainIcons[v1.domain]} {v1.domain.charAt(0).toUpperCase() + v1.domain.slice(1)} Highlights
                </h4>
                <div className="space-y-1">
                  {v1.domain_focus_areas?.slice(0, 3).map((area, i) => (
                    <div key={i} className="text-sm text-blue-300 flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 mt-0.5" />
                      {area}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  {domainIcons[v2.domain]} {v2.domain.charAt(0).toUpperCase() + v2.domain.slice(1)} Highlights
                </h4>
                <div className="space-y-1">
                  {v2.domain_focus_areas?.slice(0, 3).map((area, i) => (
                    <div key={i} className="text-sm text-purple-300 flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 mt-0.5" />
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            All Generated Versions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {versions.map((version) => (
              <button
                key={version.domain}
                onClick={() => onSelectVersion(version)}
                className={`rounded-lg p-3 transition-all border-2 ${
                  version.selected
                    ? 'border-green-500 bg-green-900/30'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-1">{domainIcons[version.domain]}</div>
                <div className="font-semibold text-white text-sm capitalize">{version.domain}</div>
                <div className="text-xs text-gray-400 mt-1">{version.suitability_score || 0}% suitable</div>
                {version.selected && (
                  <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Selected
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}