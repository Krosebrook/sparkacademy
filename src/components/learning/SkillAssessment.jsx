import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Plus, Trash2 } from 'lucide-react';

export default function SkillAssessment({ onComplete }) {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [proficiency, setProficiency] = useState('beginner');

  const proficiencyLevels = [
    { value: 'beginner', label: 'Beginner', color: 'bg-blue-500' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-purple-500' },
    { value: 'advanced', label: 'Advanced', color: 'bg-orange-500' },
    { value: 'expert', label: 'Expert', color: 'bg-green-500' }
  ];

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, { name: newSkill.trim(), level: proficiency }]);
      setNewSkill('');
      setProficiency('beginner');
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (skills.length > 0) {
      onComplete(skills);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-purple-400" />
          Current Skills Assessment
        </CardTitle>
        <p className="text-gray-400 mt-2">Add your current skills and proficiency levels</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Skill Form */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Enter a skill (e.g., Python, React, Machine Learning)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              className="flex-1 bg-slate-800 border-slate-700 text-white"
            />
            <select
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 text-white"
            >
              {proficiencyLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <Button
              onClick={addSkill}
              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Skills List */}
        <div className="space-y-3">
          {skills.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <XCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No skills added yet. Start by adding your current skills.</p>
            </div>
          ) : (
            skills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {skill.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{skill.name}</p>
                    <Badge className={`${proficiencyLevels.find(l => l.value === skill.level)?.color} text-white`}>
                      {proficiencyLevels.find(l => l.value === skill.level)?.label}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSkill(index)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Submit Button */}
        {skills.length > 0 && (
          <Button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-bold py-6 rounded-xl text-lg"
          >
            Continue to Goal Setting →
          </Button>
        )}
      </CardContent>
    </Card>
  );
}