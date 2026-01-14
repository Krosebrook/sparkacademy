import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";
import { useAIGeneration, copyToClipboard } from "./AIGeneratorBase";

const OUTLINE_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    objectives: { type: "array", items: { type: "string" } },
    target_audience: { type: "string" },
    duration_hours: { type: "number" },
    lessons: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          duration_minutes: { type: "number" },
          key_concepts: { type: "array", items: { type: "string" } }
        }
      }
    }
  }
};

export default function CourseOutlineGenerator({ onOutlineGenerated }) {
  const [topic, setTopic] = useState("");
  const { isGenerating, result: outline, generateContent } = useAIGeneration();

  const generateOutline = async () => {
    if (!topic.trim()) {
      alert("Please enter a course topic");
      return;
    }

    try {
      const result = await generateContent(async () => {
        return await base44.integrations.Core.InvokeLLM({
        prompt: `Create a detailed course outline for the topic: "${topic}". Include: 1. Course overview and learning objectives, 2. 8-12 lesson titles with descriptions, 3. Key concepts covered in each lesson, 4. Estimated time per lesson, 5. Prerequisites if any, 6. Target audience`,
          response_json_schema: OUTLINE_JSON_SCHEMA
        });
      });
      
      if (onOutlineGenerated) {
        onOutlineGenerated(outline);
      }
    } catch (error) {
      alert("Failed to generate outline. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            AI Course Outline Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Course Topic</label>
            <Input
              placeholder="e.g., Advanced Python Programming, Digital Marketing Basics"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <Button
            onClick={generateOutline}
            disabled={isGenerating || !topic.trim()}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Outline...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Outline
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {outline && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-blue-50">
          <CardHeader>
            <CardTitle>{outline.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-2">
                <strong>Overview:</strong> {outline.description}
              </p>
            </div>

            <div>
              <strong className="text-sm">Learning Objectives:</strong>
              <ul className="mt-2 space-y-1">
                {outline.objectives?.map((obj, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex gap-2">
                    <span>•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-4 py-2">
              <div>
                <p className="text-xs text-slate-600"><strong>Target Audience:</strong></p>
                <p className="text-sm text-slate-700">{outline.target_audience}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600"><strong>Estimated Duration:</strong></p>
                <p className="text-sm text-slate-700">{outline.duration_hours} hours</p>
              </div>
            </div>

            <div>
              <strong className="text-sm">Course Lessons ({outline.lessons?.length}):</strong>
              <div className="mt-2 space-y-2">
                {outline.lessons?.map((lesson, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-slate-800">Lesson {idx + 1}: {lesson.title}</p>
                      <span className="text-xs text-slate-500">{lesson.duration_minutes}m</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{lesson.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {lesson.key_concepts?.map((concept, cidx) => (
                        <span key={cidx} className="inline-block bg-violet-100 text-violet-700 text-xs px-2 py-1 rounded">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => copyToClipboard(outline) && alert("Outline copied!")}
              variant="outline"
              className="w-full"
            >
              Copy Outline as JSON
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}