import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';

export default function ProjectSubmission({ lesson, enrollmentId, onSubmissionComplete }) {
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const project = lesson.project;

  if (!project) return null;

  const handleSubmit = async () => {
    if (!submissionText.trim() && !submissionUrl.trim()) return;

    setIsSubmitting(true);
    try {
      // Generate AI feedback on the submission
      const feedbackPrompt = `You are an expert instructor reviewing a student's project submission.

Project Title: ${project.title}
Project Description: ${project.description}
Project Requirements:
${project.requirements?.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Student Submission:
${submissionText}
${submissionUrl ? `\nSubmission URL: ${submissionUrl}` : ''}

Provide constructive feedback that:
1. Acknowledges what the student did well
2. Identifies areas for improvement
3. Suggests specific next steps
4. Encourages continued learning

Be supportive, specific, and actionable. Format as JSON with: "strengths" (array), "improvements" (array), "nextSteps" (array), "overallScore" (1-10), "encouragement" (string).`;

      const aiFeedback = await base44.integrations.Core.InvokeLLM({
        prompt: feedbackPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            improvements: {
              type: "array",
              items: { type: "string" }
            },
            nextSteps: {
              type: "array",
              items: { type: "string" }
            },
            overallScore: { type: "number" },
            encouragement: { type: "string" }
          }
        }
      });

      setFeedback(aiFeedback);

      // Update enrollment with project submission
      const enrollment = await base44.entities.Enrollment.get(enrollmentId);
      
      // Check if progress exists for this lesson
      const lessonProgressExists = enrollment.progress?.some(p => p.lesson_order === lesson.order);
      let updatedProgress;
      
      if (lessonProgressExists) {
        updatedProgress = enrollment.progress.map(p => {
          if (p.lesson_order === lesson.order) {
            return {
              ...p,
              project_submitted: true,
              project_feedback: JSON.stringify(aiFeedback),
              completed: true,
              completed_date: new Date().toISOString()
            };
          }
          return p;
        });
      } else {
        // Add new progress entry if it doesn't exist
        updatedProgress = [
          ...(enrollment.progress || []),
          {
            lesson_order: lesson.order,
            project_submitted: true,
            project_feedback: JSON.stringify(aiFeedback),
            completed: true,
            completed_date: new Date().toISOString()
          }
        ];
      }

      await base44.entities.Enrollment.update(enrollmentId, {
        progress: updatedProgress
      });

      if (onSubmissionComplete) {
        onSubmissionComplete();
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('Failed to submit project. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="border-0 shadow-lg mt-6">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-emerald-600" />
          {project.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {!feedback ? (
          <>
            <div className="mb-4">
              <p className="text-slate-700 mb-3">{project.description}</p>
              {project.requirements && (
                <div className="bg-slate-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-sm text-slate-800 mb-2">Requirements:</h4>
                  <ul className="space-y-1">
                    {project.requirements.map((req, idx) => (
                      <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Badge variant="outline">{project.difficulty || 'medium'}</Badge>
                <span>Est. Time: {project.estimated_time || '1-2 hours'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Submission</label>
                <Textarea
                  placeholder="Describe what you built, your approach, challenges faced, and what you learned..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project URL (Optional)</label>
                <Input
                  placeholder="https://github.com/... or https://..."
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                />
              </div>

              <Alert>
                <Sparkles className="w-4 h-4" />
                <AlertDescription>
                  You'll receive instant AI-powered feedback on your submission!
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || (!submissionText.trim() && !submissionUrl.trim())}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Your Work...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Project
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <div>
                <h3 className="font-bold text-lg text-slate-800">Project Submitted! 🎉</h3>
                <p className="text-sm text-slate-600">Here's your AI-generated feedback</p>
              </div>
            </div>

            {/* Overall Score */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">
                {feedback.overallScore}/10
              </div>
              <p className="text-sm text-slate-600">Overall Score</p>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <span className="text-emerald-500">✓</span> What You Did Well
              </h4>
              <ul className="space-y-2">
                {feedback.strengths?.map((strength, idx) => (
                  <li key={idx} className="text-sm text-slate-700 bg-emerald-50 p-3 rounded-lg">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            {feedback.improvements?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <span className="text-amber-500">→</span> Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {feedback.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-sm text-slate-700 bg-amber-50 p-3 rounded-lg">
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            <div>
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <span className="text-blue-500">→</span> Next Steps
              </h4>
              <ul className="space-y-2">
                {feedback.nextSteps?.map((step, idx) => (
                  <li key={idx} className="text-sm text-slate-700 bg-blue-50 p-3 rounded-lg">
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* Encouragement */}
            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm text-slate-700 italic">"{feedback.encouragement}"</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}