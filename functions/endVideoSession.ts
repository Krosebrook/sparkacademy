/**
 * End Video Session
 * 
 * Ends a Daily.co video session and retrieves recording information
 * Updates session status and stores recording metadata
 * 
 * @param {Object} req - Request object
 * @returns {Object} Recording details and session closure confirmation
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, roomName } = await req.json();

    if (!roomName) {
      return Response.json({ error: 'Room name required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('DAILY_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Daily.co API key not configured' }, { status: 500 });
    }

    // Get room details (includes recordings if available)
    const roomResponse = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    let recordingUrl = null;
    if (roomResponse.ok) {
      const room = await roomResponse.json();
      // Check for recordings
      if (room.data?.properties?.recordings) {
        recordingUrl = room.data.properties.recordings[0]?.download_link;
      }
    }

    // Delete room to prevent further access
    const deleteResponse = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!deleteResponse.ok) {
      console.error('Failed to delete room');
    }

    // Update session status
    if (sessionId) {
      await base44.asServiceRole.entities.LiveQASession.update(sessionId, {
        status: 'ended',
        recording_url: recordingUrl,
        ended_at: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      message: 'Session ended successfully',
      recordingUrl
    });
  } catch (error) {
    console.error('Error ending video session:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});