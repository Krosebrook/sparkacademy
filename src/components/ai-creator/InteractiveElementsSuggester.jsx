import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Zap, Loader2, Users, MessageSquare, Target } from "lucide-react";

export default function InteractiveElementsSuggester({ onSuggestionsGenerated }) {
  const [lessonContent, setLessonContent] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSuggestions = async () => {
    if (!lessonContent) return;
    
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this lesson content and suggest interactive elements to boost engagement:

${lessonContent}

Generate specific, actionable suggestions for:
1. Discussion prompts and questions
2. Hands-on exercises and mini-projects
3. Interactive polls and surveys
4. Collaborative group activities
5. Gamification elements (challenges, milestones)
6. Real-world application scenarios
7. Peer review activities

Make suggestions specific to the content, ready to implement.`,
        response_json_schema: {
          type: "object",
          properties: {
            discussion_prompts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  prompt: { type: "string" },
                  type: { type: "string" },
                  timing: { type: "string" }
                }
              }
            },
            exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  difficulty: { type: "string" },
                  estimated_time: { type: "string" }
                }
              }
            },
            polls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  purpose: { type: "string" }
                }
              }
            },
            collaborative_activities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  activity: { type: "string" },
                  group_size: { type: "string" },
                  duration: { type: "string" },
                  deliverable: { type: "string" }
                }
              }
            },
            gamification_elements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  element: { type: "string" },
                  implementation: { type: "string" },
                  reward: { type: "string" }
                }
              }
            },
            real_world_scenarios: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scenario: { type: "string" },
                  challenge: { type: "string" },
                  learning_outcome: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSuggestions(result);
      if (onSuggestionsGenerated) onSuggestionsGenerated(result);
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Interactive Elements Suggester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Lesson Content</label>
          <Textarea
            value={lessonContent}
            onChange={(e) => setLessonContent(e.target.value)}
            placeholder="Paste your lesson content here to get interactive element suggestions..."
            className="bg-[#1a0a2e] font-mono h-32"
          />
        </div>

        <Button
          onClick={generateSuggestions}
          disabled={!lessonContent || isGenerating}
          className="btn-primary w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Suggestions...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Generate Interactive Elements
            </>
          )}
        </Button>

        {suggestions && (
          <div className="space-y-6 mt-6">
            {/* Discussion Prompts */}
            {suggestions.discussion_prompts?.length > 0 && (
              <div>
                <h3 className="font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Discussion Prompts
                </h3>
                <div className="space-y-3">
                  {suggestions.discussion_prompts.map((prompt, idx) => (
                    <div key={idx} className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-white">{prompt.prompt}</div>
                        <Badge variant="outline">{prompt.type}</Badge>
                      </div>
                      <div className="text-xs text-gray-400">
                        💡 Timing: {prompt.timing}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exercises */}
            {suggestions.exercises?.length > 0 && (
              <div>
                <h3 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Hands-on Exercises
                </h3>
                <div className="space-y-3">
                  {suggestions.exercises.map((exercise, idx) => (
                    <div key={idx} className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{exercise.title}</h4>
                        <div className="flex gap-2">
                          <Badge className="bg-orange-500/20 text-orange-300">{exercise.difficulty}</Badge>
                          <Badge variant="outline">{exercise.estimated_time}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300">{exercise.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Polls */}
            {suggestions.polls?.length > 0 && (
              <div>
                <h3 className="font-semibold text-blue-300 mb-3">Interactive Polls</h3>
                <div className="space-y-3">
                  {suggestions.polls.map((poll, idx) => (
                    <div key={idx} className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <div className="font-medium text-white mb-2">{poll.question}</div>
                      <div className="space-y-1 mb-2">
                        {poll.options?.map((option, oidx) => (
                          <div key={oidx} className="text-sm text-gray-400 pl-4">
                            ○ {option}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-blue-300">Purpose: {poll.purpose}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collaborative Activities */}
            {suggestions.collaborative_activities?.length > 0 && (
              <div>
                <h3 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Collaborative Activities
                </h3>
                <div className="space-y-3">
                  {suggestions.collaborative_activities.map((activity, idx) => (
                    <div key={idx} className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <div className="font-medium text-white mb-2">{activity.activity}</div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-gray-400 mb-2">
                        <div>Group: {activity.group_size}</div>
                        <div>Duration: {activity.duration}</div>
                        <div>Deliverable: {activity.deliverable}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gamification Elements */}
            {suggestions.gamification_elements?.length > 0 && (
              <div>
                <h3 className="font-semibold text-yellow-300 mb-3">Gamification Ideas</h3>
                <div className="space-y-3">
                  {suggestions.gamification_elements.map((element, idx) => (
                    <div key={idx} className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <div className="font-medium text-white mb-2">{element.element}</div>
                      <p className="text-sm text-gray-300 mb-2">{element.implementation}</p>
                      <div className="text-xs text-yellow-300">🏆 Reward: {element.reward}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real-World Scenarios */}
            {suggestions.real_world_scenarios?.length > 0 && (
              <div>
                <h3 className="font-semibold text-orange-300 mb-3">Real-World Scenarios</h3>
                <div className="space-y-3">
                  {suggestions.real_world_scenarios.map((scenario, idx) => (
                    <div key={idx} className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                      <div className="font-medium text-white mb-2">{scenario.scenario}</div>
                      <div className="text-sm text-gray-300 mb-2">
                        <span className="text-orange-300">Challenge:</span> {scenario.challenge}
                      </div>
                      <div className="text-xs text-gray-400">
                        📚 Learning Outcome: {scenario.learning_outcome}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}