import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

export default function FeedbackSentimentAnalysis({ courseId }) {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyzeSentiment();
  }, [courseId]);

  const analyzeSentiment = async () => {
    try {
      const feedback = await base44.entities.CourseFeedback.filter({ course_id: courseId });

      if (feedback.length === 0) {
        setIsLoading(false);
        return;
      }

      const prompt = `Analyze sentiment and extract insights from these course reviews:

${feedback.slice(0, 30).map(f => `Rating: ${f.rating}/5\nFeedback: ${f.feedback_text}`).join("\n---\n")}

Provide:
1. Sentiment distribution (positive %, neutral %, negative %)
2. Key pain points mentioned
3. Most praised aspects
4. Content format suggestions
5. Overall sentiment score (0-100)
6. Top improvement areas`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment_distribution: {
              type: "object",
              properties: {
                positive: { type: "number" },
                neutral: { type: "number" },
                negative: { type: "number" }
              }
            },
            overall_score: { type: "number" },
            pain_points: { type: "array", items: { type: "string" } },
            praised_aspects: { type: "array", items: { type: "string" } },
            format_suggestions: { type: "array", items: { type: "string" } },
            improvement_areas: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAnalysis({ ...result, total_reviews: feedback.length });
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader2 className="w-8 h-8 animate-spin" />;
  if (!analysis) return <p className="text-slate-600">No feedback to analyze</p>;

  const sentimentData = [
    { name: "Positive", value: analysis.sentiment_distribution.positive },
    { name: "Neutral", value: analysis.sentiment_distribution.neutral },
    { name: "Negative", value: analysis.sentiment_distribution.negative }
  ];

  const COLORS = ["#10b981", "#f3f4f6", "#ef4444"];

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Sentiment Analysis ({analysis.total_reviews} reviews)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={sentimentData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-900 font-semibold mb-1">Overall Sentiment</p>
              <p className="text-3xl font-bold text-green-600">{analysis.overall_score}/100</p>
            </div>

            <div className="space-y-2">
              {[
                { label: "Positive", value: analysis.sentiment_distribution.positive, color: "bg-green-100 text-green-800" },
                { label: "Neutral", value: analysis.sentiment_distribution.neutral, color: "bg-slate-100 text-slate-800" },
                { label: "Negative", value: analysis.sentiment_distribution.negative, color: "bg-red-100 text-red-800" }
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <Badge className={item.color}>{item.value}%</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-lg bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Pain Points</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.pain_points?.map((point, idx) => (
                <li key={idx} className="text-sm text-red-900 flex gap-2">
                  <span className="text-red-600 font-bold">•</span> {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700">Praised Aspects</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.praised_aspects?.map((aspect, idx) => (
                <li key={idx} className="text-sm text-green-900 flex gap-2">
                  <span className="text-green-600 font-bold">✓</span> {aspect}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-blue-700">Format Improvement Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.format_suggestions?.map((suggestion, idx) => (
              <li key={idx} className="text-sm text-blue-900 flex gap-2">
                <span className="text-blue-600">→</span> {suggestion}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}