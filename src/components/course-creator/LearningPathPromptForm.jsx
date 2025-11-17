import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Route, Target, TrendingUp } from "lucide-react";

export default function LearningPathPromptForm({ onGenerate, isGenerating }) {
  const [formData, setFormData] = useState({
    goal: "",
    type: "career",
    timeframe: "3-6 months",
    currentLevel: "beginner"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center p-4">
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Route className="w-5 h-5 text-violet-500" />
          Create Learning Path
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Target className="w-3 h-3" />
              Learning Goal or Career Aspiration
            </label>
            <Textarea
              placeholder="e.g., Become a Full-Stack Developer, Master Digital Marketing, Transition to Data Science..."
              value={formData.goal}
              onChange={(e) => setFormData({...formData, goal: e.target.value})}
              className="min-h-20 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Path Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="career">Career Path</SelectItem>
                  <SelectItem value="skill">Skill Mastery</SelectItem>
                  <SelectItem value="certification">Certification Prep</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Current Level</label>
              <Select
                value={formData.currentLevel}
                onValueChange={(value) => setFormData({...formData, currentLevel: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" />
                Timeframe
              </label>
              <Select
                value={formData.timeframe}
                onValueChange={(value) => setFormData({...formData, timeframe: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-3 months">1-3 months</SelectItem>
                  <SelectItem value="3-6 months">3-6 months</SelectItem>
                  <SelectItem value="6-12 months">6-12 months</SelectItem>
                  <SelectItem value="12+ months">12+ months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!formData.goal || isGenerating}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold py-3 shadow-xl"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating Learning Path...
              </>
            ) : (
              <>
                <Route className="w-4 h-4 mr-2" />
                Generate Learning Path with AI
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}