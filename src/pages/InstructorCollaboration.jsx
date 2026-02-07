import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileEdit, Star, MessageSquare } from 'lucide-react';
import AICoauthoringPanel from '@/components/collaboration/AICoauthoringPanel';
import PeerReviewPanel from '@/components/collaboration/PeerReviewPanel';
import InstructorForumAI from '@/components/collaboration/InstructorForumAI';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function InstructorCollaboration() {
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: courses } = useQuery({
    queryKey: ['instructorCourses'],
    queryFn: async () => {
      const all = await base44.entities.Course.list();
      return all.filter(c => c.created_by === user?.email);
    },
    enabled: !!user?.email
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Collaboration</h1>
          <p className="text-gray-600 mt-1">AI-powered co-authoring, peer review, and community forums</p>
        </div>

        {/* Course Selection */}
        {courses?.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Select Course (for co-authoring & review)</label>
              <select
                value={selectedCourse || ''}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Choose a course...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="forum" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
            <TabsTrigger value="forum" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Instructor Forums
            </TabsTrigger>
            <TabsTrigger value="coauthor" className="flex items-center gap-2">
              <FileEdit className="w-4 h-4" />
              AI Co-Authoring
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Peer Review
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forum" className="space-y-6">
            <InstructorForumAI />
          </TabsContent>

          <TabsContent value="coauthor" className="space-y-6">
            {selectedCourse ? (
              <AICoauthoringPanel
                documentId={selectedCourse}
                currentContent="Your course content here..."
                onContentUpdate={(content) => console.log('Updated:', content)}
              />
            ) : (
              <Card className="bg-white">
                <CardContent className="p-12 text-center">
                  <FileEdit className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Select a course to use AI co-authoring</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            {selectedCourse ? (
              <PeerReviewPanel courseId={selectedCourse} />
            ) : (
              <Card className="bg-white">
                <CardContent className="p-12 text-center">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Select a course to generate peer review</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}