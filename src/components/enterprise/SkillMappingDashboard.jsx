import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, TrendingUp, AlertCircle, Users, Award } from 'lucide-react';

export default function SkillMappingDashboard({ organizationId }) {
  const [loading, setLoading] = useState(false);

  const { data: analysis, refetch } = useQuery({
    queryKey: ['orgSkillAnalysis', organizationId],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await base44.functions.invoke('analyzeOrganizationSkills', {
          organizationId
        });
        return response.data;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!organizationId
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Analyzing organization skills...</p>
      </div>
    );
  }

  if (!analysis?.success) return null;

  const { skillInventory, departmentSkills, criticalGaps, recommendations } = analysis.analysis;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-900/80 to-purple-800/80 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Skills</p>
                <p className="text-3xl font-bold text-white">{skillInventory?.length || 0}</p>
              </div>
              <Award className="w-12 h-12 text-purple-300 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/80 to-orange-800/80 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Departments</p>
                <p className="text-3xl font-bold text-white">{departmentSkills?.length || 0}</p>
              </div>
              <Users className="w-12 h-12 text-orange-300 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/80 to-red-800/80 border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Critical Gaps</p>
                <p className="text-3xl font-bold text-white">{criticalGaps?.length || 0}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-300 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/80 to-green-800/80 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Avg Health</p>
                <p className="text-3xl font-bold text-white">
                  {departmentSkills ? 
                    Math.round(departmentSkills.reduce((sum, d) => sum + (d.healthScore || 0), 0) / departmentSkills.length) 
                    : 0}%
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-300 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-purple-500/30">
          <TabsTrigger value="departments">Department Health</TabsTrigger>
          <TabsTrigger value="skills">Skill Inventory</TabsTrigger>
          <TabsTrigger value="gaps">Critical Gaps</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Department Health */}
        <TabsContent value="departments" className="space-y-4">
          {departmentSkills?.map((dept, idx) => (
            <Card key={idx} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white">{dept.department}</CardTitle>
                  <Badge className={`${
                    dept.healthScore >= 80 ? 'bg-green-500' :
                    dept.healthScore >= 60 ? 'bg-orange-500' :
                    'bg-red-500'
                  } text-white`}>
                    {dept.healthScore}% Health
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{dept.employeeCount} employees</span>
                  <span className="text-gray-400">{dept.skillCoverage}% skill coverage</span>
                </div>
                <Progress value={dept.skillCoverage} className="h-2" />

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Top Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {dept.topSkills?.slice(0, 5).map((skill, i) => (
                        <Badge key={i} className="bg-purple-900/50 text-purple-300 border border-purple-500/50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Critical Gaps</p>
                    <div className="flex flex-wrap gap-2">
                      {dept.criticalGaps?.slice(0, 5).map((gap, i) => (
                        <Badge key={i} className="bg-red-900/50 text-red-300 border border-red-500/50">
                          {gap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Skill Inventory */}
        <TabsContent value="skills" className="space-y-4">
          {skillInventory?.slice(0, 20).map((skill, idx) => (
            <Card key={idx} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">{skill.skill}</h4>
                  <Badge className="bg-purple-600 text-white">
                    {skill.totalEmployees} employees
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-2 bg-slate-800/50 rounded">
                    <p className="text-gray-500">Beginner</p>
                    <p className="text-white font-bold">{skill.proficiencyLevels?.beginner || 0}</p>
                  </div>
                  <div className="text-center p-2 bg-slate-800/50 rounded">
                    <p className="text-gray-500">Intermediate</p>
                    <p className="text-white font-bold">{skill.proficiencyLevels?.intermediate || 0}</p>
                  </div>
                  <div className="text-center p-2 bg-slate-800/50 rounded">
                    <p className="text-gray-500">Advanced</p>
                    <p className="text-white font-bold">{skill.proficiencyLevels?.advanced || 0}</p>
                  </div>
                  <div className="text-center p-2 bg-slate-800/50 rounded">
                    <p className="text-gray-500">Expert</p>
                    <p className="text-white font-bold">{skill.proficiencyLevels?.expert || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Critical Gaps */}
        <TabsContent value="gaps" className="space-y-4">
          {criticalGaps?.map((gap, idx) => (
            <Card key={idx} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-400 mt-1" />
                    <div>
                      <h4 className="text-xl font-bold text-white">{gap.skill}</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Affects: {gap.affectedDepartments?.join(', ')}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${
                    gap.urgency === 'high' ? 'bg-red-500' :
                    gap.urgency === 'medium' ? 'bg-orange-500' :
                    'bg-yellow-500'
                  } text-white`}>
                    {gap.urgency} urgency
                  </Badge>
                </div>
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Recommended Action:</p>
                  <p className="text-white">{gap.recommendedAction}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations?.map((rec, idx) => (
            <Card key={idx} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Target className="w-6 h-6 text-purple-400 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${
                        rec.priority === 'high' ? 'bg-red-500' :
                        rec.priority === 'medium' ? 'bg-orange-500' :
                        'bg-blue-500'
                      } text-white`}>
                        {rec.priority} priority
                      </Badge>
                    </div>
                    <p className="text-white font-semibold mb-2">{rec.recommendation}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Expected Impact</p>
                        <p className="text-gray-300">{rec.expectedImpact}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Estimated Cost</p>
                        <p className="text-gray-300">{rec.estimatedCost}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}