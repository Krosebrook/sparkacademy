import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { confusion_topic, learning_style, course_context } = await req.json();
    
    if (!confusion_topic?.trim()) {
      return Response.json({ error: 'Confusion topic is required' }, { status: 400 });
    }

    const styleGuidance = {
      visual: 'Focus on diagrams, flowcharts, infographics, video tutorials, and visual code examples',
      auditory: 'Focus on podcasts, audio explanations, discussion prompts, and verbal walkthroughs',
      kinesthetic: 'Focus on hands-on exercises, interactive coding challenges, and practical projects',
      reading_writing: 'Focus on detailed written guides, documentation, and text-based tutorials'
    };

    const guidance = styleGuidance[learning_style?.toLowerCase()] || styleGuidance.visual;

    const prompt = `Generate personalized learning resources for a student confused about: "${confusion_topic}"

Course Context: ${course_context || 'General programming'}
Learning Style: ${learning_style} - ${guidance}

Create 5-7 supplementary resources tailored to their learning style:
1. Resource title
2. Resource type (video/article/interactive/diagram/exercise/audio)
3. Description (what it covers, why it helps)
4. URL or creation instructions (if creating custom content)
5. Estimated time to complete
6. Difficulty level
7. Why this matches their learning style

Ensure resources:
- Are highly relevant to the confusion point
- Match the student's learning style
- Progress from foundational to advanced
- Include both explanations and practice
- Are from reputable sources (or mark as "Create custom")`;

    const schema = {
      type: "object",
      properties: {
        resources: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              type: { type: "string" },
              description: { type: "string" },
              url_or_instructions: { type: "string" },
              estimated_time: { type: "string" },
              difficulty: { type: "string" },
              learning_style_match: { type: "string" }
            }
          }
        },
        personalized_explanation: { type: "string" }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(result);
  } catch (error) {
    console.error('Resource generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});