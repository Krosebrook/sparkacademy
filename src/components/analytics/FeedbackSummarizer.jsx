import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, MessageSquare, ThumbsUp, ThumbsDown, Loader2, Sparkles } from "lucide-react";

export default function FeedbackSummarizer({ course, feedback }) {
  const [summary, setSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const summarizeFeedback = async () => {
    if (feedback.length === 0) {
      setSummary({ error: "No feedback available to analyze" });
      return;
    }

    setIsSummarizing(true);
    try {
      const feedbackText = feedback.map(f => 
        `Rating: ${f.rating}/5\nReview: ${f.review_text || 'No text'}\nDate: ${f.created_date}`
      ).join('\n\n');

      const prompt = `Analyze all student feedback for course "${course.title}":

Total Reviews: ${feedback.length}
Average Rating: ${(feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length).toFixed(2)}/5

Student Feedback:
${feedbackText}

Provide comprehensive analysis:
1. Overall sentiment (positive/neutral/negative percentages)
2. Top 5 most praised aspects (with frequency)
3. Top 5 most criticized aspects (with frequency)
4. Emerging themes and patterns
5. Specific quotes that represent common sentiments
6. Actionable recommendations based on feedback
7. Priority improvements ranked by student impact`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment_breakdown: {
              type: "object",
              properties: {
                positive: { type: "number" },
                neutral: { type: "number" },
                negative: { type: "number" }
              }
            },
            overall_sentiment: { type: "string" },
            sentiment_score: { type: "number" },
            top_praised: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  aspect: { type: "string" },
                  frequency: { type: "number" },
                  examples: { type: "array", items: { type: "string" } }
                }
              }
            },
            top_criticized: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  aspect: { type: "string" },
                  frequency: { type: "number" },
                  examples: { type: "array", items: { type: "string" } }
                }
              }
            },
            themes: { type: "array", items: { type: "string" } },
            representative_quotes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  quote: { type: "string" },
                  sentiment: { type: "string" },
                  category: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  student_impact: { type: "string" },
                  implementation_effort: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSummary(result);
    } catch (error) {
      console.error("Error summarizing feedback:", error);
      setSummary({ error: "Failed to analyze feedback" });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-green-400" />
              AI Feedback Summarization
            </span>
            <Button onClick={summarizeFeedback} disabled={isSummarizing || feedback.length === 0} className="btn-primary">
              {isSummarizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Summarize All Feedback
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No feedback available yet</p>
            </div>
          ) : !summary ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-green-400/30 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">AI will analyze {feedback.length} student reviews</p>
              <p className="text-sm text-gray-500">Extract themes, sentiment, and actionable insights</p>
            </div>
          ) : summary.error ? (
            <div className="text-center py-12 text-red-400">{summary.error}</div>
          ) : (
            <div className="space-y-6">
              {/* Sentiment Overview */}
              <div className="p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg">
                <h3 className="font-semibold text-green-300 mb-3">Overall Sentiment</h3>
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-3xl font-bold text-white">{summary.overall_sentiment}</div>
                  <Badge className="text-lg">Score: {summary.sentiment_score}/100</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="p-2 bg-green-500/20 rounded text-center">
                    <div className="font-bold text-green-300">{summary.sentiment_breakdown?.positive || 0}%</div>
                    <div className="text-gray-400">Positive</div>
                  </div>
                  <div className="p-2 bg-yellow-500/20 rounded text-center">
                    <div className="font-bold text-yellow-300">{summary.sentiment_breakdown?.neutral || 0}%</div>
                    <div className="text-gray-400">Neutral</div>
                  </div>
                  <div className="p-2 bg-red-500/20 rounded text-center">
                    <div className="font-bold text-red-300">{summary.sentiment_breakdown?.negative || 0}%</div>
                    <div className="text-gray-400">Negative</div>
                  </div>
                </div>
              </div>

              {/* Top Praised Aspects */}
              <div>
                <h3 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5" />
                  Most Praised Aspects
                </h3>
                <div className="space-y-3">
                  {summary.top_praised?.map((item, idx) => (
                    <div key={idx} className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{item.aspect}</span>
                        <Badge className="bg-green-500/20 text-green-300">
                          {item.frequency} mentions
                        </Badge>
                      </div>
                      {item.examples?.length > 0 && (
                        <div className="text-sm text-gray-400 italic">
                          "{item.examples[0]}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Criticized Aspects */}
              <div>
                <h3 className="font-semibold text-orange-300 mb-3 flex items-center gap-2">
                  <ThumbsDown className="w-5 h-5" />
                  Most Criticized Aspects
                </h3>
                <div className="space-y-3">
                  {summary.top_criticized?.map((item, idx) => (
                    <div key={idx} className="p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{item.aspect}</span>
                        <Badge className="bg-orange-500/20 text-orange-300">
                          {item.frequency} mentions
                        </Badge>
                      </div>
                      {item.examples?.length > 0 && (
                        <div className="text-sm text-gray-400 italic">
                          "{item.examples[0]}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Emerging Themes */}
              <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <h3 className="font-semibold text-purple-300 mb-3">Emerging Themes</h3>
                <div className="flex flex-wrap gap-2">
                  {summary.themes?.map((theme, idx) => (
                    <Badge key={idx} variant="outline" className="bg-purple-500/10">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Representative Quotes */}
              {summary.representative_quotes?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-cyan-300 mb-3">Key Student Quotes</h3>
                  <div className="space-y-3">
                    {summary.representative_quotes.map((quote, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${
                        quote.sentiment === 'positive' ? 'bg-green-900/20 border-green-500/30' :
                        quote.sentiment === 'negative' ? 'bg-red-900/20 border-red-500/30' :
                        'bg-gray-900/20 border-gray-500/30'
                      }`}>
                        <div className="text-sm italic text-gray-300 mb-2">"{quote.quote}"</div>
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs">{quote.category}</Badge>
                          <span className="text-xs text-gray-500">{quote.sentiment}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Recommendations */}
              <div>
                <h3 className="font-semibold text-yellow-300 mb-3">Actionable Recommendations</h3>
                <div className="space-y-3">
                  {summary.recommendations?.map((rec, idx) => (
                    <div key={idx} className="p-4 bg-[#1a0a2e] border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">{rec.action}</h4>
                        <Badge className={
                          rec.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                          rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }>
                          {rec.priority}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Impact:</span>
                          <span className="ml-2 text-cyan-400">{rec.student_impact}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Effort:</span>
                          <span className="ml-2 text-purple-400">{rec.implementation_effort}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}