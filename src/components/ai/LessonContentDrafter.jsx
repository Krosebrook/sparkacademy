import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2 } from "lucide-react";
import { useAIGeneration, copyToClipboard } from "./AIGeneratorBase";

const CONTENT_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    introduction: { type: "string" },
    concepts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          explanation: { type: "string" },
          example: { type: "string" }
        }
      }
    },
    exercises: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          solution: { type: "string" }
        }
      }
    },
    key_takeaways: { type: "array", items: { type: "string" } },
    misconceptions: { type: "array", items: { type: "string" } }
  }
};

export default function LessonContentDrafter({ onContentGenerated }) {
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonTopic, setLessonTopic] = useState("");
  const { isGenerating, result: content, generateContent } = useAIGeneration();

  const handleGenerateContent = async () => {
    if (!lessonTitle.trim() || !lessonTopic.trim()) {
      alert("Please fill in both lesson title and topic");
      return;
    }

    try {
      const result = await generateContent(async () => {
        return await base44.integrations.Core.InvokeLLM({
        prompt: `Create comprehensive lesson content for: Lesson Title: "${lessonTitle}", Topic: "${lessonTopic}". Include: 1. Lesson introduction (2-3 paragraphs), 2. 3-4 main concepts with detailed explanations, 3. Real-world examples for each concept, 4. 3-4 practice exercises with solutions, 5. Key takeaways, 6. Common misconceptions to avoid`,
          response_json_schema: CONTENT_JSON_SCHEMA
        });
      });
      
      if (onContentGenerated) {
        onContentGenerated(content);
      }
    } catch (error) {
      alert("Failed to generate lesson content. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-blue-600" />
            AI Lesson Content Drafter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Lesson Title</label>
            <Input
              placeholder="e.g., Introduction to Functions, Data Types Fundamentals"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Lesson Topic/Description</label>
            <Textarea
              placeholder="Describe what you want to teach in this lesson. Include specific skills or knowledge areas."
              value={lessonTopic}
              onChange={(e) => setLessonTopic(e.target.value)}
              disabled={isGenerating}
              rows={4}
            />
          </div>

          <Button
            onClick={handleGenerateContent}
            disabled={isGenerating || !lessonTitle.trim() || !lessonTopic.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Drafting Content...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Lesson Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {content && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle>{content.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Introduction</h4>
              <p className="text-slate-700 whitespace-pre-wrap">{content.introduction}</p>
            </div>

            {content.concepts?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Core Concepts</h4>
                <div className="space-y-3">
                  {content.concepts.map((concept, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200">
                      <h5 className="font-semibold text-blue-700 mb-2">{concept.name}</h5>
                      <p className="text-sm text-slate-700 mb-2">{concept.explanation}</p>
                      <div className="bg-blue-50 rounded p-2 text-sm text-slate-700">
                        <strong>Example:</strong> {concept.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content.exercises?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Practice Exercises</h4>
                <div className="space-y-3">
                  {content.exercises.map((exercise, idx) => (
                    <details key={idx} className="bg-white rounded-lg p-4 border border-slate-200">
                      <summary className="cursor-pointer font-semibold text-slate-800">
                        Exercise {idx + 1}: {exercise.question}
                      </summary>
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-sm text-slate-700"><strong>Solution:</strong></p>
                        <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{exercise.solution}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {content.key_takeaways?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Key Takeaways</h4>
                <ul className="space-y-1">
                  {content.key_takeaways.map((takeaway, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex gap-2">
                      <span>✓</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {content.misconceptions?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Common Misconceptions</h4>
                <ul className="space-y-1">
                  {content.misconceptions.map((misconception, idx) => (
                    <li key={idx} className="text-sm text-yellow-800 flex gap-2">
                      <span>⚠</span>
                      <span>{misconception}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={() => copyToClipboard(content) && alert("Content copied!")}
              variant="outline"
              className="w-full"
            >
              Copy Content as JSON
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}