import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Loader2, Calendar, BookOpen, CheckCircle, Lightbulb, FileText, Clock, Target } from 'lucide-react';

export default function AILessonPlanningAssistant() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    course_topic: '',
    learning_objectives: '',
    course_level: 'intermediate',
    duration_weeks: '8'
  });
  const [lessonPlan, setLessonPlan] = useState(null);
  const [expandedLesson, setExpandedLesson] = useState(null);

  const generatePlan = async () => {
    if (!formData.course_topic || !formData.learning_objectives) {
      alert('Please fill in course topic and learning objectives');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateLessonPlan', formData);
      setLessonPlan(data);
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      alert('Failed to generate lesson plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            AI Lesson Planning Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Course Topic</label>
            <Input
              value={formData.course_topic}
              onChange={(e) => setFormData(prev => ({ ...prev, course_topic: e.target.value }))}
              placeholder="e.g., Introduction to Machine Learning"
              className="bg-[#1a0a2e]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Learning Objectives</label>
            <Textarea
              value={formData.learning_objectives}
              onChange={(e) => setFormData(prev => ({ ...prev, learning_objectives: e.target.value }))}
              placeholder="What should students be able to do after completing this course?"
              className="bg-[#1a0a2e] h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Course Level</label>
              <Select value={formData.course_level} onValueChange={(value) => setFormData(prev => ({ ...prev, course_level: value }))}>
                <SelectTrigger className="bg-[#1a0a2e]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-1 block">Duration (Weeks)</label>
              <Select value={formData.duration_weeks} onValueChange={(value) => setFormData(prev => ({ ...prev, duration_weeks: value }))}>
                <SelectTrigger className="bg-[#1a0a2e]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 weeks</SelectItem>
                  <SelectItem value="6">6 weeks</SelectItem>
                  <SelectItem value="8">8 weeks</SelectItem>
                  <SelectItem value="10">10 weeks</SelectItem>
                  <SelectItem value="12">12 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={generatePlan} disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
            Generate Lesson Plan
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
          <p className="text-gray-400">Creating comprehensive lesson plan...</p>
        </div>
      )}

      {lessonPlan && (
        <>
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Course Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-400">{lessonPlan.course_overview?.total_lessons || 0}</div>
                  <div className="text-xs text-gray-400">Total Lessons</div>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-400">{lessonPlan.course_overview?.total_weeks || 0}</div>
                  <div className="text-xs text-gray-400">Weeks</div>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                  <div className="text-sm font-semibold text-green-400">{lessonPlan.course_overview?.lesson_frequency || 'N/A'}</div>
                  <div className="text-xs text-gray-400">Frequency</div>
                </div>
                <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-3">
                  <div className="text-sm font-semibold text-cyan-400">Structured</div>
                  <div className="text-xs text-gray-400">Flow Type</div>
                </div>
              </div>
              {lessonPlan.course_overview?.course_flow && (
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-300">{lessonPlan.course_overview.course_flow}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-400" />
                Lesson Sequence ({lessonPlan.lessons?.length || 0} Lessons)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lessonPlan.lessons?.map((lesson, idx) => (
                <div key={idx} className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg overflow-hidden">
                  <div
                    className="p-4 cursor-pointer hover:bg-purple-900/10 transition-colors"
                    onClick={() => setExpandedLesson(expandedLesson === idx ? null : idx)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-purple-500/20 text-purple-300">Lesson {lesson.lesson_number}</Badge>
                          <Badge className="bg-blue-500/20 text-blue-300">
                            <Clock className="w-3 h-3 mr-1" />
                            {lesson.duration_minutes}min
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-white text-lg">{lesson.title}</h4>
                      </div>
                      <Button size="sm" variant="ghost">
                        {expandedLesson === idx ? '−' : '+'}
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {lesson.key_topics?.slice(0, 3).map((topic, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{topic}</Badge>
                      ))}
                      {lesson.key_topics?.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{lesson.key_topics.length - 3} more</Badge>
                      )}
                    </div>
                  </div>

                  {expandedLesson === idx && (
                    <div className="border-t border-purple-500/30 p-4 space-y-4 bg-[#0f0618]/50">
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Learning Outcomes
                        </h5>
                        <ul className="space-y-1">
                          {lesson.learning_outcomes?.map((outcome, i) => (
                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              <span>{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {lesson.prerequisites?.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-white mb-2">Prerequisites</h5>
                          <div className="flex flex-wrap gap-1">
                            {lesson.prerequisites.map((prereq, i) => (
                              <Badge key={i} className="bg-yellow-500/20 text-yellow-300 text-xs">{prereq}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-400" />
                          Interactive Elements
                        </h5>
                        <div className="space-y-2">
                          {lesson.interactive_elements?.map((element, i) => (
                            <div key={i} className="bg-yellow-900/10 border border-yellow-500/20 rounded p-2">
                              <div className="flex items-center justify-between mb-1">
                                <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">{element.type}</Badge>
                                <span className="text-xs text-gray-400">{element.duration_minutes}min</span>
                              </div>
                              <p className="text-xs text-gray-300">{element.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2">Practice Activities</h5>
                        <div className="space-y-2">
                          {lesson.practice_activities?.map((activity, i) => (
                            <div key={i} className="bg-blue-900/10 border border-blue-500/20 rounded p-2">
                              <div className="flex items-center justify-between mb-1">
                                <Badge className="bg-blue-500/20 text-blue-300 text-xs">{activity.difficulty}</Badge>
                                <span className="text-xs text-gray-400">{activity.duration_minutes}min</span>
                              </div>
                              <p className="text-xs text-gray-300">{activity.activity}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          Assessments
                        </h5>
                        <div className="space-y-2">
                          {lesson.assessments?.formative?.length > 0 && (
                            <div className="bg-cyan-900/10 border border-cyan-500/20 rounded p-2">
                              <div className="text-xs font-semibold text-cyan-300 mb-1">Formative (During Lesson)</div>
                              <ul className="space-y-1">
                                {lesson.assessments.formative.map((assessment, i) => (
                                  <li key={i} className="text-xs text-gray-300">• {assessment}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {lesson.assessments?.summative && (
                            <div className="bg-cyan-900/10 border border-cyan-500/20 rounded p-2">
                              <div className="text-xs font-semibold text-cyan-300 mb-1">Summative (End of Lesson)</div>
                              <p className="text-xs text-gray-300">{lesson.assessments.summative}</p>
                            </div>
                          )}
                          {lesson.assessments?.project_idea && (
                            <div className="bg-green-900/10 border border-green-500/20 rounded p-2">
                              <div className="text-xs font-semibold text-green-300 mb-1">Project Idea</div>
                              <p className="text-xs text-gray-300">{lesson.assessments.project_idea}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {lessonPlan.instructional_resources && (
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-400" />
                  Instructional Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lessonPlan.instructional_resources.required_materials?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-white mb-2">Required Materials</h5>
                    <div className="space-y-1">
                      {lessonPlan.instructional_resources.required_materials.map((item, i) => (
                        <div key={i} className="text-sm text-gray-300 flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lessonPlan.instructional_resources.tools_software?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-white mb-2">Tools & Software</h5>
                    <div className="flex flex-wrap gap-1">
                      {lessonPlan.instructional_resources.tools_software.map((tool, i) => (
                        <Badge key={i} className="bg-blue-500/20 text-blue-300">{tool}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {lessonPlan.instructional_resources.supplementary_resources?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-white mb-2">Supplementary Resources</h5>
                    <div className="space-y-1">
                      {lessonPlan.instructional_resources.supplementary_resources.map((resource, i) => (
                        <div key={i} className="text-sm text-gray-300">• {resource}</div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {lessonPlan.pedagogical_notes?.length > 0 && (
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Pedagogical Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lessonPlan.pedagogical_notes.map((note, i) => (
                    <div key={i} className="bg-yellow-900/10 border border-yellow-500/20 rounded p-3">
                      <p className="text-sm text-gray-300">{note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}