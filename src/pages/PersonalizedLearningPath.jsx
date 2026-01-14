import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KnowledgeAssessmentQuiz from "@/components/learning/KnowledgeAssessmentQuiz";
import LearningPathVisualizer from "@/components/learning/LearningPathVisualizer";

export default function PersonalizedLearningPath() {
  const [user, setUser] = useState(null);
  const [learningGoal, setLearningGoal] = useState("");
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [assessmentData, setAssessmentData] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Try to load existing path
      const paths = await base44.entities.StudentLearningPath.filter({
        student_email: userData.email
      });
      if (paths.length > 0) {
        setLearningPath(paths[0]);
        setAssessmentComplete(true);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleAssessmentComplete = async (data) => {
    setAssessmentData(data);
    setAssessmentComplete(true);
    await generateLearningPath(data);
  };

  const generateLearningPath = async (quizData) => {
    if (!user || !learningGoal) return;
    setIsGeneratingPath(true);

    try {
      const courses = await base44.entities.Course.filter({
        is_published: true
      });

      const prompt = `Create a personalized learning path for a student with these characteristics:

Goal: ${learningGoal}
Knowledge Level: ${quizData.score}% (${quizData.correctAnswers}/${quizData.totalQuestions})
Skill Level: ${quizData.score > 70 ? 'advanced' : quizData.score > 40 ? 'intermediate' : 'beginner'}

Available Courses:
${courses.map(c => `- ${c.title} (${c.category}, ${c.level})`).join("\n")}

Generate:
1. Recommended learning sequence (courses and lessons)
2. 5-8 specific recommended lessons with:
   - Lesson title
   - Course it's from
   - Why it's recommended for this student
   - Confidence score (0-1) of match quality
3. Detected learning style (visual, auditory, kinesthetic, reading_writing, mixed)
4. Overall personalization score (0-100)
5. Next recommended lesson to start with

Make recommendations based on:
- Student's current knowledge level
- Logical skill progression
- Goal alignment
- Variety in content formats`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            learning_style: { type: "string" },
            current_level: { type: "string" },
            next_recommended_lesson: { type: "string" },
            personalization_score: { type: "number" },
            recommended_lessons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  lesson_title: { type: "string" },
                  lesson_order: { type: "number" },
                  reason: { type: "string" },
                  confidence_score: { type: "number" },
                  difficulty: { type: "string" },
                  completed: { type: "boolean", default: false }
                }
              }
            }
          }
        }
      });

      // Save learning path
      const pathData = await base44.entities.StudentLearningPath.create({
        student_email: user.email,
        course_id: "personalized",
        learning_style: result.learning_style,
        current_level: result.current_level,
        next_recommended_lesson: result.next_recommended_lesson,
        personalization_score: result.personalization_score,
        recommended_lessons: result.recommended_lessons,
        is_active: true
      });

      setLearningPath(pathData);
    } catch (error) {
      console.error("Error generating path:", error);
    } finally {
      setIsGeneratingPath(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Your Learning Path
          </h1>
          <p className="text-slate-600">
            Get personalized course recommendations based on your goals and knowledge level.
          </p>
        </div>

        {!assessmentComplete ? (
          <div className="max-w-2xl">
            <div className="space-y-4 mb-6">
              <label className="block">
                <span className="text-sm font-semibold text-slate-900 block mb-2">
                  What would you like to learn?
                </span>
                <input
                  type="text"
                  placeholder="e.g., 'Master React and build web applications'"
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            {learningGoal && <KnowledgeAssessmentQuiz topic={learningGoal} onComplete={handleAssessmentComplete} />}
          </div>
        ) : isGeneratingPath ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600">Creating your personalized learning path...</p>
            </div>
          </div>
        ) : learningPath ? (
          <Tabs defaultValue="path" className="space-y-4">
            <TabsList>
              <TabsTrigger value="path">Learning Path</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="path">
              <LearningPathVisualizer path={learningPath} />
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Your Goal</h3>
                <p className="text-slate-700">{learningGoal}</p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">Assessment Results</h3>
                <p className="text-sm text-slate-700">
                  Score: <span className="font-semibold">{assessmentData?.score}%</span>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}
      </div>
    </div>
  );
}