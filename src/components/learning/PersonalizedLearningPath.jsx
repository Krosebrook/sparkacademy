import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Target, TrendingUp, BookOpen, Zap, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BadgeDisplay from './BadgeDisplay';
import PointsTracker from './PointsTracker';
import MiniLeaderboard from './MiniLeaderboard';

export default function PersonalizedLearningPath() {
  const [analyzing, setAnalyzing] = useState(false);
  const [pathData, setPathData] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: enrollments } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment?.filter({ student_email: user.email }),
    enabled: !!user
  });

  const analyzeLearningPath = async () => {
    setAnalyzing(true);
    try {
      const completedCourses = enrollments?.filter(e => e.status === 'completed') || [];
      const inProgressCourses = enrollments?.filter(e => e.status === 'in_progress') || [];
      
      const avgQuizScore = enrollments?.reduce((sum, e) => sum + (e.quiz_scores_avg || 0), 0) / 
                          (enrollments?.length || 1);

      const { data } = await base44.functions.invoke('analyzeSkillsAndRecommend', {
        completed_courses: completedCourses,
        in_progress_courses: inProgressCourses,
        avg_quiz_score: avgQuizScore,
        user_email: user.email
      });

      setPathData(data);
    } catch (error) {
      console.error('Path analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (user && enrollments) {
      analyzeLearningPath();
    }
  }, [user, enrollments]);

  if (analyzing) {
    return (
      <Card className="card-glow">
        <CardContent className="py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-400" />
            <p className="text-gray-300">Analyzing your learning journey...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pathData) return null;

  return (
    <div className="space-y-6">
      {/* Gamification Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PointsTracker userEmail={user?.email} />
        <BadgeDisplay userEmail={user?.email} />
        <MiniLeaderboard userEmail={user?.email} />
      </div>

      {/* Skill Analysis */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Your Skill Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pathData.current_skills?.map((skill, idx) => (
            <div key={idx}>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-300">{skill.skill_name}</span>
                <span className="text-sm text-purple-400">{skill.level}/100</span>
              </div>
              <Progress value={skill.level} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommended Path */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Personalized Path
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pathData.recommendations?.map((rec, idx) => (
            <div key={idx} className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {rec.priority === 'high' ? 'Next Step' : 'Suggested'}
                    </Badge>
                    {rec.fills_gap && (
                      <Badge className="bg-red-500/20 text-red-300 text-xs">
                        Fills Gap
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-white mb-1">{rec.course_title}</h4>
                  <p className="text-sm text-gray-400 mb-2">{rec.reason}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <BookOpen className="w-3 h-3" />
                    <span>{rec.estimated_hours}h estimated</span>
                  </div>
                </div>
                <Button size="sm" asChild>
                  <Link to={createPageUrl('CourseOverview') + `?id=${rec.course_id}`}>
                    Start
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Knowledge Gaps */}
      {pathData.knowledge_gaps?.length > 0 && (
        <Card className="card-glow border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Areas to Strengthen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {pathData.knowledge_gaps.map((gap, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}