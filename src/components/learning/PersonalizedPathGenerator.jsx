import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Target, Sparkles, CheckCircle2, Clock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import KnowledgeAssessmentQuiz from "./KnowledgeAssessmentQuiz";
import LearningPathVisualizer from "./LearningPathVisualizer";

export default function PersonalizedPathGenerator() {
  const [step, setStep] = useState(1); // 1: goals, 2: assessment, 3: path
  const [goals, setGoals] = useState({ career_goal: "", skills_wanted: "", timeline: "" });
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAssessmentComplete = (results) => {
    setAssessmentResults(results);
    setStep(3);
    generatePersonalizedPath(results);
  };

  const generatePersonalizedPath = async (assessment) => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      
      // Fetch all published courses
      const courses = await base44.entities.Course.filter({ is_published: true });
      
      // AI: Generate personalized learning path
      const pathData = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a personalized learning path for this student:

**Student Profile:**
- Career Goal: ${goals.career_goal}
- Skills Wanted: ${goals.skills_wanted}
- Timeline: ${goals.timeline}
- Current Knowledge Level: ${assessment.level} (based on assessment)
- Assessment Score: ${assessment.score}% on ${assessment.topic}

**Available Courses:**
${courses.map(c => `- "${c.title}" (${c.category}, ${c.level}) - ${c.description?.substring(0, 100)}...`).join('\n')}

**Task:**
1. Analyze the student's goals and current knowledge
2. Select the most relevant courses from the available list
3. Order them in an optimal learning sequence
4. For each course, explain why it's recommended and what skills it develops
5. Add milestones and expected timelines
6. Suggest supplementary resources (books, videos, projects)
7. Identify potential challenges and how to overcome them

**Output Requirements:**
- Start with courses matching their current level (${assessment.level})
- Progress to more advanced content gradually
- Align with their career goal: ${goals.career_goal}
- Respect their timeline: ${goals.timeline}`,
        response_json_schema: {
          type: "object",
          properties: {
            learning_style: { type: "string", enum: ["visual", "auditory", "kinesthetic", "reading_writing", "mixed"] },
            current_level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
            recommended_lessons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  lesson_order: { type: "number" },
                  lesson_title: { type: "string" },
                  course_id: { type: "string" },
                  reason: { type: "string" },
                  skills_gained: { type: "array", items: { type: "string" } },
                  estimated_hours: { type: "number" },
                  difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                  completed: { type: "boolean", default: false }
                }
              }
            },
            milestones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  timeline_weeks: { type: "number" },
                  courses_included: { type: "array", items: { type: "string" } }
                }
              }
            },
            supplementary_resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  url: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            potential_challenges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  challenge: { type: "string" },
                  solution: { type: "string" }
                }
              }
            },
            next_recommended_lesson: { type: "string" },
            personalization_score: { type: "number" }
          }
        }
      });

      // Create StudentLearningPath entity
      const savedPath = await base44.entities.StudentLearningPath.create({
        student_email: user.email,
        course_id: pathData.recommended_lessons?.[0]?.course_id || null,
        recommended_lessons: pathData.recommended_lessons,
        learning_style: pathData.learning_style,
        current_level: pathData.current_level,
        next_recommended_lesson: pathData.next_recommended_lesson,
        personalization_score: pathData.personalization_score,
        is_active: true
      });

      setLearningPath({ ...pathData, id: savedPath.id });

    } catch (error) {
      console.error("Error generating path:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === 1 && (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-cyan-400" />
              Your Learning Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-300 block mb-2">
                What's your career goal?
              </label>
              <Input
                placeholder="e.g., Become a Full-Stack Developer"
                value={goals.career_goal}
                onChange={(e) => setGoals({ ...goals, career_goal: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-300 block mb-2">
                What skills do you want to learn?
              </label>
              <Textarea
                placeholder="e.g., JavaScript, React, Node.js, Database Design"
                value={goals.skills_wanted}
                onChange={(e) => setGoals({ ...goals, skills_wanted: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-300 block mb-2">
                What's your timeline?
              </label>
              <Select value={goals.timeline} onValueChange={(val) => setGoals({ ...goals, timeline: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-3 months">1-3 months</SelectItem>
                  <SelectItem value="3-6 months">3-6 months</SelectItem>
                  <SelectItem value="6-12 months">6-12 months</SelectItem>
                  <SelectItem value="1+ years">1+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!goals.career_goal || !goals.skills_wanted || !goals.timeline}
              className="w-full btn-primary"
            >
              Next: Take Assessment
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div>
          <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              📝 <strong>Quick Assessment:</strong> Help us understand your current knowledge level. This will take about 5 minutes.
            </p>
          </div>
          <KnowledgeAssessmentQuiz
            topic={goals.skills_wanted.split(',')[0]?.trim() || "General Programming"}
            onComplete={handleAssessmentComplete}
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          {isLoading ? (
            <Card className="card-glow">
              <CardContent className="text-center py-12">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-cyan-400" />
                <p className="text-lg text-gray-300">Generating your personalized learning path...</p>
                <p className="text-sm text-gray-500 mt-2">Analyzing courses, sequencing content, and creating milestones</p>
              </CardContent>
            </Card>
          ) : learningPath ? (
            <>
              {/* Path Overview */}
              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    Your Personalized Learning Path
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-3 bg-[#0f0618] rounded-lg border border-cyan-500/20">
                      <div className="text-xs text-gray-400">Current Level</div>
                      <div className="text-lg font-bold text-cyan-400 capitalize">{learningPath.current_level}</div>
                    </div>
                    <div className="p-3 bg-[#0f0618] rounded-lg border border-magenta-500/20">
                      <div className="text-xs text-gray-400">Learning Style</div>
                      <div className="text-lg font-bold text-magenta-400 capitalize">{learningPath.learning_style}</div>
                    </div>
                    <div className="p-3 bg-[#0f0618] rounded-lg border border-orange-500/20">
                      <div className="text-xs text-gray-400">Personalization</div>
                      <div className="text-lg font-bold text-orange-400">{learningPath.personalization_score}/100</div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div>
                    <h3 className="font-semibold text-cyan-300 mb-3">Learning Milestones</h3>
                    <div className="space-y-3">
                      {learningPath.milestones?.map((milestone, idx) => (
                        <div key={idx} className="p-3 bg-[#0f0618] rounded-lg border border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-white">{milestone.title}</span>
                            <Badge className="bg-blue-900 text-blue-300">
                              <Clock className="w-3 h-3 mr-1" />
                              {milestone.timeline_weeks} weeks
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">{milestone.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Visualized Path */}
              <LearningPathVisualizer learningPath={learningPath} />

              {/* Recommended Courses */}
              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-400" />
                    Recommended Course Sequence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {learningPath.recommended_lessons?.map((lesson, idx) => (
                      <div key={idx} className="p-4 bg-[#0f0618] rounded-lg border border-gray-700 hover:border-cyan-500/30 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-sm text-cyan-400 font-semibold flex-shrink-0 mt-1">
                              {lesson.lesson_order}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white mb-1">{lesson.lesson_title}</h4>
                              <p className="text-sm text-gray-400 mb-2">{lesson.reason}</p>
                              <div className="flex flex-wrap gap-2">
                                {lesson.skills_gained?.map((skill, i) => (
                                  <Badge key={i} className="bg-purple-900/30 text-purple-300">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={`
                              ${lesson.difficulty === 'advanced' ? 'bg-red-900 text-red-300' : 
                                lesson.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-300' : 
                                'bg-green-900 text-green-300'}
                            `}>
                              {lesson.difficulty}
                            </Badge>
                            <span className="text-xs text-gray-500">{lesson.estimated_hours}h</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Supplementary Resources */}
              {learningPath.supplementary_resources?.length > 0 && (
                <Card className="card-glow">
                  <CardHeader>
                    <CardTitle>Supplementary Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {learningPath.supplementary_resources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-[#0f0618] rounded-lg border border-gray-700 hover:border-magenta-500/30 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                            <span className="font-semibold text-sm text-white">{resource.title}</span>
                          </div>
                          <p className="text-xs text-gray-400">{resource.description}</p>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Challenges & Solutions */}
              {learningPath.potential_challenges?.length > 0 && (
                <Card className="card-glow">
                  <CardHeader>
                    <CardTitle>Potential Challenges & Solutions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {learningPath.potential_challenges.map((item, idx) => (
                        <div key={idx} className="p-3 bg-orange-900/10 rounded-lg border border-orange-500/30">
                          <p className="text-sm font-semibold text-orange-300 mb-1">⚠️ {item.challenge}</p>
                          <p className="text-sm text-gray-400">💡 {item.solution}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button onClick={() => { setStep(1); setLearningPath(null); }} variant="outline" className="w-full">
                Create New Learning Path
              </Button>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}