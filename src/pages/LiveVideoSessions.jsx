/**
 * Live Video Sessions Page
 * 
 * Manages instructor live video sessions
 * Features scheduling, session management, and recording playback
 * 
 * @page
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Play, Download, Loader2 } from 'lucide-react';
import ScheduleVideoSession from '@/components/collaboration/ScheduleVideoSession';
import LiveSessionManager from '@/components/collaboration/LiveSessionManager';

export default function LiveVideoSessions() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newSessionCreated, setNewSessionCreated] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.Course.filter({ created_by: user.email });
    },
    enabled: !!user
  });

  const { data: sessions = [], isLoading: sessionsLoading, refetch } = useQuery({
    queryKey: ['live-sessions', selectedCourse],
    queryFn: async () => {
      if (!selectedCourse || !user) return [];
      return base44.entities.LiveQASession.filter({
        course_id: selectedCourse,
        instructor_email: user.email
      });
    },
    enabled: !!selectedCourse && !!user
  });

  const handleSessionCreated = async () => {
    setNewSessionCreated(true);
    await refetch();
    setTimeout(() => setNewSessionCreated(false), 3000);
  };

  const getSessionStats = () => {
    return {
      total: sessions.length,
      scheduled: sessions.filter(s => s.status === 'scheduled').length,
      live: sessions.filter(s => s.status === 'live').length,
      completed: sessions.filter(s => s.status === 'ended').length
    };
  };

  const stats = getSessionStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0618] via-[#1a0a2e] to-[#0f0618] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Live Video Sessions</h1>
          <p className="text-gray-400">Schedule, manage, and record live instructor-led sessions</p>
        </div>

        {/* Stats */}
        {selectedCourse && (
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="card-glow">
              <CardContent className="p-4">
                <div className="text-sm text-gray-400 mb-1">Total Sessions</div>
                <div className="text-3xl font-bold text-cyan-400">{stats.total}</div>
              </CardContent>
            </Card>
            <Card className="card-glow">
              <CardContent className="p-4">
                <div className="text-sm text-gray-400 mb-1">Scheduled</div>
                <div className="text-3xl font-bold text-yellow-400">{stats.scheduled}</div>
              </CardContent>
            </Card>
            <Card className="card-glow">
              <CardContent className="p-4">
                <div className="text-sm text-gray-400 mb-1">Live Now</div>
                <div className="text-3xl font-bold text-purple-400">{stats.live}</div>
              </CardContent>
            </Card>
            <Card className="card-glow">
              <CardContent className="p-4">
                <div className="text-sm text-gray-400 mb-1">Completed</div>
                <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Course Selection */}
        <Card className="card-glow">
          <CardContent className="p-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">Select Course</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {coursesLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              ) : courses.length === 0 ? (
                <p className="text-gray-400">No courses found. Create a course first.</p>
              ) : (
                courses.map(course => (
                  <Button
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    variant={selectedCourse === course.id ? 'default' : 'outline'}
                    className={selectedCourse === course.id ? 'btn-primary' : 'border-cyan-500/30'}
                  >
                    {course.title}
                  </Button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {selectedCourse && (
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1a0a2e]/50">
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule New
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Manage Sessions
              </TabsTrigger>
            </TabsList>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-4">
              {newSessionCreated && (
                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-green-300">
                  ✓ Session scheduled successfully!
                </div>
              )}
              <ScheduleVideoSession
                courseId={selectedCourse}
                onSessionCreated={handleSessionCreated}
              />
            </TabsContent>

            {/* Manage Tab */}
            <TabsContent value="manage" className="space-y-4">
              {sessionsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
                  <p className="text-gray-400">Loading sessions...</p>
                </div>
              ) : sessions.length === 0 ? (
                <Card className="card-glow">
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No sessions scheduled yet.</p>
                    <p className="text-sm text-gray-500 mt-2">Create your first live session using the Schedule tab.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sessions.map(session => (
                    <LiveSessionManager
                      key={session.id}
                      session={session}
                      isInstructor={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}