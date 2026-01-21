import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Rocket, Target, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export default function SkillsPathwayBuilder({ employeeProfile }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    target_role: '',
    organization_focus: 'general',
    career_goals: ''
  });
  const [generatedPathway, setGeneratedPathway] = useState(null);

  const savePathwayMutation = useMutation({
    mutationFn: async (pathwayData) => {
      return base44.entities.SkillsPathway.create(pathwayData);
    }
  });

  const generatePathway = async () => {
    if (!formData.target_role) {
      alert('Please specify a target role');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateSkillsPathway', {
        employee_profile: employeeProfile,
        target_role: formData.target_role,
        organization_focus: formData.organization_focus
      });

      setGeneratedPathway(data);
    } catch (error) {
      console.error('Pathway generation error:', error);
      alert('Failed to generate skills pathway');
    } finally {
      setLoading(false);
    }
  };

  const savePathway = async () => {
    if (!generatedPathway) return;

    try {
      await savePathwayMutation.mutateAsync({
        pathway_name: generatedPathway.pathway_name,
        employee_id: employeeProfile.employee_email,
        organization_id: employeeProfile.organization_id,
        target_role: formData.target_role,
        current_level: generatedPathway.current_level,
        target_level: generatedPathway.target_level,
        career_goal_context: generatedPathway.career_goal_context,
        stages: generatedPathway.stages,
        department_focus: generatedPathway.department_focus,
        industry_focus: generatedPathway.industry_focus,
        estimated_completion_date: new Date(Date.now() + generatedPathway.total_duration_weeks * 7 * 24 * 60 * 60 * 1000).toISOString()
      });

      alert('Skills pathway saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save pathway');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-blue-400" />
            AI-Powered Skills Pathway Builder
          </CardTitle>
          <p className="text-sm text-gray-400">
            Get personalized AI learning recommendations based on your role and career goals
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Your Current Profile</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Role:</span>{' '}
                <span className="text-white">{employeeProfile?.current_role || 'Not set'}</span>
              </div>
              <div>
                <span className="text-gray-400">Department:</span>{' '}
                <span className="text-white">{employeeProfile?.department || 'Not set'}</span>
              </div>
              <div>
                <span className="text-gray-400">AI Experience:</span>{' '}
                <Badge className="ml-2">{employeeProfile?.ai_experience_level || 'none'}</Badge>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Target Role/Position</label>
            <Input
              value={formData.target_role}
              onChange={(e) => setFormData(prev => ({ ...prev, target_role: e.target.value }))}
              placeholder="e.g., AI-Enhanced Financial Analyst, Creative AI Specialist"
              className="bg-[#1a0a2e]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Career Focus Area</label>
            <Select value={formData.organization_focus} onValueChange={(value) => setFormData(prev => ({ ...prev, organization_focus: value }))}>
              <SelectTrigger className="bg-[#1a0a2e]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="financial">Financial AI Applications</SelectItem>
                <SelectItem value="developer">Developer & Engineering</SelectItem>
                <SelectItem value="creative">Creative & Artistic</SelectItem>
                <SelectItem value="healthcare">Healthcare & Medical</SelectItem>
                <SelectItem value="manufacturing">Manufacturing & Operations</SelectItem>
                <SelectItem value="general">General AI Literacy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Additional Career Goals (Optional)</label>
            <Textarea
              value={formData.career_goals}
              onChange={(e) => setFormData(prev => ({ ...prev, career_goals: e.target.value }))}
              placeholder="Describe your career aspirations..."
              className="bg-[#1a0a2e] h-20"
            />
          </div>

          <Button onClick={generatePathway} disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Rocket className="w-4 h-4 mr-2" />}
            Generate My AI Learning Pathway
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-400 animate-spin" />
          <p className="text-gray-400">Analyzing your profile and creating personalized pathway...</p>
        </div>
      )}

      {generatedPathway && (
        <>
          <Card className="card-glow border-2 border-green-500/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white text-2xl mb-2">{generatedPathway.pathway_name}</CardTitle>
                  <p className="text-sm text-gray-300">{generatedPathway.career_goal_context}</p>
                </div>
                <Button onClick={savePathway} className="btn-primary">
                  Save Pathway
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Duration</div>
                  <div className="text-xl font-bold text-blue-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {generatedPathway.total_duration_weeks} weeks
                  </div>
                </div>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Progression</div>
                  <div className="text-sm font-bold text-purple-400">
                    {generatedPathway.current_level} → {generatedPathway.target_level}
                  </div>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Stages</div>
                  <div className="text-xl font-bold text-green-400">{generatedPathway.stages?.length || 0}</div>
                </div>
              </div>

              <div className="space-y-4">
                {generatedPathway.stages?.map((stage, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {stage.stage_number}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-lg">{stage.stage_title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-blue-500/20 text-blue-300">
                            <Clock className="w-3 h-3 mr-1" />
                            {stage.duration_weeks} weeks
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-300">
                            {stage.key_skills?.length || 0} skills
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4 text-yellow-400" />
                          Key Skills
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {stage.key_skills?.map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      </div>

                      {stage.recommended_courses?.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-white mb-2">Recommended Courses</h5>
                          <div className="space-y-2">
                            {stage.recommended_courses.map((course, i) => (
                              <div key={i} className="bg-green-900/10 border border-green-500/20 rounded p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-semibold text-white">{course.course_title}</span>
                                  <div className="flex items-center gap-2">
                                    <Badge className={
                                      course.priority === 'required' ? 'bg-red-500/20 text-red-300' :
                                      course.priority === 'recommended' ? 'bg-yellow-500/20 text-yellow-300' :
                                      'bg-gray-500/20 text-gray-300'
                                    }>
                                      {course.priority}
                                    </Badge>
                                    <span className="text-xs text-gray-400">{course.duration_hours}h</span>
                                  </div>
                                </div>
                                {course.topics_covered?.length > 0 && (
                                  <div className="text-xs text-gray-400">
                                    Topics: {course.topics_covered.join(', ')}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {stage.projects_assignments?.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-white mb-2">Projects & Assignments</h5>
                          <ul className="space-y-1">
                            {stage.projects_assignments.map((project, i) => (
                              <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                <ArrowRight className="w-3 h-3 text-cyan-400 mt-0.5" />
                                <span>{project}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {stage.success_criteria?.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Success Criteria
                          </h5>
                          <ul className="space-y-1">
                            {stage.success_criteria.map((criteria, i) => (
                              <li key={i} className="text-xs text-green-300">✓ {criteria}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {generatedPathway.certifications_to_pursue?.length > 0 && (
                <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Recommended Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedPathway.certifications_to_pursue.map((cert, i) => (
                      <Badge key={i} className="bg-orange-500/20 text-orange-300">{cert}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}