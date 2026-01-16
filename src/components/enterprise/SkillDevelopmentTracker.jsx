import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Award } from "lucide-react";

export default function SkillDevelopmentTracker({ organizationId, teamId }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSkills = async () => {
    setIsAnalyzing(true);
    try {
      const result = await base44.functions.invoke('analyzeTeamSkills', {
        organization_id: organizationId,
        team_id: teamId
      });
      setAnalysis(result.data);
    } catch (error) {
      console.error('Skill analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-400" />
          Skill Development Analytics
        </CardTitle>
        <Button onClick={analyzeSkills} disabled={isAnalyzing} className="btn-primary">
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Analyze Skills
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
            <p className="text-gray-400">AI will analyze skill development across your organization</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {analysis.top_skills?.map((skill, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-purple-500/20 text-purple-300">#{idx + 1}</Badge>
                    <span className="text-2xl font-bold text-purple-400">{skill.proficiency}%</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{skill.name}</h3>
                  <p className="text-xs text-gray-400">{skill.learner_count} learners</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-semibold text-cyan-300 mb-3">Skill Gaps</h3>
              <div className="space-y-2">
                {analysis.skill_gaps?.map((gap, idx) => (
                  <div key={idx} className="p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                    <div className="font-medium text-white mb-1">{gap.skill}</div>
                    <p className="text-sm text-gray-400">{gap.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}