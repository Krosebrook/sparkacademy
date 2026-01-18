import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, max_tokens = 500 } = await req.json();

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: null
    });

    return Response.json({ 
      success: true, 
      response: result 
    });
  } catch (error) {
    console.error('AI response error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});