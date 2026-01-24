import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, BookOpen, Clock, Target, Sparkles, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function PathVisualizer({ pathData, onGenerateCourse }) {
  const [generatingCourse, setGeneratingCourse] = useState(null);

  const handleGenerateCourse = async (module, phase) => {
    setGeneratingCourse(module.title);
    try {
      const response = await base44.functions.invoke('generateCourseFromPath', {
        moduleTitle: module.title,
        moduleDescription: module.description,
        topics: module.topics || [],
        targetLevel: pathData.proficiencyLevel || 'intermediate',
        estimatedHours: module.estimatedHours
      });

      if (response.data.success) {
        onGenerateCourse({
          module,
          phase,
          courseContent: response.data.course,
          metadata: response.data.metadata
        });
      }
    } catch (error) {
      console.error('Error generating course:', error);
    } finally {
      setGeneratingCourse(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-900/80 to-purple-800/80 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Duration</p>
                <p className="text-3xl font-bold text-white">{pathData.totalEstimatedHours}h</p>
              </div>
              <Clock className="w-12 h-12 text-purple-300 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/80 to-orange-800/80 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Skill Gaps</p>
                <p className="text-3xl font-bold text-white">{pathData.skillGaps?.length || 0}</p>
              </div>
              <Target className="w-12 h-12 text-orange-300 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/80 to-orange-900/80 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Learning Phases</p>
                <p className="text-3xl font-bold text-white">{pathData.learningPath?.length || 0}</p>
              </div>
              <BookOpen className="w-12 h-12 text-purple-300 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Gaps */}
      {pathData.skillGaps && pathData.skillGaps.length > 0 && (
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              Identified Skill Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pathData.skillGaps.map((gap, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-white font-semibold">{gap.skill}</h4>
                    <p className="text-gray-400 text-sm mt-1">{gap.reason}</p>
                  </div>
                  <Badge className={`${gap.priority === 'high' ? 'bg-red-500' : gap.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'} text-white`}>
                    {gap.priority} priority
                  </Badge>
                </div>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="text-gray-500">Current: {gap.currentLevel}</span>
                  <ChevronRight className="w-3 h-3 text-gray-600" />
                  <span className="text-purple-400">Target: {gap.targetLevel}</span>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Learning Path Phases */}
      {pathData.learningPath && pathData.learningPath.map((phase, phaseIndex) => (
        <motion.div
          key={phaseIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: phaseIndex * 0.2 }}
        >
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-purple-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {phaseIndex + 1}
                    </div>
                    {phase.title}
                  </CardTitle>
                  <p className="text-gray-400 mt-1">{phase.description}</p>
                </div>
                <Badge className="bg-purple-900/50 text-purple-300 border border-purple-500/50">
                  {phase.estimatedWeeks} weeks
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {phase.modules && phase.modules.map((module, moduleIndex) => (
                <div
                  key={moduleIndex}
                  className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-400" />
                        {module.title}
                      </h4>
                      <p className="text-gray-400 text-sm mt-1">{module.description}</p>
                    </div>
                    <Badge className="bg-orange-900/50 text-orange-300">
                      {module.estimatedHours}h
                    </Badge>
                  </div>

                  {module.topics && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {module.topics.map((topic, i) => (
                        <Badge key={i} variant="outline" className="text-xs text-gray-400 border-gray-600">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {module.skillsGained && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Skills You'll Gain:</p>
                      <div className="flex flex-wrap gap-2">
                        {module.skillsGained.map((skill, i) => (
                          <span key={i} className="text-xs text-purple-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleGenerateCourse(module, phase)}
                    disabled={generatingCourse === module.title}
                    className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white mt-3"
                  >
                    {generatingCourse === module.title ? (
                      'Generating Course...'
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate AI Course Content
                      </>
                    )}
                  </Button>
                </div>
              ))}

              {phase.milestone && (
                <div className="p-4 bg-gradient-to-r from-purple-900/30 to-orange-900/30 rounded-lg border border-purple-500/30">
                  <p className="text-sm text-purple-300 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <strong>Milestone:</strong> {phase.milestone}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}