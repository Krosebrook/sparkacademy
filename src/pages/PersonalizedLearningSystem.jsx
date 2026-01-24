import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SkillAssessment from '@/components/learning/SkillAssessment';
import GoalSetting from '@/components/learning/GoalSetting';
import PathVisualizer from '@/components/learning/PathVisualizer';

export default function PersonalizedLearningSystem() {
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState([]);
  const [goalData, setGoalData] = useState(null);
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedCourses, setGeneratedCourses] = useState([]);

  const handleSkillsComplete = (assessedSkills) => {
    setSkills(assessedSkills);
    setStep(2);
  };

  const handleGoalComplete = async (goals) => {
    setGoalData(goals);
    setLoading(true);

    try {
      const response = await base44.functions.invoke('generatePersonalizedPath', {
        currentSkills: skills,
        learningGoal: goals.learningGoal,
        targetRole: goals.targetRole,
        timeframe: goals.timeframe,
        proficiencyLevel: 'intermediate'
      });

      if (response.data.success) {
        setPathData({
          ...response.data.path,
          proficiencyLevel: 'intermediate'
        });
        setStep(3);
      }
    } catch (error) {
      console.error('Error generating path:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseGenerated = (courseData) => {
    setGeneratedCourses([...generatedCourses, courseData]);
    // Could save to database or show in modal
    alert(`Course "${courseData.module.title}" generated successfully!`);
  };

  const resetFlow = () => {
    setStep(1);
    setSkills([]);
    setGoalData(null);
    setPathData(null);
    setGeneratedCourses([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-orange-500 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">
            AI-Powered Learning Path Generator
          </h1>
          <p className="text-xl text-gray-400">
            Personalized roadmaps tailored to your skills and goals
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[
            { num: 1, label: 'Assess Skills' },
            { num: 2, label: 'Set Goals' },
            { num: 3, label: 'Your Path' }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step > s.num ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white' :
                  step === s.num ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white' :
                  'bg-slate-800 text-gray-500'
                }`}>
                  {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-sm font-semibold ${step >= s.num ? 'text-white' : 'text-gray-600'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div className={`w-12 h-1 ${step > s.num ? 'bg-gradient-to-r from-purple-600 to-orange-500' : 'bg-slate-800'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Back Button */}
        {step > 1 && !loading && (
          <Button
            onClick={() => setStep(step - 1)}
            variant="outline"
            className="mb-4 text-gray-400 border-gray-700 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        )}

        {/* Step Content */}
        {step === 1 && (
          <SkillAssessment onComplete={handleSkillsComplete} />
        )}

        {step === 2 && (
          <GoalSetting onComplete={handleGoalComplete} />
        )}

        {loading && (
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30">
            <CardContent className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full mb-4 animate-pulse">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Generating Your Personalized Path</h3>
              <p className="text-gray-400">Our AI is analyzing your skills and creating a custom learning roadmap...</p>
            </CardContent>
          </Card>
        )}

        {step === 3 && pathData && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white">Your Personalized Learning Path</h2>
                <p className="text-gray-400 mt-1">Goal: {goalData.learningGoal}</p>
              </div>
              <Button
                onClick={resetFlow}
                variant="outline"
                className="text-purple-400 border-purple-500 hover:bg-purple-500/10"
              >
                Create New Path
              </Button>
            </div>
            <PathVisualizer 
              pathData={pathData} 
              onGenerateCourse={handleCourseGenerated}
            />
          </div>
        )}

        {/* Generated Courses Summary */}
        {generatedCourses.length > 0 && (
          <Card className="mt-6 bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-green-500/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Generated Courses ({generatedCourses.length})
              </h3>
              <div className="space-y-2">
                {generatedCourses.map((course, idx) => (
                  <div key={idx} className="text-sm text-gray-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    {course.module.title} - {course.courseContent.lessons?.length || 0} lessons
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}