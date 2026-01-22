import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Calendar, Code, Target, MessageSquare } from 'lucide-react';
import StudyPlanGenerator from '@/components/learning/StudyPlanGenerator';
import AICodeReviewer from '@/components/learning/AICodeReviewer';
import EnhancedAITutor from '@/components/learning/EnhancedAITutor';
import ProactiveCheckIn from '@/components/learning/ProactiveCheckIn';
import DynamicLearningPath from '@/components/learning/DynamicLearningPath';
import AIRecommendationEngine from '@/components/tutor/AIRecommendationEngine';

export default function AdvancedAITutor() {
  const [learningGoal, setLearningGoal] = useState('');
  const [goalSaved, setGoalSaved] = useState(false);
  const [confusionPoints, setConfusionPoints] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ student_email: user?.email }),
    enabled: !!user?.email
  });

  const handleSaveGoal = async () => {
    if (!learningGoal.trim()) return;
    
    await base44.auth.updateMe({ learning_goal: learningGoal });
    setGoalSaved(true);
    setTimeout(() => setGoalSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Proactive Check-ins */}
        <ProactiveCheckIn />

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Advanced AI Tutor</h1>
          </div>
          <p className="text-blue-100">
            Personalized learning plans, code reviews, and adaptive tutoring powered by AI
          </p>
        </div>

        {/* Learning Goal Setting */}
        <Card className="border-2 border-blue-500/30 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Set Your Learning Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Define your learning objectives so the AI tutor can adapt explanations and recommendations to your goals.
            </p>
            <Textarea
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              placeholder="e.g., Master React hooks and state management to build production-ready applications"
              rows={3}
            />
            <Button onClick={handleSaveGoal} className="w-full">
              {goalSaved ? '✓ Goal Saved!' : 'Save Learning Goal'}
            </Button>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200">
            <TabsTrigger value="recommendations">
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="tutor">
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="learning-path">
              Learning Path
            </TabsTrigger>
            <TabsTrigger value="study-plan">
              Study Plans
            </TabsTrigger>
            <TabsTrigger value="code-review">
              Code Review
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            <AIRecommendationEngine userId={user?.email} />
          </TabsContent>

          <TabsContent value="tutor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Tutor</CardTitle>
                <p className="text-sm text-gray-500">
                  Ask questions, get explanations, and receive personalized guidance
                </p>
              </CardHeader>
              <CardContent>
                <EnhancedAITutor onConfusionUpdate={setConfusionPoints} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learning-path" className="space-y-4">
            {enrollments.length > 0 ? (
              enrollments.map((enrollment) => (
                <DynamicLearningPath 
                  key={enrollment.id} 
                  courseId={enrollment.course_id}
                  confusionPoints={confusionPoints}
                />
              ))
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Enroll in a course to generate your personalized learning path</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="study-plan" className="space-y-4">
            {enrollments.length > 0 ? (
              enrollments.map((enrollment) => (
                <StudyPlanGenerator key={enrollment.id} courseId={enrollment.course_id} />
              ))
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Enroll in a course to generate personalized study plans</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="code-review" className="space-y-4">
            <AICodeReviewer />
          </TabsContent>
        </Tabs>

        {/* Proactive Check-in Notice */}
        <Card className="border-yellow-500/30 bg-yellow-50/50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">Proactive Learning Support</h4>
                <p className="text-sm text-yellow-800">
                  The AI tutor monitors your learning activity and will proactively check in if it detects disengagement 
                  or if you haven't practiced in a while. You'll receive personalized nudges to keep you on track!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}