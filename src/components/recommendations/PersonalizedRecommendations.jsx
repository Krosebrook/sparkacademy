/**
 * Personalized Recommendations Component
 * 
 * Displays AI-generated course recommendations based on:
 * - Learning history and patterns
 * - Performance metrics
 * - Stated interests
 * 
 * @component
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, BookOpen, Target, TrendingUp, Loader2, Star, Clock, BarChart3 } from 'lucide-react';

export default function PersonalizedRecommendations() {
  const [recommendations, setRecommendations] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: existingRecs } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const recs = await base44.entities.CourseRecommendation.filter({ 
        student_email: user.email 
      }, '-generated_date', 1);
      return recs[0];
    }
  });

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const result = await base44.functions.invoke('generatePersonalizedRecommendations');
      setRecommendations(result.data);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const displayData = recommendations || existingRecs;

  return (
    <div className="space-y-6">
      <Card className="card-glow">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              AI-Powered Recommendations
            </CardTitle>
            <p className="text-sm text-gray-400 mt-2">
              Personalized course suggestions based on your learning journey
            </p>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={isGenerating}
            className="btn-primary"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New
              </>
            )}
          </Button>
        </CardHeader>
      </Card>

      {!displayData ? (
        <Card className="card-glow">
          <CardContent className="p-12 text-center">
            <Sparkles className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">
              Get personalized course recommendations based on your learning patterns
            </p>
            <Button onClick={generateRecommendations} className="btn-primary">
              Get Recommendations
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#1a0a2e]/50">
            <TabsTrigger value="courses">Top Picks</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
          </TabsList>

          {/* Top Course Recommendations */}
          <TabsContent value="courses" className="space-y-4">
            {displayData.top_recommendations?.map((rec, idx) => (
              <Card key={idx} className="card-glow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-purple-500/20 text-purple-300">
                          #{idx + 1} Match
                        </Badge>
                        <Badge className="bg-cyan-500/20 text-cyan-300">
                          {rec.match_score}% Match
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{rec.course_title}</h3>
                    </div>
                    <Star className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      {rec.estimated_time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <BarChart3 className="w-4 h-4" />
                      Difficulty: {rec.difficulty_match}
                    </div>
                  </div>

                  <div className="mb-4">
                    <Progress value={rec.match_score} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-cyan-300">Why this course?</h4>
                    <ul className="space-y-1">
                      {rec.reasons?.map((reason, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-green-400 mt-1">✓</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="btn-primary w-full mt-4">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Learning Paths */}
          <TabsContent value="paths" className="space-y-4">
            {displayData.learning_paths?.map((path, idx) => (
              <Card key={idx} className="card-glow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{path.path_name}</CardTitle>
                      <p className="text-sm text-gray-400 mt-1">{path.goal}</p>
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-300">
                      {path.total_duration}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-cyan-300 mb-2">Course Sequence</h4>
                    <div className="space-y-2">
                      {path.courses?.map((course, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-[#0f0618]/50 rounded-lg">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-purple-300">{i + 1}</span>
                          </div>
                          <span className="text-sm text-gray-300">{course}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-green-300 mb-2">Skills You'll Gain</h4>
                    <div className="flex flex-wrap gap-2">
                      {path.skills_gained?.map((skill, i) => (
                        <Badge key={i} className="bg-green-500/20 text-green-300">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="btn-secondary w-full">
                    <Target className="w-4 h-4 mr-2" />
                    Start Learning Path
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Skills to Develop */}
          <TabsContent value="skills" className="space-y-4">
            {displayData.skills_to_develop?.map((skill, idx) => (
              <Card key={idx} className="card-glow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{skill.skill}</h3>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-500/20 text-blue-300">
                        Current: {skill.current_level}
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-300">
                        Target: {skill.target_level}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-cyan-300 mb-2">Recommended Courses</h4>
                    <div className="space-y-2">
                      {skill.recommended_courses?.map((course, i) => (
                        <div key={i} className="p-2 bg-cyan-900/20 border border-cyan-500/30 rounded text-sm text-gray-300">
                          {course}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Engagement Tips */}
          <TabsContent value="tips" className="space-y-4">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Improve Your Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayData.engagement_tips?.map((tip, idx) => (
                  <div key={idx} className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-green-400 mt-1">💡</span>
                      <span>{tip}</span>
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {displayData.next_best_action && (
              <Card className="card-glow bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-purple-300 mb-2">Next Best Action</h3>
                  <p className="text-gray-300">{displayData.next_best_action}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}