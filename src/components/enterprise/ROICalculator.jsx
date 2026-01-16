import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp, Loader2 } from "lucide-react";

export default function ROICalculator({ organizationId }) {
  const [metrics, setMetrics] = useState({
    training_cost: '',
    employee_count: '',
    avg_salary: '',
    project_success_rate_before: '',
    project_success_rate_after: ''
  });
  const [roi, setRoi] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateROI = async () => {
    setIsCalculating(true);
    try {
      const result = await base44.functions.invoke('calculateTrainingROI', {
        organization_id: organizationId,
        ...metrics
      });
      setRoi(result.data);
    } catch (error) {
      console.error("Failed to calculate ROI:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleChange = (field, value) => {
    setMetrics({ ...metrics, [field]: value });
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-400" />
          Training ROI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Total Training Cost ($)</label>
            <Input
              type="number"
              value={metrics.training_cost}
              onChange={(e) => handleChange('training_cost', e.target.value)}
              className="bg-[#1a0a2e]"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Number of Employees</label>
            <Input
              type="number"
              value={metrics.employee_count}
              onChange={(e) => handleChange('employee_count', e.target.value)}
              className="bg-[#1a0a2e]"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Avg Employee Salary ($)</label>
            <Input
              type="number"
              value={metrics.avg_salary}
              onChange={(e) => handleChange('avg_salary', e.target.value)}
              className="bg-[#1a0a2e]"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Project Success Rate Before (%)</label>
            <Input
              type="number"
              value={metrics.project_success_rate_before}
              onChange={(e) => handleChange('project_success_rate_before', e.target.value)}
              max={100}
              className="bg-[#1a0a2e]"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Project Success Rate After (%)</label>
            <Input
              type="number"
              value={metrics.project_success_rate_after}
              onChange={(e) => handleChange('project_success_rate_after', e.target.value)}
              max={100}
              className="bg-[#1a0a2e]"
            />
          </div>
        </div>

        <Button
          onClick={calculateROI}
          disabled={isCalculating || Object.values(metrics).some(v => !v)}
          className="btn-primary w-full"
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            'Calculate ROI'
          )}
        </Button>

        {roi && (
          <div className="space-y-4 mt-6">
            <div className="p-4 bg-gradient-to-r from-green-900/20 to-cyan-900/20 border border-green-500/30 rounded-lg">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-400 mb-1">Total ROI</div>
                <div className="text-4xl font-bold text-green-400">{roi.roi_percentage}%</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-400">Net Benefit</div>
                  <div className="text-xl font-bold text-cyan-400">
                    ${roi.net_benefit?.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Payback Period</div>
                  <div className="text-xl font-bold text-purple-400">
                    {roi.payback_months} months
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-cyan-300 mb-3">Impact Breakdown</h3>
              <div className="space-y-2 text-sm">
                {roi.impact_areas?.map((area, idx) => (
                  <div key={idx} className="p-3 bg-[#0f0618]/50 rounded-lg flex items-center justify-between">
                    <span className="text-gray-300">{area.category}</span>
                    <span className="font-bold text-green-400">${area.value?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <h4 className="font-semibold text-blue-300 mb-2">Summary</h4>
              <p className="text-sm text-gray-300">{roi.summary}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}