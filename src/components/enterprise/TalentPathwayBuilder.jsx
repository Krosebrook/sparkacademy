import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, Award, Briefcase, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TalentPathwayBuilder({ employeeEmail, currentRole }) {
  const [targetRole, setTargetRole] = useState('');
  const [timeframe, setTimeframe] = useState(12);
  const [pathway, setPathway] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateTalentPathway', {
        employeeEmail,
        targetRole,
        timeframeMonths: timeframe,
        organizationGoals: 'Develop AI capabilities and digital transformation'
      });

      if (response.data.success) {
        setPathway(response.data.talentPathway);
      }
    } catch (error) {
      console.error('Error generating pathway:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-400" />
            AI Talent Development Pathway
          </CardTitle>
          <p className="text-gray-400">Generate personalized career advancement roadmap</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white font-semibold text-sm mb-2 block">Current Role</label>
              <Input value={currentRole} disabled className="bg-slate-800 border-slate-700 text-gray-400" />
            </div>
            <div>
              <label className="text-white font-semibold text-sm mb-2 block">Target Role</label>
              <Input 
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Engineer, Team Lead"
                className="bg-slate-800 border-slate-700 text-white" 
              />
            </div>
          </div>

          <div>
            <label className="text-white font-semibold text-sm mb-2 block">
              Timeframe: {timeframe} months
            </label>
            <input
              type="range"
              min="6"
              max="36"
              step="3"
              value={timeframe}
              onChange={(e) => setTimeframe(Number(e.target.value))}
              className="w-full accent-purple-600"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!targetRole || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-bold py-6"
          >
            {loading ? 'Generating Pathway...' : 'Generate AI-Powered Pathway'}
          </Button>
        </CardContent>
      </Card>

      {/* Pathway Results */}
      {pathway && (
        <div className="space-y-6">
          {/* Readiness Score */}
          <Card className="bg-gradient-to-br from-purple-900/80 to-orange-900/80 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Readiness Score</p>
                  <p className="text-5xl font-bold text-white">{pathway.readinessScore}%</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Success Probability: {pathway.estimatedSuccessProbability}%
                  </p>
                </div>
                <Award className="w-20 h-20 text-purple-300 opacity-30" />
              </div>
            </CardContent>
          </Card>

          {/* Quarterly Pathway */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Development Roadmap</h3>
            {pathway.pathway?.map((quarter, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                          {idx + 1}
                        </div>
                        {quarter.quarter}
                      </CardTitle>
                      <Badge className="bg-purple-900/50 text-purple-300">{quarter.focus}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Skills to Acquire */}
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Skills to Acquire</p>
                      <div className="flex flex-wrap gap-2">
                        {quarter.skillsToAcquire?.map((skill, i) => (
                          <Badge key={i} className="bg-purple-900/50 text-purple-300 border border-purple-500/50">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Learning Activities */}
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Learning Activities</p>
                      <div className="space-y-2">
                        {quarter.learningActivities?.map((activity, i) => (
                          <div key={i} className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                            <div>
                              <p className="text-white font-semibold">{activity.title}</p>
                              <p className="text-xs text-gray-500">{activity.type}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={`${
                                activity.priority === 'high' ? 'bg-red-500' :
                                activity.priority === 'medium' ? 'bg-orange-500' :
                                'bg-blue-500'
                              } text-white`}>
                                {activity.priority}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">{activity.duration}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Milestone */}
                    <div className="p-3 bg-gradient-to-r from-purple-900/30 to-orange-900/30 rounded-lg border border-purple-500/30">
                      <p className="text-sm text-purple-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <strong>Milestone:</strong> {quarter.milestone}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* KPIs */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-xl text-white">Key Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pathway.kpis?.map((kpi, idx) => (
                  <div key={idx} className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">{kpi.metric}</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Baseline: {kpi.baseline}</span>
                      <span className="text-purple-400">Target: {kpi.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}