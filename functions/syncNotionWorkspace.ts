/**
 * Notion Integration
 * Sync deals, portfolio, and research to Notion workspace
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { action, page_title, content, database_id } = await req.json();

    const notionToken = await base44.asServiceRole.connectors.getAccessToken('notion');

    if (action === 'create_deal') {
      // Create deal entry in Notion
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notionToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          parent: { database_id: database_id || 'main-deals' },
          properties: {
            'Title': { title: [{ text: { content: page_title } }] },
            'Status': { status: { name: 'New' } },
            'Investor': { people: [{ object: 'user', id: user.id }] }
          },
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: { text: [{ text: { content: content } }] }
            }
          ]
        })
      });

      return Response.json({ success: true, notion_page: await response.json() });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});