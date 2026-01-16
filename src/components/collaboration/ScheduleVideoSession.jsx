/**
 * Schedule Video Session Component
 * 
 * Form for scheduling live video sessions
 * Integrates with Google Calendar via connector
 * 
 * @component
 * @param {function} onSessionCreated - Callback when session is created
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ScheduleVideoSession({ courseId, onSessionCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_time: '',
    duration_minutes: 60,
    max_participants: 100
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' || name === 'max_participants' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const user = await base44.auth.me();

      // Create session in database
      const session = await base44.entities.LiveQASession.create({
        course_id: courseId,
        instructor_email: user.email,
        title: formData.title,
        description: formData.description,
        scheduled_time: new Date(formData.scheduled_time).toISOString(),
        duration_minutes: formData.duration_minutes,
        status: 'scheduled',
        questions: [],
        participants: []
      });

      // Add to Google Calendar if connected
      try {
        const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');
        const eventStart = new Date(formData.scheduled_time);
        const eventEnd = new Date(eventStart.getTime() + formData.duration_minutes * 60000);

        await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            summary: `[Video Session] ${formData.title}`,
            description: `${formData.description}\n\nThis session will include video conferencing, Q&A, and real-time collaboration.`,
            start: { dateTime: eventStart.toISOString() },
            end: { dateTime: eventEnd.toISOString() },
            conferenceData: {
              conferenceSolution: {
                key: { conferenceSolutionKey: { conferenceTechnology: 'OTHER' } }
              }
            }
          })
        });
      } catch (calendarError) {
        console.log('Calendar sync skipped (not connected):', calendarError);
      }

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        scheduled_time: '',
        duration_minutes: 60,
        max_participants: 100
      });

      if (onSessionCreated) {
        onSessionCreated(session);
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(err.message || 'Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-cyan-400" />
          Schedule Live Video Session
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Session Title
            </label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Week 3 Q&A Session"
              required
              className="bg-[#1a0a2e] border-cyan-500/30"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Session overview and topics to be covered..."
              className="bg-[#1a0a2e] border-cyan-500/30 h-24"
            />
          </div>

          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date & Time
              </label>
              <Input
                type="datetime-local"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleChange}
                required
                className="bg-[#1a0a2e] border-cyan-500/30"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <Input
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                min="15"
                max="480"
                className="bg-[#1a0a2e] border-cyan-500/30"
              />
            </div>
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Participants
            </label>
            <Input
              type="number"
              name="max_participants"
              value={formData.max_participants}
              onChange={handleChange}
              min="2"
              max="300"
              className="bg-[#1a0a2e] border-cyan-500/30"
            />
          </div>

          {/* Status Messages */}
          {success && (
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-300">Session scheduled successfully!</p>
                <p className="text-sm text-gray-300 mt-1">Added to calendar and will be available to students.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-300">Error</p>
                <p className="text-sm text-gray-300 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Session
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}