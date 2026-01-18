import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, Clock, Target, TrendingUp, Award, CheckCircle2 } from 'lucide-react';

export default function LearningJourneyCard({ journey }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="card-glow overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/30">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white mb-2">{journey.title}</CardTitle>
            <p className="text-sm text-gray-300 mb-3">{journey.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-purple-600">
                <Clock className="w-3 h-3 mr-1" />
                {journey.estimated_weeks} weeks
              </Badge>
              <Badge variant="outline" className="text-xs">
                {journey.difficulty_progression}
              </Badge>
              <Badge className="bg-green-600">
                {journey.courses?.length} courses
              </Badge>
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
        {/* Quick Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-white text-sm">Target Outcome</span>
            </div>
            <p className="text-sm text-gray-300">{journey.target_outcome}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="font-semibold text-white text-sm">Career Boost</span>
            </div>
            <p className="text-sm text-gray-300">{journey.career_boost}</p>
          </div>
        </div>

        {/* Industry Relevance */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-white text-sm">Industry Relevance</span>
          </div>
          <p className="text-sm text-gray-300">{journey.industry_relevance}</p>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-4 mt-4 pt-4 border-t border-gray-700">
            {/* Course Progression */}
            <div>
              <h4 className="font-semibold text-white mb-3">Learning Path</h4>
              <div className="space-y-3">
                {journey.courses?.map((course, idx) => (
                  <div key={idx} className="relative">
                    {idx < journey.courses.length - 1 && (
                      <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-purple-500/30" />
                    )}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                        {course.order}
                      </div>
                      <div className="flex-1 bg-gray-800/50 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-white">{course.title}</h5>
                          <Badge variant="outline" className="text-xs">
                            {course.duration_weeks}w
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {course.skills_gained?.map((skill, i) => (
                            <Badge key={i} className="text-xs bg-purple-600/20 text-purple-300">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            {journey.milestones?.length > 0 && (
              <div>
                <h4 className="font-semibold text-white mb-3">Achievement Milestones</h4>
                <div className="space-y-2">
                  {journey.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-gray-800/30 rounded-lg p-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-white">{milestone.checkpoint}: </span>
                        <span className="text-sm text-gray-300">{milestone.achievement}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Project */}
            {journey.final_project && (
              <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-lg p-3">
                <h4 className="font-semibold text-white mb-2">Capstone Project</h4>
                <p className="text-sm text-gray-300">{journey.final_project}</p>
              </div>
            )}

            {/* Action Button */}
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Start This Learning Journey
            </Button>
          </div>
        )}

        {!expanded && (
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={() => setExpanded(true)}
          >
            View Full Journey Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}