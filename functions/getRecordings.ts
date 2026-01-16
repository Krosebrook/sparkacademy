/**
 * Get Recordings
 * 
 * Retrieves all recordings for a Daily.co room
 * Filters by course/session if needed
 * 
 * @param {Object} req - Request object
 * @returns {Object} List of recordings
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomName } = await req.json();

    const apiKey = Deno.env.get('DAILY_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Daily.co API key not configured' }, { status: 500 });
    }

    // Get all recordings for the room
    const recordingsResponse = await fetch(`https://api.daily.co/v1/recordings?room_name=${roomName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!recordingsResponse.ok) {
      return Response.json({ error: 'Failed to fetch recordings' }, { status: 500 });
    }

    const data = await recordingsResponse.json();
    const recordings = data.data || [];

    return Response.json({
      success: true,
      recordings: recordings.map(r => ({
        id: r.id,
        startTime: r.start_ts,
        duration: r.duration,
        downloadLink: r.download_link,
        size: r.filesize,
        status: r.status
      }))
    });
  } catch (error) {
    console.error('Error fetching recordings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});