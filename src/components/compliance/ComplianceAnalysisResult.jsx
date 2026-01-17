/**
 * Compliance Analysis Result Display
 * Shows comprehensive compliance report with risk assessment and follow-ups
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, AlertTriangle, Clock, TrendingDown, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ComplianceAnalysisResult({ report }) {
  const [expandedConcern, setExpandedConcern] = useState(null);

  if (!report) return null;

  const riskColors = {
    low: 'bg-green-500/10 border-green-500/30 text-green-300',
    medium: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    high: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
    critical: 'bg-red-500/10 border-red-500/30 text-red-300'
  };

  const recommendationColors = {
    proceed: 'bg-green-500/20 border-green-500/50',
    proceed_with_caution: 'bg-yellow-500/20 border-yellow-500/50',
    require_resolution: 'bg-orange-500/20 border-orange-500/50',
    do_not_proceed: 'bg-red-500/20 border-red-500/50'
  };

  const recommendationLabels = {
    proceed: '✅ Proceed',
    proceed_with_caution: '⚠️ Proceed with Caution',
    require_resolution: '🔴 Require Resolution',
    do_not_proceed: '❌ Do Not Proceed'
  };

  return (
    <div className="space-y-6">
      {/* Risk Summary Card */}
      <Card className={`card-glow border-2 ${riskColors[report.risk_summary?.overall_risk_level]}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{report.company_name}</CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                Analysis Date: {new Date(report.analysis_date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${riskColors[report.risk_summary?.overall_risk_level]}`}>
                {report.risk_summary?.risk_score}
              </div>
              <p className="text-xs text-gray-400">Risk Score</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-sm text-gray-300">{report.risk_summary?.summary}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Risk Level</p>
              <Badge className={riskColors[report.risk_summary?.overall_risk_level]}>
                {report.risk_summary?.overall_risk_level?.toUpperCase()}
              </Badge>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Total Concerns</p>
              <p className="text-lg font-bold text-white">{report.compliance_concerns?.length || 0}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Follow-ups</p>
              <p className="text-lg font-bold text-white">{report.recommended_followups?.length || 0}</p>
            </div>
          </div>

          {/* Investment Recommendation */}
          <div className={`p-4 rounded-lg border ${recommendationColors[report.investment_recommendation]}`}>
            <p className="text-sm font-semibold mb-2">
              {recommendationLabels[report.investment_recommendation]}
            </p>
            {report.conditions_for_investment?.length > 0 && (
              <div className="text-sm text-gray-300 space-y-1">
                {report.conditions_for_investment.map((cond, idx) => (
                  <p key={idx} className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>{cond}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="concerns" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#1a0a2e]/50">
          <TabsTrigger value="concerns">Concerns</TabsTrigger>
          <TabsTrigger value="sec">SEC</TabsTrigger>
          <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
          <TabsTrigger value="followup">Follow-ups</TabsTrigger>
        </TabsList>

        {/* Compliance Concerns */}
        <TabsContent value="concerns" className="space-y-3">
          {report.compliance_concerns?.length > 0 ? (
            report.compliance_concerns.map((concern, idx) => (
              <Card key={idx} className="card-glow border cursor-pointer hover:border-purple-500/50" onClick={() => setExpandedConcern(expandedConcern === idx ? null : idx)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      concern.severity === 'high' ? 'text-red-400' :
                      concern.severity === 'medium' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white">{concern.concern}</p>
                        <Badge variant="outline" className="text-xs">
                          {concern.severity}
                        </Badge>
                        <span className="text-xs text-gray-400">({concern.source})</span>
                      </div>
                      {expandedConcern === idx && (
                        <div className="mt-3 space-y-2 text-sm text-gray-300 bg-white/5 p-3 rounded">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Evidence:</p>
                            <p>{concern.evidence}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Regulatory Impact:</p>
                            <p>{concern.regulatory_impact}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-300">No material compliance concerns identified</p>
            </div>
          )}
        </TabsContent>

        {/* SEC Findings */}
        <TabsContent value="sec" className="space-y-4">
          <Card className="card-glow border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Filings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {report.sec_findings?.recent_filings?.length > 0 ? (
                report.sec_findings.recent_filings.map((filing, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white text-sm">{filing.type}</p>
                      <p className="text-xs text-gray-400">{filing.date}</p>
                    </div>
                    {filing.url && (
                      <a href={filing.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                        View
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No recent filings found</p>
              )}
            </CardContent>
          </Card>

          {report.sec_findings?.red_flags?.length > 0 && (
            <Card className="card-glow border border-red-500/30">
              <CardHeader>
                <CardTitle className="text-lg text-red-300">Red Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.sec_findings.red_flags.map((flag, idx) => (
                  <div key={idx} className="p-3 bg-red-500/10 rounded text-sm text-red-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{flag}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Regulatory */}
        <TabsContent value="regulatory" className="space-y-4">
          <Card className="card-glow border">
            <CardHeader>
              <CardTitle className="text-lg">Regulatory Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Status</p>
                <p className="text-white font-semibold">{report.regulatory_findings?.status || 'Unknown'}</p>
              </div>

              {report.regulatory_findings?.violations?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Violations</p>
                  <div className="space-y-1">
                    {report.regulatory_findings.violations.map((v, idx) => (
                      <p key={idx} className="text-sm text-red-300 flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <span>{v}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {report.regulatory_findings?.investigations?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Active Investigations</p>
                  <div className="space-y-1">
                    {report.regulatory_findings.investigations.map((inv, idx) => (
                      <p key={idx} className="text-sm text-yellow-300 flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <span>{inv}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-ups */}
        <TabsContent value="followup" className="space-y-3">
          {report.recommended_followups?.length > 0 ? (
            report.recommended_followups.map((followup, idx) => (
              <Card key={idx} className={`card-glow border ${
                followup.priority === 'high' ? 'border-red-500/30' :
                followup.priority === 'medium' ? 'border-yellow-500/30' :
                'border-blue-500/30'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Clock className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      followup.priority === 'high' ? 'text-red-400' :
                      followup.priority === 'medium' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white">{followup.check}</p>
                        <Badge variant="outline" className="text-xs">
                          {followup.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{followup.reason}</p>
                      <p className="text-xs text-gray-400">
                        Estimated: {followup.estimated_days} business days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="card-glow border">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-300">No additional follow-ups required</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}