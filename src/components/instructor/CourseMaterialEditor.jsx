/**
 * Course Material Editor
 * Allows instructors to directly update course lessons, descriptions, and metadata
 */

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, ChevronDown, ChevronUp, BookOpen, PlusCircle, Sparkles, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

function LessonEditor({ lesson, index, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [local, setLocal] = useState(lesson);
  const [aiLoading, setAiLoading] = useState(false);
  const dirty = JSON.stringify(local) !== JSON.stringify(lesson);

  const generateContent = async () => {
    if (!local.title) return;
    setAiLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a concise lesson description (2-3 sentences) for a course lesson titled "${local.title}". Be educational and engaging.`
      });
      setLocal(l => ({ ...l, description: result }));
    } catch {
      toast.error('AI generation failed');
    }
    setAiLoading(false);
  };

  return (
    <div className="border border-slate-200 rounded-lg bg-white">
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
        <span className="flex-1 font-medium text-slate-800 text-sm truncate">
          {local.title || 'Untitled Lesson'}
        </span>
        {dirty && <Badge className="bg-amber-100 text-amber-700 text-xs">Unsaved</Badge>}
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </div>

      {expanded && (
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Lesson Title</label>
            <Input
              value={local.title || ''}
              onChange={(e) => setLocal(l => ({ ...l, title: e.target.value }))}
              placeholder="Lesson title"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600">Description</label>
              <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={generateContent} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI Generate
              </Button>
            </div>
            <Textarea
              value={local.description || ''}
              onChange={(e) => setLocal(l => ({ ...l, description: e.target.value }))}
              placeholder="Lesson description..."
              rows={3}
              className="text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Duration (min)</label>
              <Input
                type="number"
                value={local.estimated_duration || ''}
                onChange={(e) => setLocal(l => ({ ...l, estimated_duration: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Type</label>
              <select
                value={local.type || 'video'}
                onChange={(e) => setLocal(l => ({ ...l, type: e.target.value }))}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="video">Video</option>
                <option value="reading">Reading</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="live">Live Session</option>
              </select>
            </div>
          </div>
          <Button size="sm" onClick={() => onUpdate(index, local)} disabled={!dirty} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="w-3 h-3" />
            Save Lesson
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CourseMaterialEditor({ courseId }) {
  const queryClient = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ['courseDetail', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0] || null;
    },
    enabled: !!courseId
  });

  const [courseForm, setCourseForm] = useState(null);
  const dirty = courseForm && course && JSON.stringify(courseForm) !== JSON.stringify({
    title: course.title,
    description: course.description,
    level: course.level,
    category: course.category
  });

  useEffect(() => {
    if (course) {
      setCourseForm({
        title: course.title || '',
        description: course.description || '',
        level: course.level || 'beginner',
        category: course.category || ''
      });
    }
  }, [course]);

  const updateCourse = useMutation({
    mutationFn: (data) => base44.entities.Course.update(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['courseDetail', courseId]);
      toast.success('Course details saved');
    }
  });

  const updateLesson = (index, updatedLesson) => {
    const lessons = [...(course.lessons || [])];
    lessons[index] = updatedLesson;
    base44.entities.Course.update(courseId, { lessons }).then(() => {
      queryClient.invalidateQueries(['courseDetail', courseId]);
      toast.success(`Lesson ${index + 1} saved`);
    });
  };

  const addLesson = () => {
    const lessons = [...(course.lessons || []), {
      title: `Lesson ${(course.lessons?.length || 0) + 1}`,
      description: '',
      type: 'video',
      estimated_duration: 30
    }];
    base44.entities.Course.update(courseId, { lessons }).then(() => {
      queryClient.invalidateQueries(['courseDetail', courseId]);
      toast.success('New lesson added');
    });
  };

  if (isLoading) return (
    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
  );

  if (!course) return (
    <Card className="bg-white"><CardContent className="p-8 text-center text-slate-400">Course not found</CardContent></Card>
  );

  return (
    <div className="space-y-6">
      {/* Course Details */}
      <Card className="bg-white border border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-slate-800">
            <Edit3 className="w-4 h-4 text-blue-600" />
            Course Details
            {dirty && <Badge className="bg-amber-100 text-amber-700 text-xs ml-auto">Unsaved changes</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {courseForm && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Course Title</label>
                <Input
                  value={courseForm.title}
                  onChange={(e) => setCourseForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Description</label>
                <Textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm(f => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Level</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm(f => ({ ...f, level: e.target.value }))}
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Category</label>
                  <Input
                    value={courseForm.category}
                    onChange={(e) => setCourseForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="e.g., Technology"
                  />
                </div>
              </div>
              <Button
                onClick={() => updateCourse.mutate(courseForm)}
                disabled={!dirty || updateCourse.isPending}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {updateCourse.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Course Details
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Lessons */}
      <Card className="bg-white border border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-slate-800">
              <BookOpen className="w-4 h-4 text-purple-600" />
              Lessons ({course.lessons?.length || 0})
            </CardTitle>
            <Button size="sm" variant="outline" onClick={addLesson} className="gap-1">
              <PlusCircle className="w-3 h-3" />
              Add Lesson
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {!course.lessons?.length ? (
            <div className="text-center py-8 text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No lessons yet. Add your first lesson above.</p>
            </div>
          ) : (
            course.lessons.map((lesson, i) => (
              <LessonEditor key={i} lesson={lesson} index={i} onUpdate={updateLesson} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}