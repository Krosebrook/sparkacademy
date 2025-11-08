import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Video, PlayCircle, Calendar, TrendingUp, Award } from 'lucide-react';
import { UploadFile } from '@/integrations/Core';

export default function TimeCapsule() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [timeCapsules, setTimeCapsules] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [reflection, setReflection] = useState({
    text_reflection: '',
    goals: [''],
    current_knowledge_level: 5
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const userCourses = await base44.entities.Course.filter({ is_published: true });
      setCourses(userCourses);

      const userEnrollments = await base44.entities.Enrollment.filter({ student_email: userData.email });
      setEnrollments(userEnrollments);

      const capsules = await base44.entities.TimeCapsule.filter({ user_email: userData.email });
      setTimeCapsules(capsules);
    } catch (error) {
      console.error('Error loading time capsule data:', error);
    }
  };

  const startTimeCapsule = async (courseId) => {
    try {
      const course = courses.find(c => c.id === courseId);
      const capsule = await base44.entities.TimeCapsule.create({
        user_email: user.email,
        course_id: courseId,
        course_title: course.title,
        start_reflection: {
          text_reflection: reflection.text_reflection,
          goals: reflection.goals.filter(g => g.trim()),
          current_knowledge_level: reflection.current_knowledge_level,
          recorded_date: new Date().toISOString()
        },
        milestones: [],
        is_completed: false
      });

      setTimeCapsules([...timeCapsules, capsule]);
      setReflection({ text_reflection: '', goals: [''], current_knowledge_level: 5 });
      alert('Time capsule created! Start your learning journey!');
    } catch (error) {
      console.error('Error creating time capsule:', error);
      alert('Failed to create time capsule');
    }
  };

  const completeTimeCapsule = async (capsuleId, endReflection) => {
    try {
      await base44.entities.TimeCapsule.update(capsuleId, {
        end_reflection: {
          ...endReflection,
          recorded_date: new Date().toISOString()
        },
        is_completed: true
      });

      loadData();
      alert('Time capsule completed! Check back for your learning journey video!');
    } catch (error) {
      console.error('Error completing time capsule:', error);
      alert('Failed to complete time capsule');
    }
  };

  const addGoal = () => {
    setReflection({
      ...reflection,
      goals: [...reflection.goals, '']
    });
  };

  const updateGoal = (index, value) => {
    const newGoals = [...reflection.goals];
    newGoals[index] = value;
    setReflection({ ...reflection, goals: newGoals });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-500" />
            Learning Time Capsule
          </h1>
          <p className="text-slate-600 mt-2">
            Record your journey and see how much you've grown
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create New Time Capsule */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PlayCircle className="w-5 h-5 text-amber-500" />
                Start New Time Capsule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Select Course</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Your Starting Reflection
                </label>
                <Textarea
                  value={reflection.text_reflection}
                  onChange={(e) => setReflection({ ...reflection, text_reflection: e.target.value })}
                  placeholder="How do you feel about starting this course? What are your expectations?"
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Your Goals</label>
                {reflection.goals.map((goal, idx) => (
                  <Input
                    key={idx}
                    value={goal}
                    onChange={(e) => updateGoal(idx, e.target.value)}
                    placeholder={`Goal ${idx + 1}`}
                    className="mb-2"
                  />
                ))}
                <Button variant="outline" size="sm" onClick={addGoal} className="w-full">
                  + Add Goal
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Current Knowledge Level: {reflection.current_knowledge_level}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={reflection.current_knowledge_level}
                  onChange={(e) => setReflection({ ...reflection, current_knowledge_level: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <Button
                onClick={() => startTimeCapsule(selectedCourse)}
                disabled={!selectedCourse || !reflection.text_reflection}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
              >
                Create Time Capsule
              </Button>
            </CardContent>
          </Card>

          {/* Active Time Capsules */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Your Time Capsules</h2>
            {timeCapsules.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No time capsules yet. Create your first one!</p>
                </CardContent>
              </Card>
            ) : (
              timeCapsules.map(capsule => (
                <Card key={capsule.id} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-800">{capsule.course_title}</h3>
                        <p className="text-xs text-slate-500">
                          Started {new Date(capsule.start_reflection.recorded_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={capsule.is_completed ? 'default' : 'secondary'}>
                        {capsule.is_completed ? 'Completed' : 'In Progress'}
                      </Badge>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium text-slate-700">Starting Knowledge</p>
                        <p className="text-slate-600">Level {capsule.start_reflection.current_knowledge_level}/10</p>
                      </div>

                      <div>
                        <p className="font-medium text-slate-700">Goals</p>
                        <ul className="text-slate-600 space-y-1">
                          {capsule.start_reflection.goals.map((goal, idx) => (
                            <li key={idx}>• {goal}</li>
                          ))}
                        </ul>
                      </div>

                      {capsule.is_completed && capsule.end_reflection && (
                        <div className="pt-3 border-t">
                          <p className="font-medium text-slate-700 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            Growth
                          </p>
                          <p className="text-slate-600">
                            Knowledge increased to Level {capsule.end_reflection.final_knowledge_level}/10
                          </p>
                          {capsule.journey_video_url && (
                            <Button variant="outline" size="sm" className="mt-2 w-full">
                              <Video className="w-4 h-4 mr-2" />
                              Watch Journey Video
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {!capsule.is_completed && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => {
                          const enrollment = enrollments.find(e => e.course_id === capsule.course_id);
                          if (enrollment && enrollment.completion_percentage === 100) {
                            // Show form to complete capsule
                            const endReflection = {
                              text_reflection: prompt('How do you feel after completing this course?'),
                              achievements: [],
                              final_knowledge_level: parseInt(prompt('Rate your current knowledge level (1-10):'))
                            };
                            completeTimeCapsule(capsule.id, endReflection);
                          } else {
                            alert('Complete the course first to close your time capsule!');
                          }
                        }}
                      >
                        Complete Time Capsule
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}