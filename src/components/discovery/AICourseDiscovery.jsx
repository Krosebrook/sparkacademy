import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Search, Sparkles, Loader2, TrendingUp, BookOpen, ChevronRight, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LearningJourneyCard from './LearningJourneyCard';

export default function AICourseDiscovery({ userEmail }) {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [recommendations, setRecommendations] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('discoverCourses', {
        user_email: userEmail,
        query: query.trim()
      });
      setRecommendations(data);
    } catch (error) {
      console.error('Discovery error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSmartRecommendations = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('discoverCourses', {
        user_email: userEmail,
        query: null
      });
      setRecommendations(data);
    } catch (error) {
      console.error('Discovery error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Course Discovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Describe what you want to learn... (e.g., 'I want to build mobile apps')"
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Or</span>
            <Button size="sm" variant="outline" onClick={loadSmartRecommendations} disabled={loading}>
              Get Smart Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
        </div>
      )}

      {recommendations && (
        <>
          {/* Learning Journeys */}
          {recommendations.learning_journeys?.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Personalized Learning Journeys</h3>
              </div>
              {recommendations.learning_journeys.map((journey, idx) => (
                <LearningJourneyCard key={idx} journey={journey} />
              ))}
            </div>
          )}

          {/* Individual Courses */}
          {recommendations.courses?.length > 0 && (
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Individual Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.courses.map((course, idx) => (
                  <div key={idx} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{course.title}</h4>
                        <p className="text-sm text-gray-400 mb-2">{course.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{course.match_score}% match</Badge>
                          <Badge className="text-xs bg-blue-500/20 text-blue-300">{course.level}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">Why recommended: {course.reason}</p>
                      </div>
                      <Button size="sm">
                        View
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Trending Topics */}
          {recommendations.trending_topics?.length > 0 && (
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trending in Your Field
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {recommendations.trending_topics.map((topic, idx) => (
                    <Badge key={idx} variant="outline" className="text-sm">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}