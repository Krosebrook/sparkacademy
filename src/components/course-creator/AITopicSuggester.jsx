import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Lightbulb } from "lucide-react";

export default function AITopicSuggester() {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateTopics = async () => {
    setIsLoading(true);
    try {
      const allCourses = await base44.entities.Course.filter({ is_published: true });
      const enrollments = await base44.entities.Enrollment.filter({}, "", 100);

      const categoryStats = {};
      allCourses.forEach(c => {
        if (!categoryStats[c.category]) {
          categoryStats[c.category] = { count: 0, avgRating: 0 };
        }
        categoryStats[c.category].count++;
        categoryStats[c.category].avgRating += c.rating || 0;
      });

      Object.keys(categoryStats).forEach(cat => {
        categoryStats[cat].avgRating /= categoryStats[cat].count;
      });

      const prompt = `Analyze course market trends and suggest high-demand course topics.

Current course statistics:
${Object.entries(categoryStats).map(([cat, stats]) => 
  `${cat}: ${stats.count} courses, avg rating ${stats.avgRating.toFixed(1)}`
).join('\n')}

Total enrollments tracked: ${enrollments.length}

Based on market gaps, trending topics, and demand signals, suggest 8-10 high-potential course topics that:
1. Fill market gaps (low competition, high demand)
2. Have trending appeal (AI, automation, wellness, etc.)
3. Target underserved skill levels
4. Address emerging job market needs

For each topic, provide estimated demand level and why it's valuable.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            topics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  category: { type: "string" },
                  demand_level: { type: "string", "enum": ["high", "medium", "emerging"] },
                  target_audience: { type: "string" },
                  market_gap: { type: "string" },
                  estimated_potential: { type: "number" }
                }
              }
            }
          }
        }
      });

      setSuggestions(result.topics || []);
    } catch (error) {
      console.error("Error generating topics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Market-Driven Topic Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          AI analyzes market trends, student demand, and competition gaps to suggest high-potential course topics.
        </p>

        <Button
          onClick={generateTopics}
          disabled={isLoading}
          className="w-full bg-blue-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing trends...
            </>
          ) : (
            <>
              <Lightbulb className="w-4 h-4 mr-2" />
              Generate Topic Ideas
            </>
          )}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-3">
            {suggestions.map((topic, idx) => (
              <div
                key={idx}
                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{topic.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{topic.category}</p>
                  </div>
                  <Badge className={
                    topic.demand_level === "high" ? "bg-green-100 text-green-800" :
                    topic.demand_level === "medium" ? "bg-yellow-100 text-yellow-800" :
                    "bg-blue-100 text-blue-800"
                  }>
                    {topic.demand_level} demand
                  </Badge>
                </div>

                <p className="text-sm text-slate-700 mb-2">{topic.market_gap}</p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white rounded">
                    <p className="text-slate-600">Target Audience</p>
                    <p className="font-semibold text-slate-900">{topic.target_audience}</p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-slate-600">Potential</p>
                    <p className="font-semibold text-slate-900">{topic.estimated_potential}/10</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}