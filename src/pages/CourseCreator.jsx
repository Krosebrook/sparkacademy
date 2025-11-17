import React, { useState } from "react";
import { Course } from "@/entities/Course";
import { User } from "@/entities/User";
import { base44 } from "@/api/base44Client";
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, BookOpen, Route } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CoursePromptForm from "../components/course-creator/CoursePromptForm";
import GeneratedCoursePreview from "../components/course-creator/GeneratedCoursePreview";
import LearningPathPromptForm from "../components/course-creator/LearningPathPromptForm";
import GeneratedPathPreview from "../components/course-creator/GeneratedPathPreview";

export default function CourseCreator() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("course");
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const [generatedPath, setGeneratedPath] = useState(null);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      User.loginWithRedirect(window.location.href);
    }
  };

  const generateCourse = async (promptData) => {
    setIsGenerating(true);
    
    try {
      const coursePrompt = `Create a comprehensive online course about "${promptData.topic}".
        
        Requirements:
        - Target audience: ${promptData.audience}
        - Difficulty level: ${promptData.level}
        - Course duration: ${promptData.duration} hours
        - Category: ${promptData.category}
        
        Please create a detailed course structure with:
        1. An engaging course title and description
        2. Learning objectives
        3. At least 5-8 lessons with detailed content
        4. Each lesson should include title, content (in HTML format), and estimated duration in minutes
        
        Make the content practical, engaging, and valuable. Include examples, exercises, and actionable insights.`;

      const courseData = await InvokeLLM({
        prompt: coursePrompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            lessons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  duration_minutes: { type: "number" }
                }
              }
            }
          }
        }
      });

      const thumbnailPrompt = `Create a professional, modern course thumbnail for "${courseData.title}". 
        The image should be clean, minimalist, and appealing to online learners. 
        Style: modern, professional, educational, high-quality, no text overlay.`;
      
      const thumbnail = await GenerateImage({ prompt: thumbnailPrompt });

      const lessonsWithOrder = courseData.lessons.map((lesson, index) => ({
        ...lesson,
        order: index + 1
      }));

      const totalDuration = lessonsWithOrder.reduce((sum, lesson) => sum + lesson.duration_minutes, 0) / 60;

      setGeneratedCourse({
        ...courseData,
        lessons: lessonsWithOrder,
        thumbnail_url: thumbnail.url,
        category: promptData.category,
        level: promptData.level,
        duration_hours: totalDuration,
        instructor_name: user?.full_name || "Course Creator",
        instructor_bio: `Experienced instructor passionate about ${promptData.topic}`,
        instructor_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
      });

      setStep(2);
    } catch (error) {
      console.error("Error generating course:", error);
      alert("Error generating course. Please try again.");
    }
    
    setIsGenerating(false);
  };

  const generatePath = async (promptData) => {
    setIsGenerating(true);
    
    try {
      const allCourses = await base44.entities.Course.filter({ is_published: true });

      const pathPrompt = `Create a comprehensive learning path for: "${promptData.goal}"

Requirements:
- Path Type: ${promptData.type}
- Current Level: ${promptData.currentLevel}
- Timeframe: ${promptData.timeframe}

AVAILABLE INTERNAL COURSES:
${allCourses.map(c => `- ${c.title} (${c.category}, ${c.level}) - Skills: ${c.skills_taught?.join(", ") || "General"}`).join("\n")}

Generate a structured learning path with:
1. Path name, description, and overview
2. 4-6 sequential milestones with clear progression
3. For each milestone include:
   - Title, description, and duration
   - 1-3 internal courses (from available courses above)
   - 3-5 curated external resources (with realistic URLs)
   - Prerequisites for courses
   - Skills gained at this stage
4. Overall skills gained and career outcomes
5. Estimated weeks for the entire path

Ensure logical progression from basics to advanced concepts.`;

      const pathData = await base44.integrations.Core.InvokeLLM({
        prompt: pathPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            path_name: { type: "string" },
            description: { type: "string" },
            overview: { type: "string" },
            difficulty: { type: "string" },
            estimated_weeks: { type: "number" },
            milestones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  duration: { type: "string" },
                  internal_courses: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        reason: { type: "string" },
                        prerequisites: { type: "array", items: { type: "string" } }
                      }
                    }
                  },
                  external_resources: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        type: { type: "string" },
                        url: { type: "string" },
                        duration: { type: "string" },
                        purpose: { type: "string" }
                      }
                    }
                  },
                  skills_gained: { type: "array", items: { type: "string" } }
                }
              }
            },
            skills_gained: { type: "array", items: { type: "string" } },
            career_outcomes: { type: "string" }
          }
        }
      });

      const enrichedPath = {
        ...pathData,
        milestones: pathData.milestones.map(milestone => ({
          ...milestone,
          internal_courses: milestone.internal_courses.map(ic => {
            const course = allCourses.find(c => 
              c.title.toLowerCase().includes(ic.title.toLowerCase()) ||
              ic.title.toLowerCase().includes(c.title.toLowerCase())
            );
            return { ...ic, course_id: course?.id };
          })
        }))
      };

      setGeneratedPath(enrichedPath);
      setStep(2);
    } catch (error) {
      console.error("Error generating path:", error);
      alert("Error generating learning path. Please try again.");
    }
    
    setIsGenerating(false);
  };

  const saveCourse = async () => {
    try {
      const newCourse = await Course.create(generatedCourse);
      navigate(createPageUrl(`CourseEditor?id=${newCourse.id}`));
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Error saving course. Please try again.");
    }
  };

  const savePath = async () => {
    try {
      await base44.entities.LearningPath.create({
        title: generatedPath.path_name,
        description: generatedPath.description,
        category: "generated",
        course_ids: generatedPath.milestones
          .flatMap(m => m.internal_courses?.map(c => c.course_id))
          .filter(Boolean),
        estimated_duration: generatedPath.estimated_weeks * 7,
        difficulty_level: generatedPath.difficulty,
        skills_gained: generatedPath.skills_gained,
        icon: "🎯",
        is_published: true,
        creator_email: user?.email
      });
      navigate(createPageUrl("LearningPaths"));
    } catch (error) {
      console.error("Error saving path:", error);
      alert("Error saving learning path. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="p-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">AI Course & Path Creator</h1>
          </div>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto">
            Create individual courses or complete learning paths with AI assistance
          </p>
        </div>

        <Tabs value={mode} onValueChange={(v) => { setMode(v); setStep(1); }} className="mb-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="course">
              <BookOpen className="w-4 h-4 mr-2" />
              Single Course
            </TabsTrigger>
            <TabsTrigger value="path">
              <Route className="w-4 h-4 mr-2" />
              Learning Path
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {mode === "course" ? (
          <>
            {step === 1 && (
              <CoursePromptForm 
                onGenerate={generateCourse} 
                isGenerating={isGenerating}
              />
            )}
            {step === 2 && generatedCourse && (
              <GeneratedCoursePreview 
                course={generatedCourse}
                onEdit={setGeneratedCourse}
                onSave={saveCourse}
                onBack={() => setStep(1)}
              />
            )}
          </>
        ) : (
          <>
            {step === 1 && (
              <LearningPathPromptForm 
                onGenerate={generatePath} 
                isGenerating={isGenerating}
              />
            )}
            {step === 2 && generatedPath && (
              <GeneratedPathPreview 
                path={generatedPath}
                onSave={savePath}
                onBack={() => setStep(1)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}