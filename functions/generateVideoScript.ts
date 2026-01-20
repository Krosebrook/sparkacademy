import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { module_topic, key_points, target_duration_minutes = 10 } = await req.json();
    
    if (!module_topic?.trim()) {
      return Response.json({ error: 'Module topic is required' }, { status: 400 });
    }

    const duration = Math.max(5, Math.min(parseInt(target_duration_minutes) || 10, 60));

    const prompt = `Create a professional video script for: "${module_topic}"

Target Duration: ${duration} minutes
${key_points ? `Key Points to Cover: ${key_points}` : ''}

Generate a complete, production-ready video script with:

1. TITLE: Engaging, descriptive title

2. HOOK (first 30-45 seconds):
   - Grab attention immediately
   - Present the problem or value
   - Create curiosity
   - Include timing

3. MAIN SECTIONS (${duration - 2} minutes total):
   - 3-5 logical sections based on duration
   - Clear section titles
   - Detailed script with natural, conversational language
   - Visual suggestions for each section (what to show on screen)
   - Smooth transitions between sections
   - Include timing for each section

4. CALL TO ACTION (30-45 seconds):
   - Summarize key takeaways
   - Next steps or application
   - Engagement prompt (comment, practice, etc.)

5. PRODUCTION NOTES:
   - Pacing guidance
   - Tone recommendations
   - B-roll suggestions
   - Graphics/animations needed

Format the script for easy reading by an instructor. Use natural, engaging language. Include [pause], [emphasis], and [screen] cues where helpful.`;

    const schema = {
      type: "object",
      properties: {
        title: { type: "string" },
        estimated_duration: { type: "string" },
        target_audience: { type: "string" },
        hook: {
          type: "object",
          properties: {
            duration: { type: "string" },
            script: { type: "string" }
          }
        },
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              duration: { type: "string" },
              script: { type: "string" },
              visual_suggestions: { type: "array", items: { type: "string" } }
            }
          }
        },
        call_to_action: {
          type: "object",
          properties: {
            duration: { type: "string" },
            script: { type: "string" }
          }
        },
        production_notes: {
          type: "array",
          items: { type: "string" }
        }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(result);
  } catch (error) {
    console.error('Video script error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});