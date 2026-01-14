import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Lightbulb, ArrowRight } from "lucide-react";

export default function CourseStructureOptimizer() {
  const [lessonsInput, setLessonsInput] = useState("");
  const [optimization, setOptimization] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const optimizeStructure = async () => {
    if (!lessonsInput.trim()) return;
    setIsLoading(true);

    try {
      const prompt = `Optimize course structure based on learning science principles.

Current lessons (may not be in optimal order):
${lessonsInput}

Analyze and suggest:
1. Ideal lesson sequence (scaffolding from simple to complex)
2. Optimal duration for each lesson (in minutes)
3. Natural grouping of related topics
4. Prerequisite relationships
5. Suggested break points or module divisions
6. Pacing recommendations
7. Potential gaps or missing topics
8. Learning science rationale for your recommendations

Consider principles like:
- Progressive complexity (Bloom's taxonomy)
- Cognitive load management
- Spaced repetition opportunities
- Active learning requirements
- Real-world application progression`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            optimized_sequence: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  order: { type: "number" },
                  lesson_title: { type: "string" },
                  duration_minutes: { type: "number" },
                  module_group: { type: "string" },
                  prerequisites: { type: "array", items: { type: "string" } },
                  learning_objectives: { type: "array", items: { type: "string" } }
                }
              }
            },
            pacing_recommendations: { type: "string" },
            missing_topics: { type: "array", items: { type: "string" } },
            learning_science_rationale: { type: "string" },
            estimated_total_duration: { type: "number" }
          }
        }
      });

      setOptimization(result);
    } catch (error) {
      console.error("Error optimizing structure:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          Course Structure Optimizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!optimization ? (
          <>
            <p className="text-sm text-slate-600">
              Paste your lesson titles (one per line) and AI will optimize the course structure based on learning science principles, suggesting ideal order, duration, and grouping.
            </p>

            <Textarea
              placeholder="Lesson 1&#10;Lesson 2&#10;Lesson 3&#10;..."
              value={lessonsInput}
              onChange={(e) => setLessonsInput(e.target.value)}
              className="min-h-24"
            />

            <Button
              onClick={optimizeStructure}
              disabled={isLoading || !lessonsInput.trim()}
              className="w-full bg-amber-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Optimize Structure
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900">Total Course Duration</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {optimization.estimated_total_duration} minutes
              </p>
              <p className="text-xs text-blue-800 mt-1">
                (~{Math.round(optimization.estimated_total_duration / 60)} hours)
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Optimized Lesson Sequence</h3>
              <div className="space-y-2">
                {optimization.optimized_sequence?.map((lesson, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-100 text-amber-800">
                            {lesson.order}
                          </Badge>
                          <h4 className="font-semibold text-slate-900">{lesson.lesson_title}</h4>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Duration: {lesson.duration_minutes}m | Module: {lesson.module_group}
                        </p>
                      </div>
                    </div>
                    {lesson.prerequisites?.length > 0 && (
                      <p className="text-xs text-slate-700 mt-1">
                        <span className="font-semibold">Prerequisites:</span> {lesson.prerequisites.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {optimization.missing_topics?.length > 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2">Potential Gaps</h3>
                <ul className="space-y-1">
                  {optimization.missing_topics?.map((topic, idx) => (
                    <li key={idx} className="text-sm text-yellow-900">
                      • {topic}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Pacing Recommendations</h3>
              <p className="text-sm text-green-900 whitespace-pre-wrap">
                {optimization.pacing_recommendations}
              </p>
            </div>

            <Button
              onClick={() => setOptimization(null)}
              variant="outline"
              className="w-full"
            >
              Optimize Another Course
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}