import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, DollarSign, Loader2, Target } from "lucide-react";

export default function EnterpriseSkillGapAnalysis({ organizationId, teamId }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSkillGaps = async () => {
    setIsAnalyzing(true);
    try {
      const result = await base44.functions.invoke('analyzeEnterpriseSkillGaps', {
        organization_id: organizationId,
        team_id: teamId
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error("Failed to analyze skill gaps:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-red-400" />
          Enterprise Skill Gap Analysis
        </CardTitle>
        <Button onClick={analyzeSkillGaps} disabled={isAnalyzing} className="btn-primary">
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Skill Gaps'
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-red-400/30 mx-auto mb-4" />
            <p className="text-gray-400">Comprehensive skill gap analysis across your organization</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Critical Gaps</div>
                <div className="text-3xl font-bold text-red-400">{analysis.critical_gaps_count}</div>
              </div>
              <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Employees Affected</div>
                <div className="text-3xl font-bold text-yellow-400">{analysis.affected_employees}</div>
              </div>
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Training Hours Needed</div>
                <div className="text-3xl font-bold text-green-400">{analysis.training_hours_needed}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-red-300 mb-3">Priority Skill Gaps</h3>
              <div className="space-y-3">
                {analysis.skill_gaps?.map((gap, idx) => (
                  <div key={idx} className="p-4 bg-[#0f0618]/50 border border-red-500/20 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white mb-1">{gap.skill}</h4>
                        <p className="text-sm text-gray-400">{gap.affected_employees} employees affected</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        gap.priority === 'critical' ? 'bg-red-500/30 text-red-300' :
                        gap.priority === 'high' ? 'bg-orange-500/30 text-orange-300' :
                        gap.priority === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                        'bg-blue-500/30 text-blue-300'
                      }`}>
                        {gap.priority}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Current: {gap.current_level}/10</span>
                        <span>Target: {gap.target_level}/10</span>
                        <span>Gap: {gap.gap_size}</span>
                      </div>
                      <Progress value={(gap.current_level / gap.target_level) * 100} className="h-2" />
                    </div>
                    {gap.recommended_courses?.length > 0 && (
                      <div className="text-xs text-cyan-400">
                        Recommended: {gap.recommended_courses.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {analysis.roi_projections && (
              <div className="p-4 bg-gradient-to-r from-green-900/20 to-cyan-900/20 border border-green-500/30 rounded-lg">
                <h3 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  ROI Projections
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Productivity Gain</div>
                    <div className="text-xl font-bold text-green-400">
                      +{analysis.roi_projections.productivity_gain}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Cost Savings</div>
                    <div className="text-xl font-bold text-cyan-400">
                      ${analysis.roi_projections.cost_savings?.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Payback Period</div>
                    <div className="text-xl font-bold text-purple-400">
                      {analysis.roi_projections.payback_months} months
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}