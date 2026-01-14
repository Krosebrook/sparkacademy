import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Briefcase, Copy } from "lucide-react";

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Manufacturing",
  "Education",
  "Real Estate",
  "Marketing",
  "Legal",
  "Nonprofit"
];

export default function DiverseScenarioGenerator() {
  const [lessonTopic, setLessonTopic] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [scenarios, setScenarios] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateScenarios = async () => {
    if (!lessonTopic.trim() || selectedIndustries.length === 0) return;
    setIsLoading(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate diverse real-world example scenarios for teaching: ${lessonTopic}

Create scenarios for these industries/contexts: ${selectedIndustries.join(", ")}

For each scenario, provide:
1. Industry/context
2. Real-world situation or challenge
3. How the lesson topic applies
4. Step-by-step solution or approach
5. Key takeaways
6. Discussion questions (2-3)
7. Difficulty level (beginner/intermediate/advanced)

Make scenarios concrete, relatable, and industry-specific. Focus on practical application and real-world relevance.`,
        response_json_schema: {
          type: "object",
          properties: {
            scenarios: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  industry: { type: "string" },
                  title: { type: "string" },
                  situation: { type: "string" },
                  application: { type: "string" },
                  solution: { type: "string" },
                  key_takeaways: { type: "array", items: { type: "string" } },
                  discussion_questions: { type: "array", items: { type: "string" } },
                  difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] }
                }
              }
            }
          }
        }
      });

      setScenarios(result.scenarios);
    } catch (error) {
      console.error("Error generating scenarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === "advanced") return "bg-red-100 text-red-800";
    if (difficulty === "intermediate") return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          Diverse Scenario Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!scenarios ? (
          <>
            <p className="text-sm text-slate-600">
              Generate industry-specific example scenarios that show how your lesson applies in real-world contexts.
            </p>

            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">
                Lesson Topic
              </label>
              <Textarea
                placeholder="e.g., 'Data Analysis and Decision Making' or 'Project Management'"
                value={lessonTopic}
                onChange={(e) => setLessonTopic(e.target.value)}
                className="min-h-20"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">
                Select Industries (choose 2-4)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INDUSTRIES.map(industry => (
                  <button
                    key={industry}
                    onClick={() => {
                      if (selectedIndustries.includes(industry)) {
                        setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
                      } else {
                        setSelectedIndustries([...selectedIndustries, industry]);
                      }
                    }}
                    className={`p-2 rounded-lg text-sm font-medium transition-all border-2 ${
                      selectedIndustries.includes(industry)
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={generateScenarios}
              disabled={isLoading || !lessonTopic.trim() || selectedIndustries.length === 0}
              className="w-full bg-blue-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating scenarios...
                </>
              ) : (
                <>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Generate Scenarios
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {scenarios.map((scenario, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{scenario.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{scenario.industry}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${getDifficultyColor(scenario.difficulty)}`}>
                      {scenario.difficulty}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-semibold text-slate-800">Situation</p>
                      <p className="text-slate-700">{scenario.situation}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">How It Applies</p>
                      <p className="text-slate-700">{scenario.application}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">Solution</p>
                      <p className="text-slate-700 whitespace-pre-wrap">{scenario.solution}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800 mb-1">Key Takeaways</p>
                      <ul className="space-y-0.5">
                        {scenario.key_takeaways?.map((takeaway, i) => (
                          <li key={i} className="text-slate-700">• {takeaway}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800 mb-1">Discussion Questions</p>
                      <ol className="space-y-0.5 list-decimal list-inside">
                        {scenario.discussion_questions?.map((q, i) => (
                          <li key={i} className="text-slate-700">{q}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setScenarios(null)}
              variant="outline"
              className="w-full"
            >
              Generate Different Scenarios
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}