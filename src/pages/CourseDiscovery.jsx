import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, BookOpen, TrendingUp, Clock } from 'lucide-react';
import AISearchBar from '@/components/discovery/AISearchBar';
import CuratedCollections from '@/components/discovery/CuratedCollections';
import PersonalizedRecommendations from '@/components/discovery/PersonalizedRecommendations';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CourseDiscovery() {
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    level: null,
    category: null,
    duration: null
  });

  const handleResults = (results) => {
    setSearchResults(results);
  };

  const applyFilter = (type, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? null : value
    }));
  };

  const clearFilters = () => {
    setActiveFilters({ level: null, category: null, duration: null });
  };

  const filterOptions = {
    level: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    category: ['AI & ML', 'Business', 'Technology', 'Design', 'Data Science'],
    duration: ['< 5 hours', '5-10 hours', '10-20 hours', '20+ hours']
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Discover Your Next Course
          </h1>
          <p className="text-slate-600 text-lg">AI-powered search, personalized recommendations, and curated collections</p>
        </div>

        {/* AI Search */}
        <Card className="bg-white border-2 border-purple-200">
          <CardContent className="p-6">
            <AISearchBar onResults={handleResults} onLoading={setIsSearching} />
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Filters</h3>
                {(activeFilters.level || activeFilters.category || activeFilters.duration) && (
                  <Button onClick={clearFilters} size="sm" variant="outline">
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-600 mb-2">Level</p>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.level.map(level => (
                      <Badge
                        key={level}
                        className={`cursor-pointer ${
                          activeFilters.level === level
                            ? 'bg-purple-600'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                        onClick={() => applyFilter('level', level)}
                      >
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-600 mb-2">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.category.map(cat => (
                      <Badge
                        key={cat}
                        className={`cursor-pointer ${
                          activeFilters.category === cat
                            ? 'bg-blue-600'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                        onClick={() => applyFilter('category', cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-600 mb-2">Duration</p>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.duration.map(dur => (
                      <Badge
                        key={dur}
                        className={`cursor-pointer ${
                          activeFilters.duration === dur
                            ? 'bg-green-600'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                        onClick={() => applyFilter('duration', dur)}
                      >
                        {dur}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {isSearching && (
          <Card className="bg-white">
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-slate-600">AI is analyzing your search...</p>
            </CardContent>
          </Card>
        )}

        {searchResults && !isSearching && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
            <div className="space-y-4">
              {searchResults.results?.map((result, idx) => {
                const course = result.course;
                return (
                  <Card key={idx} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                            <Badge className="bg-blue-600">
                              {Math.round(result.relevance_score * 100)}% Match
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{result.match_reason}</p>
                          <div className="flex items-center gap-4">
                            <Badge className="bg-purple-100 text-purple-700">{course.level}</Badge>
                            <Badge className="bg-blue-100 text-blue-700">{course.category}</Badge>
                            <span className="text-sm text-slate-600 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {course.estimated_duration} hours
                            </span>
                          </div>
                        </div>
                        <Link to={createPageUrl('CourseOverview') + `?id=${course.id}`}>
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            View Course
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        {!searchResults && (
          <Tabs defaultValue="personalized" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200">
              <TabsTrigger value="personalized" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Personalized
              </TabsTrigger>
              <TabsTrigger value="collections" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Curated Collections
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personalized" className="mt-6">
              <PersonalizedRecommendations />
            </TabsContent>

            <TabsContent value="collections" className="mt-6">
              <CuratedCollections />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}