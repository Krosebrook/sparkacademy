import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AISearchBar({ onResults, onLoading }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    onLoading(true);
    try {
      const response = await base44.functions.invoke('aiCourseDiscovery', {
        query,
        filters: {},
        userContext: {}
      });
      
      onResults(response.data);
      if (response.data.alternatives) {
        setSuggestions(response.data.alternatives);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
    onLoading(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setTimeout(() => handleSearch(), 100);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search courses with AI... (e.g., 'machine learning for beginners', 'financial analysis')"
            className="pl-10 pr-4 py-6 text-lg"
          />
        </div>
        <Button
          onClick={handleSearch}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8"
          size="lg"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          AI Search
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Try:
          </span>
          {suggestions.map((sug, idx) => (
            <Badge
              key={idx}
              className="bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer"
              onClick={() => handleSuggestionClick(sug)}
            >
              {sug}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}