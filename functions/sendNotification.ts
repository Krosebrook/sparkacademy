/**
 * Multi-Channel Notifications
 * Send notifications via Email, Slack, and in-app
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    const { 
      notification_type, 
      recipient_email,
      title, 
      message, 
      channels = ['email'], 
      metadata = {} 
    } = await req.json();

    const results = {
      email: null,
      slack: null,
      inapp: null
    };

    // Email notification
    if (channels.includes('email')) {
      try {
        await base44.integrations.Core.SendEmail({
          to: recipient_email || user.email,
          subject: title,
          body: message
        });
        results.email = 'sent';
      } catch (e) {
        results.email = `failed: ${e.message}`;
      }
    }

    // Slack notification
    if (channels.includes('slack') && Deno.env.get('SLACK_BOT_TOKEN')) {
      try {
        const slackPayload = {
          text: title,
          blocks: [
            { type: 'header', text: { type: 'plain_text', text: title } },
            { type: 'section', text: { type: 'mrkdwn', text: message } }
          ]
        };

        const slackResponse = await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SLACK_BOT_TOKEN')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            channel: metadata.slack_channel || '#notifications',
            ...slackPayload
          })
        });
        results.slack = slackResponse.ok ? 'sent' : 'failed';
      } catch (e) {
        results.slack = `failed: ${e.message}`;
      }
    }

    // In-app notification
    if (channels.includes('inapp')) {
      try {
        await base44.entities.Notification?.create({
          user_email: recipient_email || user.email,
          title,
          message,
          type: notification_type,
          read: false,
          created_date: new Date().toISOString()
        }).catch(() => {});
        results.inapp = 'created';
      } catch (e) {
        results.inapp = `failed: ${e.message}`;
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});