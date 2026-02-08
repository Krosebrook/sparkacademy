import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Award, Zap, Target, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CuratedCollections() {
  const { data, isLoading } = useQuery({
    queryKey: ['curatedCollections'],
    queryFn: () => base44.functions.invoke('generateCuratedCollections', {}),
    staleTime: 1000 * 60 * 30 // 30 minutes
  });

  const collections = data?.data?.collections || [];

  const iconMap = {
    trending: TrendingUp,
    essential: Award,
    quick: Zap,
    career: Target,
    skill: BookOpen,
    hot: Sparkles
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-slate-200" />
            <CardContent className="h-48 bg-slate-100" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Curated Collections</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection, idx) => {
          const IconComponent = iconMap[collection.icon] || BookOpen;
          
          return (
            <Card key={idx} className="hover:shadow-lg transition-shadow border-2 hover:border-purple-500/50">
              <CardHeader className="bg-gradient-to-r from-purple-900 to-blue-900">
                <CardTitle className="text-white flex items-center gap-2">
                  <IconComponent className="w-5 h-5" />
                  {collection.title}
                </CardTitle>
                <p className="text-slate-300 text-sm">{collection.description}</p>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <Badge className="bg-purple-100 text-purple-700">
                  {collection.target_audience}
                </Badge>
                
                <div className="space-y-2">
                  {collection.courses?.slice(0, 3).map(course => (
                    <Link
                      key={course.id}
                      to={createPageUrl('CourseOverview') + `?id=${course.id}`}
                      className="block p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors"
                    >
                      <p className="text-sm font-semibold text-slate-800">{course.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          {course.level}
                        </Badge>
                        <span className="text-xs text-slate-600">{course.category}</span>
                      </div>
                    </Link>
                  ))}
                  {collection.courses?.length > 3 && (
                    <p className="text-xs text-slate-500 text-center pt-2">
                      +{collection.courses.length - 3} more courses
                    </p>
                  )}
                </div>

                <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-3">
                  View Collection
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}