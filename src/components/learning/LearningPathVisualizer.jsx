import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Lock, Target } from "lucide-react";

export default function LearningPathVisualizer({ path }) {
  if (!path || !path.recommended_lessons) return null;

  const getStatusIcon = (lesson, index) => {
    if (lesson.completed) return <CheckCircle2 className="w-6 h-6 text-green-600" />;
    if (index === 0) return <Circle className="w-6 h-6 text-blue-600 fill-blue-200" />;
    return <Lock className="w-6 h-6 text-slate-400" />;
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return "bg-slate-100 text-slate-800";
    if (difficulty === "hard") return "bg-red-100 text-red-800";
    if (difficulty === "medium") return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Your Personalized Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700">Progress</span>
            <span className="font-semibold text-blue-600">{path.personalization_score}% personalized</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${path.personalization_score}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Learning Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {path.recommended_lessons?.map((lesson, idx) => (
              <div key={idx} className="relative">
                {idx < path.recommended_lessons.length - 1 && (
                  <div className="absolute left-3 top-10 bottom-0 w-0.5 bg-slate-200" />
                )}
                
                <div className="flex gap-4 relative z-10">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(lesson, idx)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className={`font-semibold ${lesson.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {lesson.lesson_title}
                        </h4>
                        {lesson.reason && (
                          <p className="text-xs text-slate-600 mt-1 italic">
                            Why: {lesson.reason}
                          </p>
                        )}
                      </div>
                      <Badge className={getDifficultyColor(lesson.difficulty)}>
                        {lesson.difficulty || 'beginner'}
                      </Badge>
                    </div>

                    {lesson.confidence_score && (
                      <div className="mt-2 text-xs text-slate-600">
                        Match Score: <span className="font-semibold text-slate-900">{(lesson.confidence_score * 100).toFixed(0)}%</span>
                      </div>
                    )}

                    {lesson.completed && (
                      <div className="mt-2 inline-block px-2 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-700 font-semibold">
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {path.current_level && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base">Learning Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-slate-600 mb-1">Current Level</p>
                <p className="font-semibold text-slate-900 capitalize">{path.current_level}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs text-slate-600 mb-1">Learning Style</p>
                <p className="font-semibold text-slate-900 capitalize">{path.learning_style?.replace("_", " ")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}