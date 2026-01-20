import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { topic, key_benefits, target_audience } = await req.json();
    
    if (!topic?.trim()) {
      return Response.json({ error: 'Topic is required' }, { status: 400 });
    }

    const audienceMap = {
      'absolute_beginners': 'absolute beginners',
      'beginners': 'beginners',
      'intermediate': 'intermediate learners',
      'advanced': 'advanced learners',
      'professionals': 'working professionals'
    };

    const audienceDescription = audienceMap[target_audience] || 'learners';

    const prompt = `Generate 4 different course descriptions for: "${topic}"

Target Audience: ${audienceDescription}
${key_benefits ? `Key Benefits: ${key_benefits}` : ''}

Create descriptions optimized for these platforms:

1. MARKETING PAGE (200-250 words):
   - Engaging, conversion-focused
   - Highlight transformation and outcomes
   - Use persuasive language
   - Include clear value proposition
   - Call-to-action friendly

2. INTERNAL CATALOG (100-150 words):
   - Professional, informative tone
   - Focus on learning outcomes
   - Clear structure overview
   - Prerequisites and requirements
   - Concise and scannable

3. EMAIL CAMPAIGN (150-200 words):
   - Personal, conversational tone
   - Create urgency or excitement
   - Highlight quick wins
   - Address pain points
   - Include emotional appeal

4. SOCIAL MEDIA (50-100 words):
   - Punchy, attention-grabbing
   - Use active voice
   - Include emojis where appropriate
   - Create curiosity
   - Hashtag-friendly format

Ensure each description:
- Is unique and platform-optimized
- Highlights benefits over features
- Speaks directly to the target audience
- Creates excitement about learning
- Maintains professional quality`;

    const schema = {
      type: "object",
      properties: {
        marketing_page: { type: "string" },
        internal_catalog: { type: "string" },
        email_campaign: { type: "string" },
        social_media: { type: "string" }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    return Response.json(result);
  } catch (error) {
    console.error('Course description generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});