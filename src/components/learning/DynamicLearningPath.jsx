import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { 
  TrendingUp, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Target,
  Sparkles,
  ArrowRight,
  BookOpen,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

export default function DynamicLearningPath({ courseId, confusionPoints }) {
  const [loading, setLoading] = useState(false);
  const [learningPath, setLearningPath] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', courseId],
    queryFn: async () => {
      const enrollments = await base44.entities.Enrollment.filter({
        course_id: courseId,
        student_email: user.email
      });
      return enrollments[0];
    },
    enabled: !!courseId && !!user
  });

  const { data: pathProgress } = useQuery({
    queryKey: ['pathProgress', courseId, user?.email],
    queryFn: async () => {
      const records = await base44.entities.LearningPathProgress.filter({
        user_email: user.email,
        course_id: courseId
      });
      return records[0];
    },
    enabled: !!courseId && !!user
  });

  const updatePathMutation = useMutation({
    mutationFn: async ({ stepId }) => {
      const { data } = await base44.functions.invoke('updateLearningPathProgress', {
        course_id: courseId,
        step_id: stepId
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pathProgress'] });
      generatePath();
    }
  });

  const generatePath = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateDynamicLearningPath', {
        course_id: courseId,
        confusion_points: confusionPoints || []
      });
      setLearningPath(data);
    } catch (error) {
      console.error('Learning path error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId && user) {
      generatePath();
    }
  }, [courseId, user?.email, confusionPoints]);

  const markStepComplete = (stepId) => {
    updatePathMutation.mutate({ stepId });
  };

  if (!learningPath && !loading) {
    return (
      <Card className="card-glow">
        <CardContent className="py-12 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-purple-400/30" />
          <Button onClick={generatePath} className="btn-primary">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Your Learning Path
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="card-glow">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
          <p className="text-gray-400">Analyzing your progress and creating a personalized path...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Path Overview */}
      <Card className="card-glow bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Your Dynamic Learning Path
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generatePath}
              disabled={loading}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.learning_goal && (
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-white">Goal</span>
              </div>
              <p className="text-sm text-gray-300">{user.learning_goal}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">
                {learningPath?.completed_steps || 0}/{learningPath?.total_steps || 0}
              </div>
              <div className="text-xs text-gray-400">Steps Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {learningPath?.mastery_level || 0}%
              </div>
              <div className="text-xs text-gray-400">Mastery Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {learningPath?.priority_topics?.length || 0}
              </div>
              <div className="text-xs text-gray-400">Priority Topics</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Overall Progress</span>
              <span className="text-xs text-cyan-400">
                {Math.round((learningPath?.completed_steps / learningPath?.total_steps) * 100) || 0}%
              </span>
            </div>
            <Progress 
              value={(learningPath?.completed_steps / learningPath?.total_steps) * 100 || 0}
              className="h-2"
            />
          </div>

          {learningPath?.path_adjustments && (
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">Path Adjusted</span>
              </div>
              <p className="text-xs text-gray-300">{learningPath.path_adjustments}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Priority Topics (based on confusion/gaps) */}
      {learningPath?.priority_topics?.length > 0 && (
        <Card className="card-glow border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              Focus Areas (Based on Your Performance)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {learningPath.priority_topics.map((topic, idx) => (
              <div key={idx} className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-white text-sm">{topic.name}</span>
                  <Badge className={
                    topic.urgency === 'high' ? 'bg-red-500/20 text-red-300' :
                    topic.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-blue-500/20 text-blue-300'
                  }>
                    {topic.urgency}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mb-2">{topic.reason}</p>
                {topic.recommended_action && (
                  <div className="text-xs text-cyan-300">
                    → {topic.recommended_action}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-green-400" />
            Your Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {learningPath?.next_steps?.map((step, idx) => (
            <div 
              key={idx} 
              className={`rounded-lg p-3 border ${
                step.completed 
                  ? 'bg-green-900/20 border-green-500/30 opacity-60' 
                  : 'bg-gray-800/50 border-gray-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center text-xs text-gray-400">
                      {idx + 1}
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-medium text-white text-sm">{step.title}</div>
                    <Badge variant="outline" className="text-xs">
                      {step.estimated_time}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{step.description}</p>
                  
                  {step.type && (
                    <Badge className="bg-purple-500/20 text-purple-300 text-xs mb-2">
                      {step.type}
                    </Badge>
                  )}

                  {!step.completed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markStepComplete(step.id)}
                      className="text-xs"
                      disabled={updatePathMutation.isPending}
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Supplementary Resources */}
      {learningPath?.supplementary_resources?.length > 0 && (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Recommended Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {learningPath.supplementary_resources.map((resource, idx) => (
              <div key={idx} className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{resource.title}</div>
                    <p className="text-xs text-gray-400 mt-1">{resource.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {resource.type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Addresses: {resource.addresses_gap}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}