import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, BookOpen, Wand2 } from "lucide-react";

export default function AILessonDrafter() {
  const [outline, setOutline] = useState("");
  const [draftedLesson, setDraftedLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const draftLesson = async () => {
    if (!outline.trim()) return;
    setIsLoading(true);

    try {
      const prompt = `Create a comprehensive lesson module based on this outline:

${outline}

Structure the lesson with:
1. Learning Objectives (2-3 clear, measurable objectives)
2. Introduction with hook/relevance
3. Core Content Explanation (clear, detailed, beginner-friendly)
4. Real-world Examples (3-4 practical, relatable examples)
5. Step-by-Step Practice Exercises (2-3 exercises of increasing difficulty)
6. Common Mistakes to Avoid (key pitfalls and how to avoid them)
7. Key Takeaways summary
8. Additional Resources and Further Learning

Make it engaging, practical, and suitable for self-paced online learning.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            learning_objectives: { type: "array", items: { type: "string" } },
            introduction: { type: "string" },
            core_content: { type: "string" },
            examples: { type: "array", items: { type: "string" } },
            exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            },
            common_mistakes: { type: "array", items: { type: "string" } },
            key_takeaways: { type: "array", items: { type: "string" } },
            further_resources: { type: "array", items: { type: "string" } }
          }
        }
      });

      setDraftedLesson(result);
    } catch (error) {
      console.error("Error drafting lesson:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-600" />
          AI Lesson Module Drafter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!draftedLesson ? (
          <>
            <p className="text-sm text-slate-600">
              Provide a lesson outline or topic, and AI will draft a complete, structured lesson module with content, examples, and exercises.
            </p>

            <Textarea
              placeholder="Paste your lesson outline or topic (e.g., 'Introduction to React Hooks - useState, useEffect, custom hooks')"
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              className="min-h-24"
            />

            <Button
              onClick={draftLesson}
              disabled={isLoading || !outline.trim()}
              className="w-full bg-purple-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Drafting lesson...
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Draft Lesson
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Learning Objectives</h3>
              <ul className="space-y-1">
                {draftedLesson.learning_objectives?.map((obj, idx) => (
                  <li key={idx} className="text-sm text-slate-700">• {obj}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Introduction</h3>
              <p className="text-sm text-slate-700">{draftedLesson.introduction}</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Core Content</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{draftedLesson.core_content}</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Examples</h3>
              <ul className="space-y-1">
                {draftedLesson.examples?.map((ex, idx) => (
                  <li key={idx} className="text-sm text-slate-700 p-2 bg-slate-50 rounded">
                    <strong>Example {idx + 1}:</strong> {ex}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Practice Exercises</h3>
              <div className="space-y-2">
                {draftedLesson.exercises?.map((ex, idx) => (
                  <div key={idx} className="p-2 bg-purple-50 rounded border border-purple-200">
                    <p className="font-semibold text-sm">{ex.title}</p>
                    <p className="text-xs text-slate-600 mt-1">{ex.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setDraftedLesson(null)}
              variant="outline"
              className="w-full"
            >
              Draft Another Lesson
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}