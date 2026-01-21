import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, Users, TrendingUp, AlertTriangle, Target, Award, 
  BarChart3, Activity, Zap, ArrowUpRight, ArrowDownRight, Brain 
} from 'lucide-react';
import AIClientOnboarding from '@/components/b2b/AIClientOnboarding';

export default function B2BClientDashboard() {
  const [selectedOrg, setSelectedOrg] = useState('all');

  const { data: organizations } = useQuery({
    queryKey: ['client-organizations'],
    queryFn: async () => base44.entities.ClientOrganization.list()
  });

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['b2b-analytics', selectedOrg],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('analyzeB2BClientMetrics', {
        organization_id: selectedOrg === 'all' ? null : selectedOrg,
        include_benchmarks: true
      });
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading B2B analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-8 h-8" />
                <h1 className="text-3xl font-bold">INTInc B2B Client Dashboard</h1>
              </div>
              <p className="text-blue-100">AI Training Analytics & Performance Insights</p>
            </div>
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="w-64 bg-white text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations?.map(org => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.organization_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {analytics?.organization_summary && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                  {analytics.organization_summary.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{analytics.organization_summary.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge>{analytics.organization_summary.type}</Badge>
                    <Badge className="bg-purple-100 text-purple-700">
                      {analytics.organization_summary.subscription_tier}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {analytics.organization_summary.total_employees} employees
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <Badge className={`${
                  analytics?.adoption_metrics?.adoption_rate > 60 ? 'bg-green-100 text-green-700' :
                  analytics?.adoption_metrics?.adoption_rate > 30 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {Math.round(analytics?.adoption_metrics?.adoption_rate || 0)}%
                </Badge>
              </div>
              <div className="text-2xl font-bold">{analytics?.adoption_metrics?.enrolled_employees || 0}</div>
              <div className="text-xs text-gray-500">Platform Adoption Rate</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-green-500" />
                <Badge className="bg-green-100 text-green-700">
                  {analytics?.adoption_metrics?.active_learners_30_days || 0}
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {Math.round(analytics?.engagement_metrics?.avg_learning_hours_per_employee || 0)}h
              </div>
              <div className="text-xs text-gray-500">Avg Learning Hours</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-purple-500" />
                <Badge className="bg-purple-100 text-purple-700">
                  {analytics?.ai_literacy?.avg_score || 0}
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {analytics?.engagement_metrics?.total_courses_completed || 0}
              </div>
              <div className="text-xs text-gray-500">AI Literacy Score</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-orange-500" />
                <Badge className="bg-orange-100 text-orange-700">
                  {analytics?.engagement_metrics?.active_pathways || 0}
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {analytics?.skill_gaps_analysis?.total_unique_gaps || 0}
              </div>
              <div className="text-xs text-gray-500">Skill Gaps Identified</div>
            </CardContent>
          </Card>
        </div>

        {analytics?.industry_benchmarks && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Industry Benchmarks: {analytics.industry_benchmarks.industry_type}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">AI Literacy</span>
                    {analytics.industry_benchmarks.organization_percentile.literacy >= 70 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.industry_benchmarks.organization_percentile.literacy}th
                  </div>
                  <div className="text-xs text-gray-500">percentile</div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Adoption Rate</span>
                    {analytics.industry_benchmarks.organization_percentile.adoption >= 70 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.industry_benchmarks.organization_percentile.adoption}th
                  </div>
                  <div className="text-xs text-gray-500">percentile</div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Engagement</span>
                    {analytics.industry_benchmarks.organization_percentile.engagement >= 70 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.industry_benchmarks.organization_percentile.engagement}th
                  </div>
                  <div className="text-xs text-gray-500">percentile</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="departments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
            <TabsTrigger value="onboarding">
              <Brain className="w-4 h-4 mr-2" />
              AI Onboarding
            </TabsTrigger>
            <TabsTrigger value="departments">Department Breakdown</TabsTrigger>
            <TabsTrigger value="skillgaps">Skill Gaps</TabsTrigger>
            <TabsTrigger value="interventions">Recommended Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="onboarding">
            {selectedOrg !== 'all' && organizations?.find(o => o.id === selectedOrg) ? (
              <AIClientOnboarding organization={organizations.find(o => o.id === selectedOrg)} />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  Select a specific organization to access AI-powered onboarding
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics?.department_breakdown || {}).map(([dept, stats]) => (
                    <div key={dept} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold capitalize">{dept}</h4>
                        <div className="flex items-center gap-2">
                          <Badge>{stats.employee_count} employees</Badge>
                          <Badge className="bg-blue-100 text-blue-700">
                            {Math.round(stats.adoption_rate)}% adoption
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-blue-50 rounded p-2">
                          <div className="text-xs text-gray-600">Active (30d)</div>
                          <div className="text-lg font-bold text-blue-600">{stats.active_count}</div>
                        </div>
                        <div className="bg-purple-50 rounded p-2">
                          <div className="text-xs text-gray-600">Engagement</div>
                          <div className="text-lg font-bold text-purple-600">
                            {Math.round(stats.avg_engagement_score)}
                          </div>
                        </div>
                        <div className="bg-orange-50 rounded p-2">
                          <div className="text-xs text-gray-600">Skill Gaps</div>
                          <div className="text-lg font-bold text-orange-600">
                            {Object.keys(stats.skill_gaps).length}
                          </div>
                        </div>
                      </div>

                      {stats.top_skill_gaps?.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Top Skill Gaps:</div>
                          <div className="flex flex-wrap gap-1">
                            {stats.top_skill_gaps.map((gap, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {gap.skill} ({gap.employee_count})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skillgaps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Organization-Wide Skill Gaps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.skill_gaps_analysis?.top_gaps?.map((gap, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg p-4 border ${
                        gap.severity === 'high' ? 'bg-red-50 border-red-200' :
                        gap.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{gap.skill}</h4>
                            <Badge className={
                              gap.severity === 'high' ? 'bg-red-100 text-red-700' :
                              gap.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }>
                              {gap.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {gap.affected_employees} employees ({Math.round(gap.percentage)}%) affected
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interventions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Predictive Training Interventions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.predictive_interventions?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No critical interventions needed at this time
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analytics?.predictive_interventions?.map((intervention, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg p-4 border ${
                          intervention.priority === 'high' ? 'bg-red-50 border-red-200' :
                          'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                            intervention.priority === 'high' ? 'text-red-500' : 'text-yellow-500'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{intervention.title}</h4>
                              <Badge className={
                                intervention.priority === 'high' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }>
                                {intervention.priority}
                              </Badge>
                              <Badge variant="outline">{intervention.type}</Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{intervention.description}</p>
                            <div className="bg-white rounded p-3 mb-2">
                              <div className="text-xs font-semibold text-gray-600 mb-1">Recommended Action:</div>
                              <p className="text-sm text-gray-800">{intervention.recommended_action}</p>
                            </div>
                            <div className="text-xs text-gray-600">
                              <TrendingUp className="w-3 h-3 inline mr-1" />
                              {intervention.estimated_impact}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}