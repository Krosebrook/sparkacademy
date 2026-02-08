import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Clock, TrendingUp, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PersonalizedRecommendations() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data, isLoading } = useQuery({
    queryKey: ['personalizedRecommendations', user?.email],
    queryFn: async () => {
      const profile = await base44.entities.EmployeeProfile.filter({ employee_email: user.email });
      const pathways = await base44.entities.SkillsPathway.filter({ employee_id: user.email });
      
      return base44.functions.invoke('aiCourseDiscovery', {
        query: `Recommend courses for my learning goals: ${profile[0]?.career_goals?.join(', ')}`,
        filters: {},
        userContext: {
          profile: profile[0],
          pathways
        }
      });
    },
    enabled: !!user?.email
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse h-32 bg-slate-100" />
        ))}
      </div>
    );
  }

  const recommendations = data?.data?.results || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Recommended For You</h2>
        <Badge className="bg-purple-600">AI Personalized</Badge>
      </div>

      {data?.data?.insights && (
        <Card className="bg-gradient-to-r from-purple-900 to-blue-900 border-purple-500/30">
          <CardContent className="p-4">
            <p className="text-white text-sm">{data.data.insights}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {recommendations.map((rec, idx) => {
          const course = rec.course;
          if (!course) return null;

          return (
            <Card key={idx} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                      <Badge className="bg-green-600">
                        {Math.round(rec.relevance_score * 100)}% Match
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-600 mb-3">{course.description}</p>

                    <div className="flex items-center gap-4 mb-3">
                      <Badge className="bg-blue-100 text-blue-700">
                        {course.level}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-700">
                        {course.category}
                      </Badge>
                      <span className="text-sm text-slate-600 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.estimated_duration} hours
                      </span>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-purple-900">
                        <strong>Why recommended:</strong> {rec.match_reason}
                      </p>
                    </div>

                    {rec.skill_gaps_addressed?.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-green-900 font-semibold mb-1 flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Addresses your skill gaps:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {rec.skill_gaps_addressed.map((gap, i) => (
                            <Badge key={i} className="bg-green-600 text-xs">
                              {gap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {rec.learning_path_alignment && (
                      <p className="text-sm text-blue-600 italic">
                        {rec.learning_path_alignment}
                      </p>
                    )}
                  </div>

                  <Link to={createPageUrl('CourseOverview') + `?id=${course.id}`}>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      View Course
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}