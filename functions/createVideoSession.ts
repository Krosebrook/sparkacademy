/**
 * Create Video Session
 * 
 * Creates a Daily.co video room for live instructor sessions
 * Handles recording configuration and access tokens
 * 
 * @param {Object} req - Request object
 * @returns {Object} Room details and access token
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, sessionId, roomName, isRecording, maxParticipants = 100, duration = 120 } = await req.json();

    const apiKey = Deno.env.get('DAILY_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Daily.co API key not configured' }, { status: 500 });
    }

    // Create room with Daily.co
    const roomResponse = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: roomName || `session-${Date.now()}`,
        properties: {
          enable_knocking: false,
          enable_screenshare: true,
          enable_chat: true,
          max_participants: maxParticipants,
          exp: Math.floor(Date.now() / 1000) + (duration * 60),
          enable_recording: isRecording ? 'cloud' : 'none'
        }
      })
    });

    if (!roomResponse.ok) {
      const error = await roomResponse.text();
      console.error('Daily.co error:', error);
      return Response.json({ error: 'Failed to create room' }, { status: 500 });
    }

    const room = await roomResponse.json();

    // Generate access token
    const tokenResponse = await fetch(`https://api.daily.co/v1/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          room_name: room.name,
          is_owner: true,
          user_name: user.full_name,
          user_id: user.email
        }
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token generation error:', error);
      return Response.json({ error: 'Failed to generate token' }, { status: 500 });
    }

    const token = await tokenResponse.json();

    // Store session in database
    if (sessionId) {
      await base44.asServiceRole.entities.LiveQASession.update(sessionId, {
        video_room_url: room.url,
        video_room_name: room.name,
        video_session_token: token.token,
        status: 'live'
      });
    }

    return Response.json({
      success: true,
      room: {
        name: room.name,
        url: room.url,
        roomToken: token.token,
        roomId: room.id
      }
    });
  } catch (error) {
    console.error('Error creating video session:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});