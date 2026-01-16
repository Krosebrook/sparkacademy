import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Loader2, AlertCircle, CheckCircle, Sparkles } from "lucide-react";

export default function AIContentAnalyzer({ onAnalysisComplete }) {
  const [content, setContent] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeContent = async () => {
    if (!content) return;
    
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this educational content for quality and effectiveness:

${content}

Provide comprehensive analysis covering:
1. Clarity score (0-100) with specific issues
2. Engagement level assessment
3. Accuracy and correctness concerns
4. Readability and structure improvements
5. Better analogies and examples to replace existing ones
6. Missing concepts that should be included
7. Specific rewrite suggestions for weak sections`,
        response_json_schema: {
          type: "object",
          properties: {
            clarity_score: { type: "number" },
            engagement_score: { type: "number" },
            accuracy_score: { type: "number" },
            overall_assessment: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            clarity_issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  location: { type: "string" },
                  suggestion: { type: "string" }
                }
              }
            },
            engagement_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  suggestion: { type: "string" },
                  implementation: { type: "string" }
                }
              }
            },
            better_analogies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  original: { type: "string" },
                  improved: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            better_examples: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  example: { type: "string" },
                  why_better: { type: "string" }
                }
              }
            },
            rewrite_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  section: { type: "string" },
                  current_text: { type: "string" },
                  improved_text: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            missing_concepts: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAnalysis(result);
      if (onAnalysisComplete) onAnalysisComplete(result);
    } catch (error) {
      console.error("Failed to analyze content:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          AI Content Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Paste Your Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your lesson content, draft, or any educational text here..."
            className="bg-[#1a0a2e] font-mono h-48"
          />
        </div>

        <Button
          onClick={analyzeContent}
          disabled={!content || isAnalyzing}
          className="btn-primary w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Content...
            </>
          ) : (
            <>
              <Lightbulb className="w-4 h-4 mr-2" />
              Analyze & Get Suggestions
            </>
          )}
        </Button>

        {analysis && (
          <div className="space-y-6 mt-6">
            {/* Quality Scores */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/30 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Clarity</div>
                <div className="text-3xl font-bold text-blue-400">{analysis.clarity_score}/100</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-500/30 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Engagement</div>
                <div className="text-3xl font-bold text-purple-400">{analysis.engagement_score}/100</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-500/30 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Accuracy</div>
                <div className="text-3xl font-bold text-green-400">{analysis.accuracy_score}/100</div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg">
              <h3 className="font-semibold text-cyan-300 mb-2">Overall Assessment</h3>
              <p className="text-sm text-gray-300">{analysis.overall_assessment}</p>
            </div>

            {/* Strengths */}
            {analysis.strengths?.length > 0 && (
              <div>
                <h3 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Strengths
                </h3>
                <div className="space-y-2">
                  {analysis.strengths.map((strength, idx) => (
                    <div key={idx} className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg text-sm text-gray-300">
                      ✓ {strength}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clarity Issues */}
            {analysis.clarity_issues?.length > 0 && (
              <div>
                <h3 className="font-semibold text-orange-300 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Clarity Issues
                </h3>
                <div className="space-y-3">
                  {analysis.clarity_issues.map((issue, idx) => (
                    <div key={idx} className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                      <div className="font-medium text-white mb-2">{issue.issue}</div>
                      <div className="text-sm text-gray-400 mb-2">
                        <span className="text-orange-300">Location:</span> {issue.location}
                      </div>
                      <div className="text-sm text-cyan-300">
                        <span className="text-gray-400">Suggestion:</span> {issue.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Better Analogies */}
            {analysis.better_analogies?.length > 0 && (
              <div>
                <h3 className="font-semibold text-purple-300 mb-3">Better Analogies</h3>
                <div className="space-y-3">
                  {analysis.better_analogies.map((analogy, idx) => (
                    <div key={idx} className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-4 mb-2">
                        <div>
                          <Badge className="bg-red-500/20 text-red-300 mb-2">Original</Badge>
                          <p className="text-sm text-gray-400 italic">"{analogy.original}"</p>
                        </div>
                        <div>
                          <Badge className="bg-green-500/20 text-green-300 mb-2">Improved</Badge>
                          <p className="text-sm text-gray-300 italic">"{analogy.improved}"</p>
                        </div>
                      </div>
                      <div className="text-xs text-cyan-300 mt-2">
                        Why better: {analogy.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Better Examples */}
            {analysis.better_examples?.length > 0 && (
              <div>
                <h3 className="font-semibold text-cyan-300 mb-3">Suggested Examples</h3>
                <div className="space-y-3">
                  {analysis.better_examples.map((example, idx) => (
                    <div key={idx} className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                      <div className="font-medium text-white mb-2">{example.topic}</div>
                      <p className="text-sm text-gray-300 mb-2">{example.example}</p>
                      <div className="text-xs text-cyan-400">💡 {example.why_better}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Engagement Suggestions */}
            {analysis.engagement_suggestions?.length > 0 && (
              <div>
                <h3 className="font-semibold text-yellow-300 mb-3">Engagement Boosters</h3>
                <div className="space-y-3">
                  {analysis.engagement_suggestions.map((suggestion, idx) => (
                    <div key={idx} className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <div className="font-medium text-white mb-2">{suggestion.suggestion}</div>
                      <div className="text-sm text-gray-400">
                        <span className="text-yellow-300">How:</span> {suggestion.implementation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rewrite Suggestions */}
            {analysis.rewrite_suggestions?.length > 0 && (
              <div>
                <h3 className="font-semibold text-blue-300 mb-3">Rewrite Suggestions</h3>
                <div className="space-y-3">
                  {analysis.rewrite_suggestions.map((suggestion, idx) => (
                    <div key={idx} className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <div className="font-medium text-white mb-3">{suggestion.section}</div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Current:</div>
                          <div className="p-2 bg-red-900/20 rounded text-sm text-gray-400">
                            {suggestion.current_text}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Improved:</div>
                          <div className="p-2 bg-green-900/20 rounded text-sm text-gray-300">
                            {suggestion.improved_text}
                          </div>
                        </div>
                        <div className="text-xs text-blue-300">
                          Reason: {suggestion.reason}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Concepts */}
            {analysis.missing_concepts?.length > 0 && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <h3 className="font-semibold text-red-300 mb-3">Missing Concepts</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  {analysis.missing_concepts.map((concept, idx) => (
                    <li key={idx}>• {concept}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}