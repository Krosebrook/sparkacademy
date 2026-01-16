import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Video, Copy, Download } from "lucide-react";

export default function AIVideoScriptGenerator() {
  const [lessonInfo, setLessonInfo] = useState("");
  const [script, setScript] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateScript = async () => {
    if (!lessonInfo.trim()) return;
    setIsLoading(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create an engaging video script for this lesson:

      ${lessonInfo}

      Generate a professional video script with:

      1. Opening Hook (10-15 seconds) - Capture attention, preview what viewers will learn
      2. Learning Objectives (20 seconds) - State what viewers will know after watching
      3. Main Content (structured in sections):
      - Clear topic introduction
      - 2-3 key concepts/sections with explanations
      - Real-world examples or demonstrations
      - Visual cues for graphics/animations/demos
      4. Practice/Example (optional)
      5. Summary & Takeaways (15-20 seconds)
      6. Call to Action (5-10 seconds) - Next steps, quiz, etc.

      Include:
      - [VISUAL: description] for graphics/animations/demos
      - [PAUSE: X seconds] for thinking/note-taking
      - Tone: conversational, engaging, clear
      - Approximate total length`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            estimated_duration: { type: "string" },
            hook: { type: "string" },
            learning_objectives: { type: "array", items: { type: "string" } },
            main_content: { type: "string" },
            examples: { type: "array", items: { type: "string" } },
            visual_cues: { type: "array", items: { type: "string" } },
            summary: { type: "string" },
            call_to_action: { type: "string" },
            full_script: { type: "string" },
            presenter_notes: { type: "string" }
          }
        }
      });

      setScript(result);
    } catch (error) {
      console.error("Error generating script:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    const content = `${script.title}\nEstimated Duration: ${script.estimated_duration}\n\n${script.full_script}`;
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", `${script.title.replace(/\s+/g, "_")}_script.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5 text-red-600" />
          AI Video Script Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!script ? (
          <>
            <p className="text-sm text-slate-600">
              Provide lesson details and AI will create a complete video script with timing, visual cues, and presenter notes.
            </p>

            <Textarea
              placeholder="Enter lesson title and key points (e.g., 'Introduction to React Hooks - useState, useEffect, custom hooks')"
              value={lessonInfo}
              onChange={(e) => setLessonInfo(e.target.value)}
              className="min-h-24"
            />

            <Button
              onClick={generateScript}
              disabled={isLoading || !lessonInfo.trim()}
              className="w-full bg-red-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating script...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Generate Script
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="font-semibold text-slate-900">{script.title}</h3>
                <p className="text-xs text-slate-600">Duration: {script.estimated_duration}</p>
              </div>
              <Button
                size="sm"
                onClick={downloadScript}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Opening Hook</h4>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">{script.hook}</p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Learning Objectives</h4>
                <ul className="space-y-1">
                  {script.learning_objectives?.map((obj, idx) => (
                    <li key={idx} className="text-sm text-slate-700">• {obj}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Main Content</h4>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded whitespace-pre-wrap line-clamp-4">
                  {script.main_content}
                </p>
              </div>

              {script.visual_cues?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Visual Cues</h4>
                  <ul className="space-y-1">
                    {script.visual_cues?.slice(0, 3).map((cue, idx) => (
                      <li key={idx} className="text-xs text-slate-700 p-2 bg-blue-50 rounded">
                        [VISUAL] {cue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Summary</h4>
                <p className="text-sm text-slate-700 bg-green-50 p-3 rounded">{script.summary}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-slate-900">Full Script</h4>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(script.full_script)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded whitespace-pre-wrap line-clamp-5">
                  {script.full_script}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setScript(null)}
              variant="outline"
              className="w-full"
            >
              Generate Another Script
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}