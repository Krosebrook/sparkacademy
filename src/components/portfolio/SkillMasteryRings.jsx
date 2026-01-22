import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function SkillMasteryRings({ skills }) {
  const defaultSkills = skills || [
    { skill: 'React.js', level: 88, color: '#00f2ff', proficiency: '74% growth' },
    { skill: 'Python', level: 74, color: '#ff00ff', proficiency: 'Intermediate' },
    { skill: 'UI/UX', level: 65, color: '#137fec', proficiency: 'Advanced Level' }
  ];

  const getCircumference = (radius = 34) => 2 * Math.PI * radius;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {defaultSkills.map((skill, idx) => {
        const circumference = getCircumference();
        const offset = circumference - (skill.level / 100) * circumference;
        
        return (
          <Card key={idx} className="bg-gray-900/30 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="relative w-20 h-20 mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke={skill.color}
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                      filter: `drop-shadow(0 0 6px ${skill.color}40)`
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{skill.level}%</span>
                </div>
              </div>
              <span className="font-semibold text-center mb-1">{skill.skill}</span>
              <span className="text-xs text-gray-400 text-center">{skill.proficiency}</span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}