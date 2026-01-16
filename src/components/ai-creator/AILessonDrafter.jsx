import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Loader2, Copy } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function AILessonDrafter({ onLessonDrafted }) {
  const [lessonTopic, setLessonTopic] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [style, setStyle] = useState("conversational");
  const [content, setContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLesson = async () => {
    if (!lessonTopic) return;
    
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Draft comprehensive lesson content for: "${lessonTopic}"

Difficulty Level: ${difficulty}
Teaching Style: ${style}

Create engaging lesson content with:
1. Clear introduction with learning objectives
2. Detailed explanations with real-world context
3. Multiple practical examples
4. Helpful analogies to explain complex concepts
5. Key takeaways and summary
6. Practice exercises or discussion questions

Make it ${style}, suitable for ${difficulty} learners. Use markdown formatting.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            duration_minutes: { type: "number" },
            learning_objectives: { type: "array", items: { type: "string" } },
            content: { type: "string" },
            examples: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            analogies: { type: "array", items: { type: "string" } },
            key_takeaways: { type: "array", items: { type: "string" } },
            practice_questions: { type: "array", items: { type: "string" } }
          }
        }
      });

      setContent(result);
      if (onLessonDrafted) onLessonDrafted(result);
    } catch (error) {
      console.error("Failed to generate lesson:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-400" />
          AI Lesson Content Drafter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Lesson Topic</label>
          <Input
            value={lessonTopic}
            onChange={(e) => setLessonTopic(e.target.value)}
            placeholder="e.g., Understanding Neural Networks"
            className="bg-[#1a0a2e]"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Difficulty</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="bg-[#1a0a2e]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Teaching Style</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="bg-[#1a0a2e]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conversational">Conversational</SelectItem>
                <SelectItem value="formal">Formal/Academic</SelectItem>
                <SelectItem value="practical">Practical/Hands-on</SelectItem>
                <SelectItem value="storytelling">Storytelling</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={generateLesson}
          disabled={!lessonTopic || isGenerating}
          className="btn-primary w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Drafting Lesson...
            </>
          ) : (
            'Generate Lesson Content'
          )}
        </Button>

        {content && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{content.title}</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(content.content)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>

            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Duration: {content.duration_minutes} minutes</div>
              <div>
                <h4 className="font-semibold text-blue-300 mb-2">Learning Objectives:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {content.learning_objectives?.map((obj, idx) => (
                    <li key={idx}>• {obj}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-[#0f0618]/50 rounded-lg prose prose-invert max-w-none">
              <ReactMarkdown>{content.content}</ReactMarkdown>
            </div>

            {content.examples?.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-300 mb-3">Examples</h4>
                <div className="space-y-2">
                  {content.examples.map((example, idx) => (
                    <div key={idx} className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <h5 className="font-medium text-white mb-1">{example.title}</h5>
                      <p className="text-sm text-gray-300">{example.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content.analogies?.length > 0 && (
              <div>
                <h4 className="font-semibold text-purple-300 mb-3">Helpful Analogies</h4>
                <div className="space-y-2">
                  {content.analogies.map((analogy, idx) => (
                    <div key={idx} className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-sm text-gray-300">
                      {analogy}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-cyan-300 mb-2">Key Takeaways</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {content.key_takeaways?.map((item, idx) => (
                    <li key={idx}>✓ {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-orange-300 mb-2">Practice Questions</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {content.practice_questions?.map((q, idx) => (
                    <li key={idx}>{idx + 1}. {q}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}