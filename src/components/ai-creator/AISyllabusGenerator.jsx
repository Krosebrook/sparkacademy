import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2, Target, Clock } from "lucide-react";

export default function AISyllabusGenerator({ onSyllabusGenerated }) {
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [duration, setDuration] = useState("");
  const [syllabus, setSyllabus] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSyllabus = async () => {
    if (!topic) return;
    
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a comprehensive course syllabus for: "${topic}"

Target Audience: ${targetAudience || 'General learners'}
Course Duration: ${duration || 'Flexible'}

Generate:
1. Course title and compelling description
2. Clear learning objectives (5-8 objectives)
3. Detailed module breakdown with lessons
4. Estimated time for each module
5. Prerequisites if any
6. Assessment methods
7. Key skills students will gain`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            learning_objectives: {
              type: "array",
              items: { type: "string" }
            },
            modules: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  module_number: { type: "number" },
                  title: { type: "string" },
                  description: { type: "string" },
                  duration_hours: { type: "number" },
                  lessons: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            prerequisites: { type: "array", items: { type: "string" } },
            assessment_methods: { type: "array", items: { type: "string" } },
            skills_taught: { type: "array", items: { type: "string" } },
            difficulty_level: { type: "string" }
          }
        }
      });

      setSyllabus(result);
      if (onSyllabusGenerated) onSyllabusGenerated(result);
    } catch (error) {
      console.error("Failed to generate syllabus:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          AI Syllabus Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Course Topic</label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Introduction to Machine Learning"
            className="bg-[#1a0a2e]"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Target Audience</label>
            <Input
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Beginners, Professionals"
              className="bg-[#1a0a2e]"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Duration</label>
            <Input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 4 weeks, 20 hours"
              className="bg-[#1a0a2e]"
            />
          </div>
        </div>

        <Button
          onClick={generateSyllabus}
          disabled={!topic || isGenerating}
          className="btn-primary w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Syllabus...
            </>
          ) : (
            'Generate Course Syllabus'
          )}
        </Button>

        {syllabus && (
          <div className="space-y-4 mt-6">
            <div className="p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-2">{syllabus.title}</h3>
              <p className="text-gray-300 text-sm mb-3">{syllabus.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-purple-500/20 text-purple-300">{syllabus.difficulty_level}</Badge>
                <Badge className="bg-blue-500/20 text-blue-300">
                  <Clock className="w-3 h-3 mr-1" />
                  {syllabus.modules?.reduce((sum, m) => sum + (m.duration_hours || 0), 0)} hours
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Learning Objectives
              </h4>
              <ul className="space-y-1">
                {syllabus.learning_objectives?.map((obj, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-purple-300 mb-3">Course Modules</h4>
              <div className="space-y-3">
                {syllabus.modules?.map((module) => (
                  <div key={module.module_number} className="p-3 bg-[#0f0618]/50 rounded-lg border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-white">
                        Module {module.module_number}: {module.title}
                      </h5>
                      <Badge variant="outline">{module.duration_hours}h</Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{module.description}</p>
                    <div className="text-xs text-gray-500">
                      {module.lessons?.length || 0} lessons
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-300 mb-2">Skills Taught</h4>
                <div className="flex flex-wrap gap-2">
                  {syllabus.skills_taught?.map((skill, idx) => (
                    <Badge key={idx} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-orange-300 mb-2">Assessment Methods</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {syllabus.assessment_methods?.map((method, idx) => (
                    <li key={idx}>• {method}</li>
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