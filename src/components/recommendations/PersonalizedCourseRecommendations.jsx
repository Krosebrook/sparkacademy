import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, TrendingUp, Target, Zap, ArrowRight, CheckCircle2, Clock, Loader2 } from 'lucide-react';

export default function PersonalizedCourseRecommendations({ context = 'dashboard', currentCourseId = null }) {
  const [loading, setLoading] = useState(false);

  const { data: recommendations, refetch } = useQuery({
    queryKey: ['recommendations', context, currentCourseId],
    queryFn: async () => {
      setLoading(true);
      try {
        const { data } = await base44.functions.invoke('generatePersonalizedRecommendations', {
          context: currentCourseId ? `Viewing course: ${currentCourseId}` : context
        });
        return data;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 5 * 60 * 1000
  });

  if (loading || !recommendations) {
    return (
      <Card className="card-glow">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
          <p className="text-gray-400">Analyzing your learning journey...</p>
        </CardContent>
      </Card>
    );
  }

  const hasRecommendations = (
    recommendations.next_in_path?.length > 0 ||
    recommendations.advanced_topics?.length > 0 ||
    recommendations.skill_diversification?.length > 0
  );

  if (!hasRecommendations) {
    return (
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-400">{recommendations.personalized_note || 'Complete more courses to get personalized recommendations!'}</p>
        </CardContent>
      </Card>
    );
  }

  const RecommendationCard = ({ rec }) => (
    <Link to={createPageUrl('CourseOverview') + `?id=${rec.course_id}`}>
      <div className="bg-[#1a0a2e] border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-all group cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-white text-sm group-hover:text-purple-400 transition-colors">
            {rec.title}
          </h4>
          <Badge className="bg-green-500/20 text-green-300 text-xs">
            {rec.confidence_score}% match
          </Badge>
        </div>
        
        <p className="text-sm text-gray-400 mb-3">{rec.reason}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {rec.estimated_completion_weeks}w
            </div>
            {rec.prerequisites_met && (
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                Ready
              </div>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );

  return (
    <Card className="card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Recommended for You
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
            <Sparkles className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </div>
        {recommendations.personalized_note && (
          <p className="text-sm text-gray-400 mt-2">{recommendations.personalized_note}</p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="next" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#1a0a2e] border border-gray-700">
            <TabsTrigger value="next" className="data-[state=active]:bg-purple-500/20">
              <Target className="w-3 h-3 mr-1" />
              Next Steps
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-purple-500/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="diversify" className="data-[state=active]:bg-purple-500/20">
              <Zap className="w-3 h-3 mr-1" />
              Diversify
            </TabsTrigger>
          </TabsList>

          <TabsContent value="next" className="space-y-3 mt-4">
            {recommendations.next_in_path?.length > 0 ? (
              <>
                <div className="text-sm text-gray-400 mb-3">
                  Continue your learning journey with these natural next steps
                </div>
                {recommendations.next_in_path.map((rec, idx) => (
                  <RecommendationCard key={idx} rec={rec} />
                ))}
              </>
            ) : (
              <p className="text-center text-gray-500 py-4">No pathway recommendations available</p>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-3 mt-4">
            {recommendations.advanced_topics?.length > 0 ? (
              <>
                <div className="text-sm text-gray-400 mb-3">
                  Deepen your expertise in areas you've mastered
                </div>
                {recommendations.advanced_topics.map((rec, idx) => (
                  <RecommendationCard key={idx} rec={rec} />
                ))}
              </>
            ) : (
              <p className="text-center text-gray-500 py-4">Complete more courses to unlock advanced topics</p>
            )}
          </TabsContent>

          <TabsContent value="diversify" className="space-y-3 mt-4">
            {recommendations.skill_diversification?.length > 0 ? (
              <>
                <div className="text-sm text-gray-400 mb-3">
                  Expand your skillset with complementary courses
                </div>
                {recommendations.skill_diversification.map((rec, idx) => (
                  <RecommendationCard key={idx} rec={rec} />
                ))}
              </>
            ) : (
              <p className="text-center text-gray-500 py-4">Keep learning to discover new opportunities</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}