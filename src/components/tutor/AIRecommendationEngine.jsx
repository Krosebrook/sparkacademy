import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
<parameter name="badge" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
import { Sparkles, TrendingUp, Target, Lightbulb, ArrowRight, BookOpen, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function AIRecommendationEngine({ userId }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const { data: skillsPathway } = useQuery({
    queryKey: ['skills-pathway', userId],
    queryFn: async () => {
      const pathways = await base44.entities.SkillsPathway.filter({
        employee_id: userId,
        status: 'active'
      });
      return pathways[0];
    },
    enabled: !!userId
  });

  const { data: employeeProfile } = useQuery({
    queryKey: ['employee-profile', userId],
    queryFn: async () => {
      const profiles = await base44.entities.EmployeeProfile.filter({ employee_email: userId });
      return profiles[0];
    },
    enabled: !!userId
  });

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generatePersonalizedRecommendations', {
        userEmail: userId,
        skillsPathway,
        employeeProfile
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error('Recommendation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockRecommendations = [
    {
      courseTitle: 'Advanced Neural Networks',
      matchScore: 94,
      reason: 'Closes your TensorFlow skill gap',
      alignment: 'Directly aligns with your Senior ML Engineer goal',
      impact: 'Increases job readiness by 18%',
      duration: '6 weeks',
      difficulty: 'Intermediate',
      category: 'Technical Skills'
    },
    {
      courseTitle: 'Cloud Infrastructure Fundamentals',
      matchScore: 87,
      reason: 'Essential for Senior Data Scientist roles',
      alignment: 'Fills identified gap in your career pathway',
      impact: 'Critical for target role transition',
      duration: '4 weeks',
      difficulty: 'Beginner',
      category: 'Career Path'
    },
    {
      courseTitle: 'Leadership in Tech Teams',
      matchScore: 76,
      reason: 'Prepares you for senior-level responsibilities',
      alignment: 'Supports your career goals in management',
      impact: 'Enhances leadership competencies',
      duration: '3 weeks',
      difficulty: 'Advanced',
      category: 'Soft Skills'
    }
  ];

  const displayRecommendations = recommendations || mockRecommendations;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Course Recommendations
          </CardTitle>
          <p className="text-sm text-gray-400">
            Personalized suggestions based on your learning path, skill gaps, and career goals
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generateRecommendations}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 mb-6"
          >
            {loading ? 'Analyzing Your Profile...' : 'Get Fresh Recommendations'}
          </Button>

          <div className="space-y-4">
            {displayRecommendations.map((rec, idx) => (
              <Card key={idx} className="bg-gray-900/40 border-purple-500/20 hover:border-purple-500/40 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                          {rec.category}
                        </Badge>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                          {rec.matchScore}% Match
                        </Badge>
                      </div>
                      <h4 className="text-lg font-bold mb-2">{rec.courseTitle}</h4>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-cyan-300 mb-0.5">Why This Course?</p>
                            <p className="text-xs text-gray-400">{rec.reason}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-yellow-300 mb-0.5">Career Alignment</p>
                            <p className="text-xs text-gray-400">{rec.alignment}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-emerald-300 mb-0.5">Expected Impact</p>
                            <p className="text-xs text-gray-400">{rec.impact}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>⏱️ {rec.duration}</span>
                        <span>•</span>
                        <span>{rec.difficulty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-purple-500/10">
                    <Button size="sm" variant="outline" className="flex-1 border-purple-500/30 hover:bg-purple-500/10">
                      <BookOpen className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                      Enroll Now <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}