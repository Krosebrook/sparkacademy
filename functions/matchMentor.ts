import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { learningGoals, skillLevel, preferredTopics } = await req.json();

    // Get available mentors
    const mentorProfiles = await base44.asServiceRole.entities.MentorProfile.filter({
      is_available: true
    });

    // Use AI to match best mentors
    const matchResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `As a mentorship matching expert, analyze these mentors and recommend the best matches.

**Mentee Profile:**
- Learning Goals: ${learningGoals}
- Current Skill Level: ${skillLevel}
- Interested Topics: ${preferredTopics.join(', ')}

**Available Mentors:**
${JSON.stringify(mentorProfiles.map(m => ({
  email: m.mentor_email,
  expertise: m.expertise_areas,
  bio: m.bio,
  rating: m.average_rating,
  availability: m.availability,
  current_mentees: m.total_mentees
})), null, 2)}

Recommend top 3-5 mentors with:
1. Match score (0-100)
2. Reasons for the match
3. Potential learning outcomes
4. Suggested focus areas`,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                mentor_email: { type: "string" },
                match_score: { type: "number" },
                reasons: { type: "array", items: { type: "string" } },
                suggested_focus_areas: { type: "array", items: { type: "string" } },
                expected_outcomes: { type: "array", items: { type: "string" } }
              }
            }
          }
        },
        required: ["recommendations"]
      }
    });

    // Enrich with full mentor data
    const enrichedRecommendations = matchResponse.recommendations.map(rec => {
      const mentor = mentorProfiles.find(m => m.mentor_email === rec.mentor_email);
      return { ...rec, mentorProfile: mentor };
    });

    return Response.json({
      success: true,
      recommendations: enrichedRecommendations
    });

  } catch (error) {
    console.error('Error matching mentor:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});