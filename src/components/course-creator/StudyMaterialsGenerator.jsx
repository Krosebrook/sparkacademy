import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BookMarked, Download, Copy } from "lucide-react";

export default function StudyMaterialsGenerator() {
  const [lessonContent, setLessonContent] = useState("");
  const [materials, setMaterials] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateMaterials = async () => {
    if (!lessonContent.trim()) return;
    setIsLoading(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create comprehensive study materials from this lesson content:

${lessonContent}

Generate:

1. FLASHCARDS (10-15 cards with key concepts):
   - Front: Key term or concept
   - Back: Definition, explanation, or memory tip

2. STUDY GUIDE (structured, scannable format):
   - Key concepts (bulleted)
   - Main ideas with explanations
   - Important facts to remember
   - Common misconceptions
   - Summary of main points

3. CHEAT SHEET (one-page reference):
   - Essential formulas, definitions, or processes
   - Visual diagrams/ASCII art where helpful
   - Quick reference for key points
   - Common terms and definitions

4. PRACTICE QUESTIONS (10 questions):
   - Mix of types: fill-in-the-blank, short answer, concept application
   - Include answers with brief explanations

Make materials concise, clear, and optimized for efficient studying.`,
        response_json_schema: {
          type: "object",
          properties: {
            flashcards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  front: { type: "string" },
                  back: { type: "string" }
                }
              }
            },
            study_guide: {
              type: "object",
              properties: {
                key_concepts: { type: "array", items: { type: "string" } },
                main_ideas: { type: "array", items: { type: "string" } },
                important_facts: { type: "array", items: { type: "string" } },
                common_misconceptions: { type: "array", items: { type: "string" } },
                summary: { type: "string" }
              }
            },
            cheat_sheet: { type: "string" },
            practice_questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      setMaterials(result);
    } catch (error) {
      console.error("Error generating materials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsText = (content, filename) => {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-green-600" />
          Study Materials Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!materials ? (
          <>
            <p className="text-sm text-slate-600">
              Generate flashcards, study guides, cheat sheets, and practice questions from your lesson content.
            </p>

            <Textarea
              placeholder="Paste your lesson content here..."
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              className="min-h-32"
            />

            <Button
              onClick={generateMaterials}
              disabled={isLoading || !lessonContent.trim()}
              className="w-full bg-green-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating materials...
                </>
              ) : (
                <>
                  <BookMarked className="w-4 h-4 mr-2" />
                  Generate Study Materials
                </>
              )}
            </Button>
          </>
        ) : (
          <Tabs defaultValue="flashcards" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="flashcards">Cards</TabsTrigger>
              <TabsTrigger value="guide">Guide</TabsTrigger>
              <TabsTrigger value="cheat">Cheat</TabsTrigger>
              <TabsTrigger value="practice">Practice</TabsTrigger>
            </TabsList>

            <TabsContent value="flashcards" className="max-h-96 overflow-y-auto space-y-2">
              {materials.flashcards?.map((card, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-slate-600">Card {idx + 1}</span>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`${card.front}\n\n${card.back}`)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-blue-50 rounded">
                      <p className="text-xs text-slate-600 mb-1">Front</p>
                      <p className="font-semibold text-slate-900 text-sm">{card.front}</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <p className="text-xs text-slate-600 mb-1">Back</p>
                      <p className="text-sm text-slate-700">{card.back}</p>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                onClick={() => downloadAsText(
                  materials.flashcards?.map(c => `Q: ${c.front}\nA: ${c.back}`).join("\n\n---\n\n"),
                  "flashcards.txt"
                )}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All Cards
              </Button>
            </TabsContent>

            <TabsContent value="guide" className="max-h-96 overflow-y-auto space-y-3">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Key Concepts</h4>
                <ul className="space-y-1">
                  {materials.study_guide?.key_concepts?.map((concept, idx) => (
                    <li key={idx} className="text-sm text-slate-700">• {concept}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Main Ideas</h4>
                <ul className="space-y-1">
                  {materials.study_guide?.main_ideas?.map((idea, idx) => (
                    <li key={idx} className="text-sm text-slate-700">✓ {idea}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Important Facts</h4>
                <ul className="space-y-1">
                  {materials.study_guide?.important_facts?.map((fact, idx) => (
                    <li key={idx} className="text-sm text-slate-700">★ {fact}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Common Misconceptions</h4>
                <ul className="space-y-1">
                  {materials.study_guide?.common_misconceptions?.map((misc, idx) => (
                    <li key={idx} className="text-sm text-red-700">✗ {misc}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-slate-900 mb-2">Summary</p>
                <p className="text-sm text-slate-700">{materials.study_guide?.summary}</p>
              </div>
            </TabsContent>

            <TabsContent value="cheat" className="max-h-96 overflow-y-auto">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-slate-900">One-Page Reference</span>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(materials.cheat_sheet)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap font-mono text-slate-700">
                  {materials.cheat_sheet}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="practice" className="max-h-96 overflow-y-auto space-y-2">
              {materials.practice_questions?.map((q, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <p className="font-semibold text-slate-900 text-sm">Q{idx + 1}. {q.question}</p>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(q.question + "\n\n" + q.answer)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 bg-green-50 rounded">
                      <p className="text-xs text-slate-600 font-semibold mb-1">Answer</p>
                      <p className="text-sm text-slate-700">{q.answer}</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <p className="text-xs text-slate-600 font-semibold mb-1">Explanation</p>
                      <p className="text-sm text-slate-700">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}