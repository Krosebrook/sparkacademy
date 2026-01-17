/**
 * Compliance Checker
 * Interface to initiate comprehensive compliance analysis
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import ComplianceAnalysisResult from './ComplianceAnalysisResult';

export default function ComplianceChecker() {
  const [companyName, setCompanyName] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await base44.functions.invoke('enhancedComplianceAnalysis', {
        company_name: companyName,
        company_url: companyUrl || undefined,
        include_web_scrape: !!companyUrl
      });

      if (response.data?.report) {
        setReport(response.data.report);
      } else {
        setError('Failed to generate compliance report');
      }
    } catch (err) {
      setError(err.message || 'Error analyzing compliance');
    } finally {
      setIsLoading(false);
    }
  };

  if (report) {
    return (
      <div className="space-y-6">
        <Button
          onClick={() => setReport(null)}
          variant="outline"
          className="mb-4"
        >
          ← Back to New Analysis
        </Button>
        <ComplianceAnalysisResult report={report} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Compliance & Due Diligence</h1>
        <p className="text-gray-400">Analyze SEC filings, regulatory data, and identify key compliance risks</p>
      </div>

      <Card className="card-glow border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Company Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-white block mb-2">Company Name *</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Tesla Inc., OpenAI"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-white block mb-2">Company Website (Optional)</label>
            <input
              type="url"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              placeholder="https://company.com"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-400 mt-1">Website will be analyzed for additional compliance info</p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-200">
              <span className="font-semibold">Analysis includes:</span> SEC filings, regulatory status, compliance violations, governance issues, and recommended follow-up checks.
            </p>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !companyName.trim()}
            className="btn-primary w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Analyze Compliance
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="card-glow border">
          <CardContent className="p-4">
            <Badge className="mb-2">SEC FILINGS</Badge>
            <p className="text-sm text-gray-300">
              Analyzes 10-K, 10-Q, 8-K and other SEC filings to identify accounting red flags and financial concerns.
            </p>
          </CardContent>
        </Card>
        <Card className="card-glow border">
          <CardContent className="p-4">
            <Badge className="mb-2">REGULATORY</Badge>
            <p className="text-sm text-gray-300">
              Checks regulatory status, violations, investigations, and compliance history across agencies.
            </p>
          </CardContent>
        </Card>
        <Card className="card-glow border">
          <CardContent className="p-4">
            <Badge className="mb-2">FOLLOW-UPS</Badge>
            <p className="text-sm text-gray-300">
              Generates prioritized follow-up checks based on identified risks to complete due diligence.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}