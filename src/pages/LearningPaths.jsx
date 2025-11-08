import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Target, TrendingUp, Sparkles } from 'lucide-react';

export default function LearningPaths() {
  const [learningPaths, setLearningPaths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLearningPaths();
  }, []);

  const loadLearningPaths = async () => {
    try {
      const paths = await base44.entities.LearningPath.filter({ is_published: true });
      setLearningPaths(paths);
    } catch (error) {
      console.error('Error loading learning paths:', error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading learning paths...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-4">
            <Target className="w-4 h-4" />
            <span className="text-sm font-semibold">Curated Learning Journeys</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">Learning Paths</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Follow structured learning paths designed to take you from beginner to expert
          </p>
        </div>

        {learningPaths.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Learning Paths Yet</h3>
            <p className="text-slate-600">Check back soon for curated learning journeys!</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.map(path => (
              <LearningPathCard key={path.id} path={path} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LearningPathCard({ path }) {
  const difficultyColors = {
    beginner: 'bg-emerald-100 text-emerald-700',
    intermediate: 'bg-amber-100 text-amber-700',
    advanced: 'bg-red-100 text-red-700'
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <Badge className={difficultyColors[path.difficulty_level]}>
            {path.difficulty_level}
          </Badge>
        </div>
        <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">
          {path.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-600 text-sm line-clamp-3">{path.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {path.course_ids?.length || 0} courses
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {path.estimated_duration}h
          </div>
        </div>

        {path.skills_gained && path.skills_gained.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {path.skills_gained.slice(0, 3).map((skill, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {path.skills_gained.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{path.skills_gained.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <Link to={createPageUrl(`LearningPathViewer?id=${path.id}`)}>
          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
            Start Learning Path
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}