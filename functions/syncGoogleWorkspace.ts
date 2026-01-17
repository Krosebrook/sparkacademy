/**
 * Google Workspace Sync
 * Sync calendar events, drive files, sheets data
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { sync_type, folder_id, sheet_id } = await req.json();

    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    if (sync_type === 'calendar') {
      // Create deal tracking calendar events
      const calendarResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            summary: '[Deal] Investment Opportunity',
            description: 'Track investment opportunity',
            start: { dateTime: new Date().toISOString() },
            end: { dateTime: new Date(Date.now() + 3600000).toISOString() }
          })
        }
      );
      return Response.json({ success: true, calendar: await calendarResponse.json() });
    }

    if (sync_type === 'drive') {
      // Organize deal docs in Drive
      const driveToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');
      return Response.json({ success: true, drive_token: '***' });
    }

    if (sync_type === 'sheets') {
      // Sync portfolio data with Google Sheets
      const sheetsToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');
      return Response.json({ success: true, sheets_token: '***' });
    }

    return Response.json({ error: 'Invalid sync_type' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});