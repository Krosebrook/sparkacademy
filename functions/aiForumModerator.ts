import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { forumThreadId, action } = await req.json();

    const thread = await base44.entities.InstructorForum.filter({ id: forumThreadId });
    if (!thread[0]) {
      return Response.json({ error: 'Thread not found' }, { status: 404 });
    }

    const threadData = thread[0];
    const fullDiscussion = `
Topic: ${threadData.topic}
Category: ${threadData.category}
Original Post: ${threadData.content}

Replies:
${threadData.replies?.map(r => `${r.author_email}: ${r.content}`).join('\n\n')}
    `.trim();

    let prompt, schema;

    if (action === 'summarize') {
      prompt = `Summarize this instructor forum discussion, highlighting key insights and actionable takeaways:\n\n${fullDiscussion}`;
      schema = {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          key_insights: { type: 'array', items: { type: 'string' } },
          actionable_takeaways: { type: 'array', items: { type: 'string' } },
          consensus_points: { type: 'array', items: { type: 'string' } }
        }
      };
    } else if (action === 'suggest_resources') {
      prompt = `Based on this instructor discussion, suggest relevant resources, research, and best practices:\n\n${fullDiscussion}`;
      schema = {
        type: 'object',
        properties: {
          recommended_resources: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                type: { type: 'string' },
                description: { type: 'string' },
                relevance: { type: 'string' }
              }
            }
          },
          research_insights: { type: 'array', items: { type: 'string' } },
          best_practices: { type: 'array', items: { type: 'string' } }
        }
      };
    } else if (action === 'find_similar') {
      // Find similar discussions
      const allThreads = await base44.asServiceRole.entities.InstructorForum.list();
      prompt = `Analyze this discussion and identify which of these other threads are most related:\n\nCurrent: ${threadData.topic}\n\nOther threads: ${allThreads.filter(t => t.id !== forumThreadId).map(t => `ID: ${t.id}, Topic: ${t.topic}, Category: ${t.category}`).join('\n')}`;
      schema = {
        type: 'object',
        properties: {
          similar_threads: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                thread_id: { type: 'string' },
                relevance_score: { type: 'number' },
                reason: { type: 'string' }
              }
            }
          }
        }
      };
    } else {
      // Generate insights
      prompt = `Provide AI-powered insights for this instructor forum discussion:\n\n${fullDiscussion}\n\nInclude: expert perspectives, research-backed suggestions, common pitfalls, and innovative approaches.`;
      schema = {
        type: 'object',
        properties: {
          expert_perspective: { type: 'string' },
          research_backed_suggestions: { type: 'array', items: { type: 'string' } },
          common_pitfalls: { type: 'array', items: { type: 'string' } },
          innovative_approaches: { type: 'array', items: { type: 'string' } }
        }
      };
    }

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: schema
    });

    // Add AI insight to thread
    await base44.entities.InstructorForum.update(forumThreadId, {
      ai_insights: [
        ...(threadData.ai_insights || []),
        {
          timestamp: new Date().toISOString(),
          insight_type: action,
          content: JSON.stringify(aiResponse),
          sources: ['AI Analysis']
        }
      ]
    });

    return Response.json({ insight: aiResponse });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});