import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PenTool, Copy } from "lucide-react";

export default function AIDescriptionGenerator({ courseTitle, courseCategory }) {
  const [topic, setTopic] = useState(courseTitle || "");
  const [description, setDescription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateDescription = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a compelling course description and marketing copy for:

Course Title: ${topic}
Category: ${courseCategory || "Not specified"}

Create:
1. Brief Course Summary (1-2 sentences, compelling hook)
2. What You'll Learn (3-4 key learning outcomes)
3. Who This Course is For (target audience)
4. Course Benefits (4-5 benefits)
5. Course Overview (2-3 sentences)
6. Long-form Description (engaging, benefit-focused, 200-300 words)

Make it persuasive, benefit-driven, and optimized for course enrollment.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            learning_outcomes: { type: "array", items: { type: "string" } },
            target_audience: { type: "string" },
            benefits: { type: "array", items: { type: "string" } },
            overview: { type: "string" },
            long_description: { type: "string" }
          }
        }
      });

      setDescription(result);
    } catch (error) {
      console.error("Error generating description:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="w-5 h-5 text-blue-600" />
          AI Course Description Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!description ? (
          <>
            <p className="text-sm text-slate-600">
              Generate compelling, marketing-focused course descriptions optimized for enrollment.
            </p>

            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">
                Course Title
              </label>
              <Textarea
                placeholder="Enter your course title..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-16"
              />
            </div>

            <Button
              onClick={generateDescription}
              disabled={isLoading || !topic.trim()}
              className="w-full bg-blue-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <PenTool className="w-4 h-4 mr-2" />
                  Generate Description
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-slate-900">Summary</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(description.summary)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">
                {description.summary}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">What You'll Learn</h3>
              <ul className="space-y-1">
                {description.learning_outcomes?.map((outcome, idx) => (
                  <li key={idx} className="text-sm text-slate-700">✓ {outcome}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Who This Course is For</h3>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">
                {description.target_audience}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Benefits</h3>
              <ul className="space-y-1">
                {description.benefits?.map((benefit, idx) => (
                  <li key={idx} className="text-sm text-slate-700">• {benefit}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-slate-900">Full Description</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(description.long_description)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-slate-700 bg-blue-50 p-3 rounded whitespace-pre-wrap">
                {description.long_description}
              </p>
            </div>

            <Button
              onClick={() => setDescription(null)}
              variant="outline"
              className="w-full"
            >
              Generate Another
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}