import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Zap, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InteractiveElementsSuggester() {
  const [lessonContent, setLessonContent] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestions = async () => {
    if (!lessonContent.trim()) return;
    setIsLoading(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this lesson content and suggest where to add interactive elements:

${lessonContent}

For each suggestion, identify:
1. The exact content section where it should be placed
2. Type of interactive element (quiz, poll, simulation, exercise, reflection prompt)
3. Specific questions or activities to include
4. Expected learning outcome
5. Estimated time required

Provide 3-5 specific, actionable suggestions that naturally fit the content flow and enhance learning.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  placement: { type: "string", description: "Where in the lesson to add this" },
                  element_type: { type: "string", enum: ["quiz", "poll", "simulation", "exercise", "reflection"] },
                  title: { type: "string" },
                  description: { type: "string" },
                  activity: { type: "string", description: "Specific activity or questions" },
                  learning_outcome: { type: "string" },
                  estimated_time_minutes: { type: "number" },
                  rationale: { type: "string", description: "Why this element fits here" }
                }
              }
            },
            overall_interactivity_score: { type: "number", description: "0-100 current interactivity level" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setSuggestions(result);
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getElementColor = (type) => {
    const colors = {
      quiz: "bg-blue-100 text-blue-800",
      poll: "bg-purple-100 text-purple-800",
      simulation: "bg-red-100 text-red-800",
      exercise: "bg-green-100 text-green-800",
      reflection: "bg-orange-100 text-orange-800"
    };
    return colors[type] || "bg-slate-100 text-slate-800";
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Interactive Elements Suggester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!suggestions ? (
          <>
            <p className="text-sm text-slate-600">
              Paste your lesson content and AI will suggest where to add quizzes, polls, simulations, and other interactive elements to boost engagement.
            </p>

            <Textarea
              placeholder="Paste your lesson content here..."
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              className="min-h-32"
            />

            <Button
              onClick={generateSuggestions}
              disabled={isLoading || !lessonContent.trim()}
              className="w-full bg-yellow-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing content...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Suggest Interactive Elements
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Interactivity Score</span>
                <span className={`text-2xl font-bold ${suggestions.overall_interactivity_score > 70 ? 'text-green-600' : suggestions.overall_interactivity_score > 40 ? 'text-yellow-600' : 'text-orange-600'}`}>
                  {suggestions.overall_interactivity_score}/100
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Suggested Interactive Elements</h4>
              <div className="space-y-3">
                {suggestions.suggestions?.map((suggestion, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getElementColor(suggestion.element_type)}>
                            {suggestion.element_type}
                          </Badge>
                          <span className="text-xs text-slate-600">
                            {suggestion.estimated_time_minutes} min
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900">{suggestion.title}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-slate-700 uppercase">Placement</p>
                        <p className="text-slate-700">{suggestion.placement}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-700 uppercase">Activity</p>
                        <p className="text-slate-700 whitespace-pre-wrap">{suggestion.activity}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-700 uppercase">Learning Outcome</p>
                        <p className="text-slate-700">{suggestion.learning_outcome}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-700 uppercase">Why It Works</p>
                        <p className="text-slate-700 italic">{suggestion.rationale}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {suggestions.recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Overall Recommendations</h4>
                <ul className="space-y-1">
                  {suggestions.recommendations?.map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-700">✓ {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={() => setSuggestions(null)}
              variant="outline"
              className="w-full"
            >
              Analyze Another Lesson
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}