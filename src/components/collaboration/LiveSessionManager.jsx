/**
 * Live Session Manager Component
 * 
 * Manages live video sessions with integrated Q&A
 * Handles session state, participant management, and recording
 * 
 * @component
 * @param {Object} session - Session data from LiveQASession entity
 * @param {boolean} isInstructor - Whether user is the instructor
 */

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageCircle, Play, StopCircle, Clock } from 'lucide-react';
import VideoConferencing from './VideoConferencing';
import LiveQAPanel from './LiveQAPanel';

export default function LiveSessionManager({ session, isInstructor = false }) {
  const [sessionState, setSessionState] = useState(session.status || 'scheduled');
  const [participants, setParticipants] = useState(session.participants || []);
  const [roomToken, setRoomToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate time until session
  const getTimeRemaining = () => {
    const now = new Date();
    const sessionTime = new Date(session.scheduled_time);
    const diff = sessionTime - now;

    if (diff < 0) return 'Session has started';
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    return `${hours}h ${minutes}m remaining`;
  };

  const startSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('createVideoSession', {
        courseId: session.course_id,
        sessionId: session.id,
        roomName: `session-${session.id}`,
        isRecording: true,
        duration: session.duration_minutes
      });

      setRoomToken(response.data.room.roomToken);
      setSessionState('live');
    } catch (err) {
      console.error('Failed to start session:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await base44.functions.invoke('endVideoSession', {
        sessionId: session.id,
        roomName: `session-${session.id}`
      });

      setSessionState('ended');
      setRoomToken(null);
    } catch (err) {
      console.error('Failed to end session:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionState === 'scheduled') {
    return (
      <Card className="card-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{session.title}</CardTitle>
              <p className="text-gray-400 text-sm mt-2">{session.description}</p>
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-300">Scheduled</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#0f0618]/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-400">Time Until Session</span>
              </div>
              <p className="text-xl font-semibold text-cyan-300">{getTimeRemaining()}</p>
            </div>

            <div className="p-4 bg-[#0f0618]/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Max Participants</span>
              </div>
              <p className="text-xl font-semibold text-purple-300">{session.max_participants || 100}</p>
            </div>
          </div>

          {isInstructor && (
            <Button
              onClick={startSession}
              disabled={isLoading}
              className="btn-primary w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              {isLoading ? 'Starting...' : 'Start Session'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (sessionState === 'live') {
    return (
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300">
            {error}
          </div>
        )}

        <Tabs defaultValue="video" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a0a2e]/50">
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="qa" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Q&A
            </TabsTrigger>
          </TabsList>

          <TabsContent value="video" className="space-y-4">
            {roomToken && (
              <VideoConferencing
                roomToken={roomToken}
                roomName={`session-${session.id}`}
                isOwner={isInstructor}
                options={{ userName: session.instructor_email }}
              />
            )}

            {isInstructor && (
              <Button
                onClick={endSession}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 w-full"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                {isLoading ? 'Ending...' : 'End Session'}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="qa">
            <LiveQAPanel
              session={session}
              isInstructor={isInstructor}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Session Ended
  return (
    <Card className="card-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{session.title}</CardTitle>
            <p className="text-gray-400 text-sm mt-2">Session has ended</p>
          </div>
          <Badge className="bg-green-500/20 text-green-300">Completed</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {session.recording_url && (
          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <h3 className="font-semibold text-green-300 mb-2">Recording Available</h3>
            <p className="text-sm text-gray-300 mb-3">This session was recorded and is available for review.</p>
            <Button
              onClick={() => window.open(session.recording_url, '_blank')}
              className="btn-primary"
            >
              View Recording
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}