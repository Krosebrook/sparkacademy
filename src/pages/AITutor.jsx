import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import EnhancedAITutor from '@/components/learning/EnhancedAITutor';

export default function AITutor() {
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { data: courses = [] } = useQuery({
    queryKey: ['my-courses'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Enrollment.filter({ student_email: user.email });
    }
  });

  const { data: course } = useQuery({
    queryKey: ['course', selectedCourse],
    queryFn: () => base44.entities.Course.get(selectedCourse),
    enabled: !!selectedCourse
  });



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0618] via-[#1a0a2e] to-[#0f0618] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text">AI Learning Assistant</h1>
            <p className="text-gray-400">Your intelligent tutor with proactive support</p>
          </div>
          <div className="w-64">
            <Select value={selectedCourse || ''} onValueChange={setSelectedCourse}>
              <SelectTrigger className="bg-[#1a0a2e] border-cyan-500/30">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((enrollment) => (
                  <SelectItem key={enrollment.course_id} value={enrollment.course_id}>
                    Course
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <EnhancedAITutor courseId={selectedCourse} currentLesson={course?.lessons?.[0]} />
      </div>
    </div>
  );
}