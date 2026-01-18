import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, Award, TrendingUp } from 'lucide-react';

export default function ExpertIdentification({ courseId }) {
  const { data: experts } = useQuery({
    queryKey: ['courseExperts', courseId],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('identifyExperts', { course_id: courseId });
      return data;
    }
  });

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Community Experts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {experts?.experts?.map((expert, idx) => (
          <div key={idx} className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-yellow-400 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">{expert.name}</h4>
                <p className="text-sm text-gray-400 mb-2">{expert.expertise_area}</p>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="text-xs bg-yellow-500/20 text-yellow-300">
                    {expert.helpful_answers} helpful answers
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {expert.reputation_score} reputation
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">{expert.reason}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}