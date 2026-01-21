import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, BookOpen, Target, Zap, ExternalLink } from 'lucide-react';

export default function AdaptiveLearningPanel({ courseId }) {
  const [showResources, setShowResources] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: skillsPathway } = useQuery({
    queryKey: ['skills-pathway', user?.email],
    queryFn: async () => {
      const pathways = await base44.entities.SkillsPathway.filter({
        employee_id: user.email,
        status: 'active'
      });
      return pathways[0];
    },
    enabled: !!user
  });

  const { data: recommendations, isLoading: loadingRecs, refetch } = useQuery({
    queryKey: ['learning-resources', courseId],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('recommendLearningResources', {
        current_topic: courseId,
        performance_data: { recent_scores: [75, 82, 78] }
      });
      return data;
    },
    enabled: showResources
  });

  const currentStage = skillsPathway?.stages?.find(s => 
    s.stage_number === Math.ceil((skillsPathway.progress_percentage || 0) / 20)
  );

  return (
    <div className="space-y-4">
      {skillsPathway && (
        <Card className="card-glow border-2 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Your Learning Pathway
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">{skillsPathway.pathway_name}</span>
                <Badge className="bg-purple-500/20 text-purple-300">
                  {skillsPathway.progress_percentage || 0}% Complete
                </Badge>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${skillsPathway.progress_percentage || 0}%` }}
                />
              </div>
            </div>

            {currentStage && (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Current Stage:</div>
                <div className="font-semibold text-white mb-2">{currentStage.stage_title}</div>
                <div className="text-xs text-gray-300">
                  <div className="mb-1">Key Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {currentStage.key_skills?.slice(0, 3).map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Personalized Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!showResources ? (
            <Button
              onClick={() => {
                setShowResources(true);
                refetch();
              }}
              disabled={loadingRecs}
              className="btn-primary w-full"
            >
              <Zap className="w-4 h-4 mr-2" />
              Get AI-Recommended Resources
            </Button>
          ) : (
            <>
              {recommendations?.priority_focus && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                  <div className="text-xs text-yellow-400 font-semibold mb-1">Priority Focus:</div>
                  <div className="text-sm text-yellow-200">{recommendations.priority_focus}</div>
                </div>
              )}

              <div className="space-y-2">
                {recommendations?.recommendations?.map((resource, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm mb-1">{resource.title}</div>
                        <p className="text-xs text-gray-300">{resource.description}</p>
                      </div>
                      <Badge className="ml-2">{resource.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Badge variant="outline" className="text-xs">{resource.difficulty}</Badge>
                        <span>{resource.estimated_time_minutes}min</span>
                      </div>
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-2 italic">
                      Why: {resource.relevance_reason}
                    </div>
                  </div>
                ))}
              </div>

              {recommendations?.next_milestone && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                  <div className="text-xs text-green-400 font-semibold mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Next Milestone:
                  </div>
                  <div className="text-sm text-green-200">{recommendations.next_milestone}</div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}