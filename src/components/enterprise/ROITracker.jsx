import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, Award } from 'lucide-react';

export default function ROITracker({ organizationId }) {
  const { data: roiData, isLoading } = useQuery({
    queryKey: ['learningROI', organizationId],
    queryFn: async () => {
      const response = await base44.functions.invoke('calculateLearningROI', {
        organizationId,
        timeframeDays: 90
      });
      return response.data;
    },
    enabled: !!organizationId
  });

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Calculating ROI...</div>;
  }

  if (!roiData?.success) return null;

  const { roi, metrics } = roiData;

  return (
    <div className="space-y-6">
      {/* ROI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-900/80 to-green-800/80 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total ROI</p>
                <p className="text-4xl font-bold text-white">{roi.overallROI?.roiPercentage?.toFixed(0)}%</p>
                <p className="text-xs text-gray-400 mt-1">
                  ${(roi.overallROI?.totalReturns || 0).toLocaleString()} returns
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-300 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/80 to-purple-800/80 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Cost Savings</p>
                <p className="text-4xl font-bold text-white">
                  ${(roi.costSavings?.total || 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-300 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/80 to-orange-800/80 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Payback Period</p>
                <p className="text-4xl font-bold text-white">
                  {roi.overallROI?.paybackPeriodMonths || 0}m
                </p>
              </div>
              <Award className="w-12 h-12 text-orange-300 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost Savings */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-xl text-white">Cost Savings Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-gray-300">External Training Reduction</span>
              <span className="text-white font-bold">
                ${(roi.costSavings?.externalTrainingReduction || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-gray-300">Faster Onboarding</span>
              <span className="text-white font-bold">
                ${(roi.costSavings?.fasterOnboarding || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-gray-300">Reduced Consulting</span>
              <span className="text-white font-bold">
                ${(roi.costSavings?.reducedConsultingFees || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Productivity Gains */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-xl text-white">Productivity Gains</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-gray-300">Efficiency Improvement</span>
              <span className="text-white font-bold">
                ${(roi.productivityGains?.efficiencyImprovement || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-gray-300">Quality Improvements</span>
              <span className="text-white font-bold">
                ${(roi.productivityGains?.qualityImprovements || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
              <span className="text-gray-300">Time to Market</span>
              <span className="text-white font-bold">
                ${(roi.productivityGains?.timeToMarket || 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Retention Benefits */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-xl text-white">Retention & Innovation Benefits</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-purple-400 font-semibold">Retention</h4>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-slate-800/30 rounded">
                <span className="text-gray-400 text-sm">Reduced Turnover</span>
                <span className="text-white">${(roi.retentionBenefits?.reducedTurnover || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-800/30 rounded">
                <span className="text-gray-400 text-sm">Recruitment Savings</span>
                <span className="text-white">${(roi.retentionBenefits?.recruitmentCostsSaved || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-orange-400 font-semibold">Innovation</h4>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-slate-800/30 rounded">
                <span className="text-gray-400 text-sm">New Capabilities</span>
                <span className="text-white">${(roi.innovationMetrics?.newCapabilities || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-800/30 rounded">
                <span className="text-gray-400 text-sm">Process Improvements</span>
                <span className="text-white">${(roi.innovationMetrics?.processImprovements || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projections */}
      <Card className="bg-gradient-to-br from-purple-900/90 to-orange-900/90 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-xl text-white">Future Projections</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-slate-900/50 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">6-Month ROI</p>
            <p className="text-3xl font-bold text-purple-400">
              {roi.projections?.sixMonthROI?.toFixed(0)}%
            </p>
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">12-Month ROI</p>
            <p className="text-3xl font-bold text-orange-400">
              {roi.projections?.twelveMonthROI?.toFixed(0)}%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}