
import React, { useState } from "react";
import { Course } from "@/entities/Course";
import { User } from "@/entities/User";
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, BookOpen, Users, Clock, DollarSign, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CoursePromptForm from "../components/course-creator/CoursePromptForm";
import GeneratedCoursePreview from "../components/course-creator/GeneratedCoursePreview";

export default function CourseCreator() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: prompt, 2: preview, 3: customize
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState(null);
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
      // Generate course structure
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
            // Removed estimated_price as courses are now free
          }
        }
      });

      // Generate thumbnail image
      const thumbnailPrompt = `Create a professional, modern course thumbnail for "${courseData.title}". 
        The image should be clean, minimalist, and appealing to online learners. 
        Style: modern, professional, educational, high-quality, no text overlay.`;
      
      const thumbnail = await GenerateImage({ prompt: thumbnailPrompt });

      // Add lessons order and calculate duration
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
        // Removed price as courses are now free
      });

      setStep(2);
    } catch (error) {
      console.error("Error generating course:", error);
      alert("Error generating course. Please try again.");
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <div className="p-3 md:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 md:mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="p-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-xl">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg md:text-2xl font-bold text-slate-800">AI Course Creator</h1>
          </div>
          <p className="text-slate-600 text-xs md:text-sm max-w-2xl mx-auto">
            Describe your course idea and let AI create a comprehensive curriculum for you
          </p>

          {/* Progress Steps */}
          <div className="flex justify-center items-center mt-4 md:mt-6 gap-1.5 md:gap-3">
            {[
              { num: 1, label: "Describe", active: step === 1 },
              { num: 2, label: "Review", active: step === 2 },
              { num: 3, label: "Publish", active: step === 3 }
            ].map((s, index) => (
              <React.Fragment key={s.num}>
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300 ${
                  s.active 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg" 
                    : step > s.num 
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-600"
                }`}>
                  {s.num}
                </div>
                <span className={`hidden sm:inline text-xs font-medium ${s.active ? "text-slate-800" : "text-slate-500"}`}>
                  {s.label}
                </span>
                {index < 2 && <div className="w-3 md:w-6 h-px bg-slate-300" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
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
      </div>
    </div>
  );
}
