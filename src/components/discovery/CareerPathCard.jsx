import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, Briefcase, TrendingUp, DollarSign, Users, ArrowRight } from 'lucide-react';

export default function CareerPathCard({ careerPath }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="card-glow overflow-hidden border-2 border-green-500/30">
      <CardHeader className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-b border-green-500/30">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-green-400" />
              <CardTitle className="text-white">{careerPath.title}</CardTitle>
            </div>
            <p className="text-sm text-gray-300 mb-3">{careerPath.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-600">
                {careerPath.timeline}
              </Badge>
              <Badge variant="outline">
                <TrendingUp className="w-3 h-3 mr-1" />
                {careerPath.demand_level} demand
              </Badge>
              {careerPath.salary_range && (
                <Badge className="bg-emerald-600">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {careerPath.salary_range}
                </Badge>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="text-white"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Growth Rate</span>
            </div>
            <p className="text-lg font-bold text-white">{careerPath.growth_rate}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Job Openings</span>
            </div>
            <p className="text-lg font-bold text-white">{careerPath.job_openings}</p>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="space-y-4 mt-4 pt-4 border-t border-gray-700">
            {/* Required Skills */}
            <div>
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                Required Skills
              </h4>
              <div className="space-y-2">
                {careerPath.required_skills?.map((skill, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-800/30 rounded p-2">
                    <span className="text-sm text-gray-300">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={skill.importance} className="w-20 h-2" />
                      <span className="text-xs text-gray-400 w-8">{skill.importance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Progression */}
            <div>
              <h4 className="font-semibold text-white mb-3">Career Progression</h4>
              <div className="space-y-3">
                {careerPath.progression_stages?.map((stage, idx) => (
                  <div key={idx} className="relative">
                    {idx < careerPath.progression_stages.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-green-500/30" />
                    )}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-white mb-1">{stage.role}</h5>
                        <p className="text-xs text-gray-400 mb-1">{stage.experience_required}</p>
                        <Badge variant="outline" className="text-xs">
                          {stage.typical_salary}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Learning Journey */}
            {careerPath.recommended_journey_id && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <h4 className="font-semibold text-white mb-2">Recommended Learning Path</h4>
                <p className="text-sm text-gray-300 mb-2">
                  We've identified a learning journey that aligns perfectly with this career path.
                </p>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  View Learning Journey
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Industry Insights */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <h4 className="font-semibold text-white mb-2 text-sm">Industry Insights</h4>
              <p className="text-sm text-gray-300">{careerPath.industry_insights}</p>
            </div>
          </div>
        )}

        {!expanded && (
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={() => setExpanded(true)}
          >
            View Career Path Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}